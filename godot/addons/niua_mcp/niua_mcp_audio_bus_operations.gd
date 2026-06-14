@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")

const DEFAULT_LAYOUT_PATH := "res://default_bus_layout.tres"
const REVERB_PROPERTIES := ["predelay_msec", "predelay_feedback", "room_size", "damping", "spread", "hipass", "dry", "wet"]
const LIMITER_PROPERTIES := ["ceiling_db", "threshold_db", "soft_clip_db", "soft_clip_ratio"]


static func list_audio_buses() -> Dictionary:
	var buses := []
	for bus_index in range(AudioServer.get_bus_count()):
		buses.append(bus_snapshot(bus_index))

	return {
		"ok": true,
		"data": {
			"busCount": buses.size(),
			"buses": buses
		}
	}


static func upsert_audio_bus(body: Dictionary) -> Dictionary:
	var name := str(body.get("name", "")).strip_edges()
	if name.is_empty():
		return NiuaMcpSceneNodeContext.error("audio bus name is required")

	var index := audio_bus_index(name)
	var created := false
	var renamed := false
	var from_name := str(body.get("fromName", "")).strip_edges()

	if index == -1 and not from_name.is_empty():
		var from_index := audio_bus_index(from_name)
		if from_index == -1:
			return NiuaMcpSceneNodeContext.error("audio bus not found: %s" % from_name, "not_found")
		if from_name != name and audio_bus_index(name) != -1:
			return NiuaMcpSceneNodeContext.error("audio bus already exists: %s" % name)
		AudioServer.set_bus_name(from_index, name)
		index = from_index
		renamed = from_name != name

	if index == -1:
		var insert_index := int(body.get("index", -1))
		AudioServer.add_bus(insert_index)
		index = AudioServer.get_bus_count() - 1 if insert_index < 0 else clampi(insert_index, 0, AudioServer.get_bus_count() - 1)
		AudioServer.set_bus_name(index, name)
		created = true

	_apply_bus_settings(index, body, created)
	var save_result := save_layout_if_requested(body)
	if not bool(save_result.get("ok", true)):
		return save_result

	return {
		"ok": true,
		"data": {
			"created": created,
			"renamed": renamed,
			"bus": bus_snapshot(index),
			"save": save_result
		}
	}


static func remove_audio_bus(body: Dictionary) -> Dictionary:
	var name := str(body.get("name", "")).strip_edges()
	if name.is_empty():
		return NiuaMcpSceneNodeContext.error("audio bus name is required")
	if name == "Master":
		return NiuaMcpSceneNodeContext.error("Master audio bus cannot be removed")

	var index := audio_bus_index(name)
	if index == -1:
		return NiuaMcpSceneNodeContext.error("audio bus not found: %s" % name, "not_found")

	var removed := bus_snapshot(index)
	AudioServer.remove_bus(index)
	var save_result := save_layout_if_requested(body)
	if not bool(save_result.get("ok", true)):
		return save_result

	return {
		"ok": true,
		"data": {
			"removed": removed,
			"busCount": AudioServer.get_bus_count(),
			"save": save_result
		}
	}


static func audio_bus_index(name: String) -> int:
	return AudioServer.get_bus_index(StringName(name))


static func bus_snapshot(index: int) -> Dictionary:
	var effects := []
	for effect_index in range(AudioServer.get_bus_effect_count(index)):
		effects.append(effect_snapshot(index, effect_index))

	return {
		"index": index,
		"name": AudioServer.get_bus_name(index),
		"channels": AudioServer.get_bus_channels(index),
		"volumeDb": AudioServer.get_bus_volume_db(index),
		"volumeLinear": AudioServer.get_bus_volume_linear(index),
		"muted": AudioServer.is_bus_mute(index),
		"solo": AudioServer.is_bus_solo(index),
		"bypassEffects": AudioServer.is_bus_bypassing_effects(index),
		"send": str(AudioServer.get_bus_send(index)),
		"effectCount": effects.size(),
		"effects": effects
	}


static func effect_snapshot(bus_index: int, effect_index: int) -> Dictionary:
	var effect := AudioServer.get_bus_effect(bus_index, effect_index)
	var parameters := {}
	if effect is AudioEffectReverb:
		for property_name in REVERB_PROPERTIES:
			parameters[property_name] = effect.get(property_name)
	elif effect is AudioEffectLimiter:
		for property_name in LIMITER_PROPERTIES:
			parameters[property_name] = effect.get(property_name)

	return {
		"index": effect_index,
		"type": effect.get_class(),
		"enabled": AudioServer.is_bus_effect_enabled(bus_index, effect_index),
		"parameters": parameters
	}


static func save_layout_if_requested(body: Dictionary) -> Dictionary:
	if body.has("save") and not bool(body.get("save")):
		return {
			"ok": true,
			"saved": false
		}

	var path := str(body.get("layoutPath", DEFAULT_LAYOUT_PATH)).strip_edges()
	var validation := NiuaMcpPathUtils.validate_res_path(path)
	if not bool(validation.get("ok", false)):
		return validation
	path = str(validation.get("path"))
	if not path.ends_with(".tres"):
		return NiuaMcpSceneNodeContext.error("audio bus layout path must end with .tres: %s" % path)

	var parent_error := NiuaMcpPathUtils.ensure_parent_directory(path)
	if parent_error != OK:
		return NiuaMcpSceneNodeContext.error("failed to create parent directory for %s: %s" % [path, parent_error])

	var layout := AudioServer.generate_bus_layout()
	var save_error := ResourceSaver.save(layout, path)
	if save_error != OK:
		return NiuaMcpSceneNodeContext.error("failed to save audio bus layout %s: %s" % [path, save_error])

	ProjectSettings.set_setting("audio/buses/default_bus_layout", path)
	var project_save_error := ProjectSettings.save()
	if project_save_error != OK:
		return NiuaMcpSceneNodeContext.error("failed to save project settings for audio bus layout: %s" % project_save_error)

	return {
		"ok": true,
		"saved": true,
		"layoutPath": path
	}


static func _apply_bus_settings(index: int, body: Dictionary, created: bool) -> void:
	if body.has("volumeDb"):
		AudioServer.set_bus_volume_db(index, float(body.get("volumeDb")))
	if body.has("muted"):
		AudioServer.set_bus_mute(index, bool(body.get("muted")))
	if body.has("send"):
		AudioServer.set_bus_send(index, StringName(str(body.get("send"))))
	elif created and index > 0:
		AudioServer.set_bus_send(index, StringName("Master"))
