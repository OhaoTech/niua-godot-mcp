@tool
extends RefCounted

const NiuaMcpAudioBusOperations = preload("niua_mcp_audio_bus_operations.gd")
const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")

const REVERB_PROPERTIES := ["predelay_msec", "predelay_feedback", "room_size", "damping", "spread", "hipass", "dry", "wet"]
const LIMITER_PROPERTIES := ["ceiling_db", "threshold_db", "soft_clip_db", "soft_clip_ratio"]


static func upsert_audio_bus_effect(body: Dictionary) -> Dictionary:
	var bus_name := str(body.get("busName", "")).strip_edges()
	if bus_name.is_empty():
		return NiuaMcpSceneNodeContext.error("audio bus name is required")
	var bus_index := NiuaMcpAudioBusOperations.audio_bus_index(bus_name)
	if bus_index == -1:
		return NiuaMcpSceneNodeContext.error("audio bus not found: %s" % bus_name, "not_found")

	var effect_kind := str(body.get("effectKind", "")).strip_edges()
	var expected_class := _effect_class_name(effect_kind)
	if expected_class.is_empty():
		return NiuaMcpSceneNodeContext.error("unsupported audio effect kind: %s" % effect_kind)

	var effect_index := int(body.get("effectIndex", -1))
	var effect: AudioEffect = null
	var replaced := false
	if effect_index >= 0:
		if effect_index >= AudioServer.get_bus_effect_count(bus_index):
			return NiuaMcpSceneNodeContext.error("audio bus effect index out of range: %s" % effect_index)
		var current := AudioServer.get_bus_effect(bus_index, effect_index)
		if current != null and current.get_class() == expected_class:
			effect = current
		else:
			AudioServer.remove_bus_effect(bus_index, effect_index)
			effect = _new_effect(effect_kind)
			AudioServer.add_bus_effect(bus_index, effect, effect_index)
			replaced = true
	else:
		effect = _new_effect(effect_kind)
		AudioServer.add_bus_effect(bus_index, effect, -1)
		effect_index = AudioServer.get_bus_effect_count(bus_index) - 1

	var parameter_result := _apply_effect_parameters(effect, effect_kind, body.get("parameters", {}))
	if not bool(parameter_result.get("ok", false)):
		return parameter_result

	var enabled := bool(body.get("enabled", true))
	AudioServer.set_bus_effect_enabled(bus_index, effect_index, enabled)
	var save_result := NiuaMcpAudioBusOperations.save_layout_if_requested(body)
	if not bool(save_result.get("ok", true)):
		return save_result

	return {
		"ok": true,
		"data": {
			"busName": bus_name,
			"busIndex": bus_index,
			"replaced": replaced,
			"effect": NiuaMcpAudioBusOperations.effect_snapshot(bus_index, effect_index),
			"bus": NiuaMcpAudioBusOperations.bus_snapshot(bus_index),
			"save": save_result
		}
	}


static func _new_effect(effect_kind: String) -> AudioEffect:
	match effect_kind:
		"reverb":
			return AudioEffectReverb.new()
		"limiter":
			return AudioEffectLimiter.new()
		_:
			return null


static func _effect_class_name(effect_kind: String) -> String:
	match effect_kind:
		"reverb":
			return "AudioEffectReverb"
		"limiter":
			return "AudioEffectLimiter"
		_:
			return ""


static func _apply_effect_parameters(effect: AudioEffect, effect_kind: String, raw_parameters) -> Dictionary:
	if effect == null:
		return NiuaMcpSceneNodeContext.error("audio effect could not be created")
	if typeof(raw_parameters) != TYPE_DICTIONARY:
		return NiuaMcpSceneNodeContext.error("audio effect parameters must be a dictionary")

	var allowed := REVERB_PROPERTIES if effect_kind == "reverb" else LIMITER_PROPERTIES
	var parameters: Dictionary = raw_parameters
	for key in parameters.keys():
		var property_name := str(key)
		if not allowed.has(property_name):
			return NiuaMcpSceneNodeContext.error("unsupported %s parameter: %s" % [effect_kind, property_name])
		effect.set(property_name, float(parameters[key]))

	return {
		"ok": true
	}
