@tool
extends RefCounted

const NiuaMcpAudioOperations = preload("niua_mcp_audio_operations.gd")

const HANDLERS := {
	"_list_audio_buses": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _list_audio_buses(_query: Dictionary) -> Dictionary:
	return NiuaMcpAudioOperations.list_audio_buses()
