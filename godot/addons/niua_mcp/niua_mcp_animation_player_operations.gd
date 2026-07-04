@tool
extends RefCounted

const NiuaMcpAnimationStateOperations = preload("niua_mcp_animation_state_operations.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpSceneGraphContext = preload("niua_mcp_scene_graph_context.gd")
const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")


static func upsert_animation(editor: EditorInterface, body: Dictionary, path_validator: Callable) -> Dictionary:
	var player_result := _resolve_or_create_player(editor, body)
	if not bool(player_result.get("ok", false)):
		return player_result

	var player: AnimationPlayer = player_result.get("player")
	var animation_name := str(body.get("animationName", "")).strip_edges()
	if animation_name.is_empty():
		return _error("animationName is required")

	var tracks = body.get("tracks", [])
	if typeof(tracks) != TYPE_ARRAY:
		return _error("tracks must be an array")

	var animation := Animation.new()
	animation.length = _animation_length(body, tracks)
	animation.loop_mode = _loop_mode(str(body.get("loopMode", "none")))

	for track in tracks:
		if typeof(track) != TYPE_DICTIONARY:
			return _error("animation track must be an object")
		var track_result := _append_track(animation, track, path_validator)
		if not bool(track_result.get("ok", false)):
			return track_result

	var library := _default_animation_library(player)
	if library.has_animation(animation_name):
		library.remove_animation(animation_name)
	var add_error := library.add_animation(animation_name, animation)
	if add_error != OK or not library.has_animation(animation_name):
		return _error("failed to store animation %s in the player's animation library: error %s (is the animation name a valid library key?)" % [animation_name, add_error])

	# Read-back guarantee: report the animation the library actually stores —
	# length, loop mode, and track count come from the stored resource, not
	# from the request or the locally assembled object.
	var stored: Animation = library.get_animation(animation_name)

	return {
		"ok": true,
		"data": {
			"playerPath": NiuaMcpSceneGraphContext.node_path_for_response(editor, player),
			"animation": animation_name,
			"length": stored.length,
			"loopMode": _loop_mode_name(stored.loop_mode),
			"trackCount": stored.get_track_count(),
			"createdPlayer": bool(player_result.get("created", false))
		}
	}


static func play_animation(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var player := _resolve_animation_player(editor, str(body.get("playerPath", "")))
	if player == null:
		return _error("AnimationPlayer not found: %s" % str(body.get("playerPath", "")), "not_found")

	var animation_name := str(body.get("animationName", "")).strip_edges()
	if animation_name.is_empty():
		return _error("animationName is required")
	if not player.has_animation(animation_name):
		return _error("AnimationPlayer has no animation: %s" % animation_name, "not_found")

	player.play(
		animation_name,
		float(body.get("customBlend", -1.0)),
		float(body.get("customSpeed", 1.0)),
		bool(body.get("fromEnd", false))
	)

	return {
		"ok": true,
		"data": NiuaMcpAnimationStateOperations.player_state(
			player,
			NiuaMcpSceneGraphContext.edited_scene_root(editor),
			editor
		)
	}


static func stop_animation(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var player := _resolve_animation_player(editor, str(body.get("playerPath", "")))
	if player == null:
		return _error("AnimationPlayer not found: %s" % str(body.get("playerPath", "")), "not_found")

	player.stop(bool(body.get("keepState", false)))

	return {
		"ok": true,
		"data": NiuaMcpAnimationStateOperations.player_state(
			player,
			NiuaMcpSceneGraphContext.edited_scene_root(editor),
			editor
		)
	}


static func instance_animated_scene(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var root := NiuaMcpSceneGraphContext.edited_scene_root(editor)
	if root == null:
		return _error("no edited scene is open")

	var scene_path := str(body.get("scenePath", "")).strip_edges()
	var validation := NiuaMcpPathUtils.validate_res_path(scene_path)
	if not bool(validation.get("ok", false)):
		return validation

	var resource := ResourceLoader.load(str(validation.get("path")))
	if resource == null:
		return _error("scene resource could not be loaded: %s" % scene_path, "not_found")
	if not (resource is PackedScene):
		return _error("resource is not an imported PackedScene: %s" % scene_path)

	var parent: Node = root
	var parent_path := str(body.get("parentPath", "")).strip_edges()
	if not parent_path.is_empty():
		parent = NiuaMcpSceneGraphContext.resolve_node(editor, parent_path)
		if parent == null:
			return _error("parent node not found: %s" % parent_path, "not_found")

	var instance := (resource as PackedScene).instantiate()
	if instance == null:
		return _error("scene resource could not be instantiated: %s" % scene_path)

	var desired_name := str(body.get("name", "")).strip_edges()
	if not desired_name.is_empty():
		instance.name = desired_name

	parent.add_child(instance)
	instance.owner = root

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneGraphContext.node_path_for_response(editor, instance),
			"scenePath": str(validation.get("path")),
			"players": NiuaMcpAnimationStateOperations.players_in_subtree(instance, root, editor)
		}
	}


static func _resolve_or_create_player(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var root := NiuaMcpSceneGraphContext.edited_scene_root(editor)
	if root == null:
		return _error("no edited scene is open")

	var player_path := str(body.get("playerPath", "")).strip_edges()
	if not player_path.is_empty():
		var existing := _resolve_animation_player(editor, player_path)
		if existing == null:
			return _error("AnimationPlayer not found: %s" % player_path, "not_found")
		_apply_root_node(existing, body)
		return {
			"ok": true,
			"player": existing,
			"created": false
		}

	var parent: Node = root
	var parent_path := str(body.get("parentPath", "")).strip_edges()
	if not parent_path.is_empty():
		parent = NiuaMcpSceneGraphContext.resolve_node(editor, parent_path)
		if parent == null:
			return _error("parent node not found: %s" % parent_path, "not_found")

	var player_name := str(body.get("playerName", "AnimationPlayer")).strip_edges()
	if player_name.is_empty():
		player_name = "AnimationPlayer"

	var child := parent.get_node_or_null(NodePath(player_name))
	if child is AnimationPlayer:
		_apply_root_node(child as AnimationPlayer, body)
		return {
			"ok": true,
			"player": child,
			"created": false
		}

	var player := AnimationPlayer.new()
	player.name = player_name
	parent.add_child(player)
	player.owner = root
	_apply_root_node(player, body, true)

	return {
		"ok": true,
		"player": player,
		"created": true
	}


static func _apply_root_node(player: AnimationPlayer, body: Dictionary, force_default := false) -> void:
	if body.has("rootNodePath"):
		player.root_node = NodePath(str(body.get("rootNodePath", "")))
	elif force_default or str(player.root_node).is_empty():
		player.root_node = NodePath("..")


static func _append_track(animation: Animation, track: Dictionary, path_validator: Callable) -> Dictionary:
	var target_path := str(track.get("targetPath", "")).strip_edges()
	if target_path.is_empty():
		return _error("track targetPath is required")
	var keyframes = track.get("keyframes", [])
	if typeof(keyframes) != TYPE_ARRAY or keyframes.is_empty():
		return _error("track keyframes must be a non-empty array")

	var track_type_name := str(track.get("type", "value")).strip_edges()
	var track_type := _track_type(track_type_name)
	if track_type < 0:
		return _error("unsupported animation track type: %s" % track_type_name)

	var track_index := animation.add_track(track_type)
	if track_type == Animation.TYPE_VALUE:
		var property := str(track.get("property", "")).strip_edges()
		if property.is_empty():
			return _error("value tracks require property")
		animation.track_set_path(track_index, NodePath("%s:%s" % [target_path, property]))
		animation.value_track_set_update_mode(track_index, _update_mode(str(track.get("updateMode", "continuous"))))
	else:
		animation.track_set_path(track_index, NodePath(target_path))

	animation.track_set_interpolation_type(track_index, _interpolation(str(track.get("interpolation", "linear"))))

	for keyframe in keyframes:
		if typeof(keyframe) != TYPE_DICTIONARY:
			return _error("keyframe must be an object")
		var key_value: Variant = NiuaMcpVariantCodec.json_to_variant(keyframe.get("value"), path_validator)
		# rotation_3d tracks need a Quaternion; also accept a Vector3 of euler radians.
		if track_type == Animation.TYPE_ROTATION_3D and typeof(key_value) == TYPE_VECTOR3:
			key_value = Quaternion.from_euler(key_value)
		var key_index := animation.track_insert_key(
			track_index,
			float(keyframe.get("time", 0.0)),
			key_value,
			float(keyframe.get("transition", 1.0))
		)
		# track_insert_key returns -1 when the value type is wrong for the track,
		# which otherwise silently dropped the keyframe and reported success.
		if key_index < 0:
			return _error("failed to insert keyframe on the %s track at time %s (unsupported value type?)" % [track_type_name, str(keyframe.get("time", 0.0))])

	return { "ok": true }


static func _default_animation_library(player: AnimationPlayer) -> AnimationLibrary:
	if player.has_animation_library(""):
		return player.get_animation_library("")
	var library := AnimationLibrary.new()
	player.add_animation_library("", library)
	return library


static func _resolve_animation_player(editor: EditorInterface, player_path: String) -> AnimationPlayer:
	var node := NiuaMcpSceneGraphContext.resolve_node(editor, player_path)
	if node is AnimationPlayer:
		return node as AnimationPlayer
	return null


static func _animation_length(body: Dictionary, tracks: Array) -> float:
	if body.has("length"):
		return max(0.001, float(body.get("length", 0.001)))

	var last_time := 0.001
	for track in tracks:
		if typeof(track) != TYPE_DICTIONARY:
			continue
		var keyframes = track.get("keyframes", [])
		if typeof(keyframes) != TYPE_ARRAY:
			continue
		for keyframe in keyframes:
			if typeof(keyframe) == TYPE_DICTIONARY:
				last_time = max(last_time, float(keyframe.get("time", 0.0)))
	return last_time


static func _loop_mode(loop_mode: String) -> int:
	match loop_mode:
		"linear":
			return Animation.LOOP_LINEAR
		"pingpong":
			return Animation.LOOP_PINGPONG
		_:
			return Animation.LOOP_NONE


static func _loop_mode_name(loop_mode: int) -> String:
	match loop_mode:
		Animation.LOOP_LINEAR:
			return "linear"
		Animation.LOOP_PINGPONG:
			return "pingpong"
		_:
			return "none"


static func _track_type(track_type: String) -> int:
	match track_type:
		"value":
			return Animation.TYPE_VALUE
		"position_3d":
			return Animation.TYPE_POSITION_3D
		"rotation_3d":
			return Animation.TYPE_ROTATION_3D
		"scale_3d":
			return Animation.TYPE_SCALE_3D
		_:
			return -1


static func _update_mode(update_mode: String) -> int:
	match update_mode:
		"discrete":
			return Animation.UPDATE_DISCRETE
		"capture":
			return Animation.UPDATE_CAPTURE
		_:
			return Animation.UPDATE_CONTINUOUS


static func _interpolation(interpolation: String) -> int:
	match interpolation:
		"nearest":
			return Animation.INTERPOLATION_NEAREST
		"cubic":
			return Animation.INTERPOLATION_CUBIC
		"linear_angle":
			return Animation.INTERPOLATION_LINEAR_ANGLE
		"cubic_angle":
			return Animation.INTERPOLATION_CUBIC_ANGLE
		_:
			return Animation.INTERPOLATION_LINEAR


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
