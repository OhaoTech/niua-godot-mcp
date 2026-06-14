@tool
extends RefCounted

const NiuaMcpScriptEditorOperations = preload("niua_mcp_script_editor_operations.gd")
const NiuaMcpScriptFileOperations = preload("niua_mcp_script_file_operations.gd")

const HANDLERS := {
	"_read_script": true,
	"_validate_script": true,
	"_script_symbols": true,
	"_script_editor_state": true,
	"_script_cursor_state": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _read_script(query: Dictionary) -> Dictionary:
	return NiuaMcpScriptFileOperations.read_script(query)


func _validate_script(query: Dictionary) -> Dictionary:
	return NiuaMcpScriptFileOperations.validate_script(query)


func _script_symbols(query: Dictionary) -> Dictionary:
	return NiuaMcpScriptFileOperations.script_symbols(query)


func _script_editor_state() -> Dictionary:
	return NiuaMcpScriptEditorOperations.script_editor_state(_context.editor)


func _script_cursor_state() -> Dictionary:
	return NiuaMcpScriptEditorOperations.script_cursor_state(_context.editor)
