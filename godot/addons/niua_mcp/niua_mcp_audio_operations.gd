@tool
extends RefCounted

const NiuaMcpAudioBusOperations = preload("niua_mcp_audio_bus_operations.gd")
const NiuaMcpAudioEffectOperations = preload("niua_mcp_audio_effect_operations.gd")
const NiuaMcpAudioPlayerOperations = preload("niua_mcp_audio_player_operations.gd")
const NiuaMcpAudioSideEffects = preload("niua_mcp_audio_side_effects.gd")


static func list_audio_buses() -> Dictionary:
	return NiuaMcpAudioBusOperations.list_audio_buses()


static func upsert_audio_bus(body: Dictionary) -> Dictionary:
	return NiuaMcpAudioBusOperations.upsert_audio_bus(body)


static func upsert_audio_bus_with_side_effects(body: Dictionary, remember: Callable) -> Dictionary:
	var result := upsert_audio_bus(body)
	NiuaMcpAudioSideEffects.remember_upserted_audio_bus(result, remember)
	return result


static func remove_audio_bus(body: Dictionary) -> Dictionary:
	return NiuaMcpAudioBusOperations.remove_audio_bus(body)


static func remove_audio_bus_with_side_effects(body: Dictionary, remember: Callable) -> Dictionary:
	var result := remove_audio_bus(body)
	NiuaMcpAudioSideEffects.remember_removed_audio_bus(result, remember)
	return result


static func upsert_audio_bus_effect(body: Dictionary) -> Dictionary:
	return NiuaMcpAudioEffectOperations.upsert_audio_bus_effect(body)


static func upsert_audio_bus_effect_with_side_effects(body: Dictionary, remember: Callable) -> Dictionary:
	var result := upsert_audio_bus_effect(body)
	NiuaMcpAudioSideEffects.remember_upserted_audio_bus_effect(result, remember)
	return result


static func create_audio_stream_player(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpAudioPlayerOperations.create_audio_stream_player(editor, body)


static func create_audio_stream_player_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var result := create_audio_stream_player(editor, body)
	NiuaMcpAudioSideEffects.remember_created_audio_stream_player(result, remember)
	return result
