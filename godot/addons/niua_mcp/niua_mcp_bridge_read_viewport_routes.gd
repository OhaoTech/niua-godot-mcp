@tool
extends RefCounted

const NiuaMcpViewportOperations = preload("niua_mcp_viewport_operations.gd")

const HANDLERS := {
	"_capture_viewport_screenshot": true,
	"_viewport_state": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _capture_viewport_screenshot(query: Dictionary) -> Dictionary:
	return NiuaMcpViewportOperations.capture_viewport_screenshot(_context.editor, query)


func _viewport_state(query: Dictionary) -> Dictionary:
	return NiuaMcpViewportOperations.viewport_state(_context.editor, query)
