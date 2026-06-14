@tool
extends RefCounted

const NiuaMcpAudioOperations = preload("niua_mcp_audio_operations.gd")

const HANDLERS := {
	"_upsert_audio_bus": true,
	"_remove_audio_bus": true,
	"_upsert_audio_bus_effect": true,
	"_create_audio_stream_player": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _upsert_audio_bus(body: Dictionary) -> Dictionary:
	return NiuaMcpAudioOperations.upsert_audio_bus_with_side_effects(
		body,
		Callable(_context, "remember")
	)


func _remove_audio_bus(body: Dictionary) -> Dictionary:
	return NiuaMcpAudioOperations.remove_audio_bus_with_side_effects(
		body,
		Callable(_context, "remember")
	)


func _upsert_audio_bus_effect(body: Dictionary) -> Dictionary:
	return NiuaMcpAudioOperations.upsert_audio_bus_effect_with_side_effects(
		body,
		Callable(_context, "remember")
	)


func _create_audio_stream_player(body: Dictionary) -> Dictionary:
	return NiuaMcpAudioOperations.create_audio_stream_player_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)
