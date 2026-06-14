@tool
extends RefCounted


static func remember_upserted_audio_bus(result: Dictionary, remember: Callable) -> void:
	if not bool(result.get("ok", false)) or not remember.is_valid():
		return
	var bus: Dictionary = result.get("data", {}).get("bus", {})
	remember.call("Upserted audio bus %s" % str(bus.get("name", "")))


static func remember_removed_audio_bus(result: Dictionary, remember: Callable) -> void:
	if not bool(result.get("ok", false)) or not remember.is_valid():
		return
	var removed: Dictionary = result.get("data", {}).get("removed", {})
	remember.call("Removed audio bus %s" % str(removed.get("name", "")))


static func remember_upserted_audio_bus_effect(result: Dictionary, remember: Callable) -> void:
	if not bool(result.get("ok", false)) or not remember.is_valid():
		return
	var data: Dictionary = result.get("data", {})
	var effect: Dictionary = data.get("effect", {})
	remember.call("Upserted audio bus effect %s on %s" % [str(effect.get("type", "")), str(data.get("busName", ""))])


static func remember_created_audio_stream_player(result: Dictionary, remember: Callable) -> void:
	if not bool(result.get("ok", false)) or not remember.is_valid():
		return
	var data: Dictionary = result.get("data", {})
	remember.call("Created AudioStreamPlayer %s on bus %s" % [str(data.get("nodePath", "")), str(data.get("busName", ""))])
