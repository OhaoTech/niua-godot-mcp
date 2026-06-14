@tool
extends RefCounted

const NiuaMcpAnimationOperations = preload("niua_mcp_animation_operations.gd")

const HANDLERS := {
	"_list_animations": true,
	"_get_animation_state": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _list_animations(query: Dictionary) -> Dictionary:
	return NiuaMcpAnimationOperations.list_animations(_context.editor, query)


func _get_animation_state(query: Dictionary) -> Dictionary:
	return NiuaMcpAnimationOperations.get_animation_state(_context.editor, query)
