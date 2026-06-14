@tool
extends RefCounted

const NiuaMcpRunOperations = preload("niua_mcp_run_operations.gd")

const HANDLERS := {
	"_run_settings": true,
	"_run_status": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _run_settings() -> Dictionary:
	return NiuaMcpRunOperations.run_settings(_context.editor)


func _run_status() -> Dictionary:
	return NiuaMcpRunOperations.run_status(_context.editor)
