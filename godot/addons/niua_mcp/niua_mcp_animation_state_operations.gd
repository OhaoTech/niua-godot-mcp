@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpSceneGraphContext = preload("niua_mcp_scene_graph_context.gd")


static func list_animations(editor: EditorInterface, query: Dictionary) -> Dictionary:
	var scene_path := str(query.get("scenePath", "")).strip_edges()
	if not scene_path.is_empty():
		return _list_scene_resource_animations(scene_path)

	var player_path := str(query.get("playerPath", "")).strip_edges()
	if not player_path.is_empty():
		var player := _resolve_animation_player(editor, player_path)
		if player == null:
			return _error("AnimationPlayer not found: %s" % player_path, "not_found")
		return {
			"ok": true,
			"data": {
				"source": "edited_scene",
				"players": [_player_summary(player, NiuaMcpSceneGraphContext.edited_scene_root(editor), editor)]
			}
		}

	var root := NiuaMcpSceneGraphContext.edited_scene_root(editor)
	if root == null:
		return _error("no edited scene is open")

	var node_path := str(query.get("nodePath", "")).strip_edges()
	var scan_root: Node = root
	if not node_path.is_empty():
		scan_root = NiuaMcpSceneGraphContext.resolve_node(editor, node_path)
		if scan_root == null:
			return _error("node not found: %s" % node_path, "not_found")

	return {
		"ok": true,
		"data": {
			"source": "edited_scene",
			"players": players_in_subtree(scan_root, root, editor)
		}
	}


static func get_animation_state(editor: EditorInterface, query: Dictionary) -> Dictionary:
	var player_path := str(query.get("playerPath", "")).strip_edges()
	if player_path.is_empty():
		return _error("AnimationPlayer path is required")

	var player := _resolve_animation_player(editor, player_path)
	if player == null:
		return _error("AnimationPlayer not found: %s" % player_path, "not_found")

	return {
		"ok": true,
		"data": _player_state(player, NiuaMcpSceneGraphContext.edited_scene_root(editor), editor)
	}


static func players_in_subtree(scan_root: Node, response_root: Node, editor: EditorInterface = null) -> Array:
	var players := []
	_collect_players(scan_root, response_root, editor, players)
	return players


static func animation_summaries(player: AnimationPlayer) -> Array:
	var animations := []
	for animation_name in player.get_animation_list():
		var name := str(animation_name)
		var animation := player.get_animation(name)
		var summary := {
			"name": name,
			"length": 0.0,
			"loopMode": "none",
			"trackCount": 0
		}
		if animation != null:
			summary["length"] = animation.length
			summary["loopMode"] = _loop_mode_name(int(animation.loop_mode))
			summary["trackCount"] = animation.get_track_count()
		animations.append(summary)
	return animations


static func player_state(player: AnimationPlayer, response_root: Node, editor: EditorInterface = null) -> Dictionary:
	return _player_state(player, response_root, editor)


static func _list_scene_resource_animations(scene_path: String) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_res_path(scene_path)
	if not bool(validation.get("ok", false)):
		return validation

	var path := str(validation.get("path"))
	var resource := ResourceLoader.load(path)
	if resource == null:
		return _error("scene resource could not be loaded: %s" % path, "not_found")
	if not (resource is PackedScene):
		return _error("resource is not an imported PackedScene: %s" % path)

	var instance := (resource as PackedScene).instantiate()
	if instance == null:
		return _error("scene resource could not be instantiated: %s" % path)

	var players := players_in_subtree(instance, instance)
	instance.free()

	return {
		"ok": true,
		"data": {
			"source": path,
			"imported": true,
			"players": players
		}
	}


static func _collect_players(node: Node, response_root: Node, editor: EditorInterface, players: Array) -> void:
	if node is AnimationPlayer:
		players.append(_player_summary(node as AnimationPlayer, response_root, editor))
	for child in node.get_children():
		if child is Node:
			_collect_players(child, response_root, editor, players)


static func _player_summary(player: AnimationPlayer, response_root: Node, editor: EditorInterface = null) -> Dictionary:
	return {
		"playerPath": _path_for_response(player, response_root, editor),
		"name": player.name,
		"animations": animation_summaries(player)
	}


static func _player_state(player: AnimationPlayer, response_root: Node, editor: EditorInterface = null) -> Dictionary:
	var current := str(player.current_animation)
	var length := 0.0
	if not current.is_empty() and player.has_animation(current):
		var animation := player.get_animation(current)
		if animation != null:
			length = animation.length

	var state := _player_summary(player, response_root, editor)
	state["playing"] = player.is_playing()
	state["currentAnimation"] = current
	state["assignedAnimation"] = str(player.assigned_animation)
	state["position"] = player.current_animation_position
	state["length"] = length
	return state


static func _resolve_animation_player(editor: EditorInterface, player_path: String) -> AnimationPlayer:
	var node := NiuaMcpSceneGraphContext.resolve_node(editor, player_path)
	if node is AnimationPlayer:
		return node as AnimationPlayer
	return null


static func _path_for_response(node: Node, response_root: Node, editor: EditorInterface = null) -> String:
	if editor != null:
		return NiuaMcpSceneGraphContext.node_path_for_response(editor, node)
	if node == response_root:
		return ""
	return str(response_root.get_path_to(node))


static func _loop_mode_name(loop_mode: int) -> String:
	match loop_mode:
		Animation.LOOP_LINEAR:
			return "linear"
		Animation.LOOP_PINGPONG:
			return "pingpong"
		_:
			return "none"


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
