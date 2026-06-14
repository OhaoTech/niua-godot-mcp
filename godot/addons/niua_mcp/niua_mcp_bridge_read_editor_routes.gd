@tool
extends RefCounted

const NiuaMcpEditorSelectionOperations = preload("niua_mcp_editor_selection_operations.gd")
const NiuaMcpEditorStateOperations = preload("niua_mcp_editor_state_operations.gd")
const NiuaMcpEditorSurfaceOperations = preload("niua_mcp_editor_surface_operations.gd")

const HANDLERS := {
	"_health": true,
	"_project_info": true,
	"_editor_state": true,
	"_selection": true,
	"_logs_response": true,
	"_capture_editor_screenshot": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _health() -> Dictionary:
	return NiuaMcpEditorStateOperations.health(_context.is_running(), _context.host, _context.port, _context.read_endpoints, _context.write_endpoints)


func _project_info() -> Dictionary:
	return NiuaMcpEditorStateOperations.project_info()


func _editor_state() -> Dictionary:
	return NiuaMcpEditorStateOperations.editor_state(
		_context.current_scene_path(),
		_context.open_scenes(),
		_main_screen_state(),
		_context.selection_data(),
		_context.logs()
	)


func _selection() -> Dictionary:
	return NiuaMcpEditorSelectionOperations.selection(_context.editor)


func _logs_response() -> Dictionary:
	return _context.memory_response()


func _capture_editor_screenshot() -> Dictionary:
	return NiuaMcpEditorSurfaceOperations.capture_editor_screenshot(_context.editor)


func _main_screen_state() -> Dictionary:
	return NiuaMcpEditorSurfaceOperations.main_screen_state(_context.editor)
