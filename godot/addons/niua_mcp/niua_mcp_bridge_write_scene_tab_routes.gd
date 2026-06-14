@tool
extends RefCounted

const NiuaMcpSceneTabOperations = preload("niua_mcp_scene_tab_operations.gd")

const HANDLERS := {
	"_open_scene": true,
	"_switch_scene_tab": true,
	"_close_scene_tab": true,
	"_mark_scene_unsaved": true,
	"_undo_editor_action": true,
	"_redo_editor_action": true
}

var _context
var _document_routes


func configure(context, document_routes = null) -> void:
	_context = context
	_document_routes = document_routes


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _open_scene(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneTabOperations.open_scene_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _switch_scene_tab(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneTabOperations.switch_scene_tab_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _close_scene(body: Dictionary) -> Dictionary:
	return _close_scene_tab(body)


func _close_scene_tab(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneTabOperations.close_scene_tab_with_side_effects(
		_context.editor,
		body,
		Callable(_document_routes, "_save_current_scene"),
		Callable(_context, "remember")
	)


func _mark_scene_unsaved(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneTabOperations.mark_scene_unsaved_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _undo_editor_action(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneTabOperations.undo_editor_action_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _redo_editor_action(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneTabOperations.redo_editor_action_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)
