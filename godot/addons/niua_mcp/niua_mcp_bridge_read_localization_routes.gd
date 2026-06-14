@tool
extends RefCounted

const NiuaMcpLocalizationOperations = preload("niua_mcp_localization_operations.gd")

const HANDLERS := {
	"_get_localization_state": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _get_localization_state(_query: Dictionary) -> Dictionary:
	return NiuaMcpLocalizationOperations.get_localization_state()
