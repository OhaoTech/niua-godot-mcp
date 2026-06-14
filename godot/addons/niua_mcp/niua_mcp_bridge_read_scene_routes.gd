@tool
extends RefCounted

const NiuaMcpEditorStateOperations = preload("niua_mcp_editor_state_operations.gd")
const NiuaMcpSceneTabOperations = preload("niua_mcp_scene_tab_operations.gd")

const HANDLERS := {
	"_scene_tree": true,
	"_open_scene_tabs": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _scene_tree() -> Dictionary:
	return NiuaMcpEditorStateOperations.scene_tree(_context.current_scene_path(), _context.edited_scene_root())


func _open_scene_tabs() -> Dictionary:
	return NiuaMcpSceneTabOperations.open_scene_tabs(_context.editor)
