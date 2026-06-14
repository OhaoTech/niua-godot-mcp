@tool
extends RefCounted

const NiuaMcpEditorActions = preload("niua_mcp_editor_actions.gd")
const NiuaMcpEditorSelectionOperations = preload("niua_mcp_editor_selection_operations.gd")
const NiuaMcpEditorSurfaceOperations = preload("niua_mcp_editor_surface_operations.gd")
const NiuaMcpViewportOperations = preload("niua_mcp_viewport_operations.gd")

const HANDLERS := {
	"_set_selection": true,
	"_focus_node": true,
	"_focus_resource": true,
	"_set_editor_main_screen": true,
	"_invoke_editor_action": true,
	"_set_viewport_camera": true,
	"_send_viewport_input": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _set_selection(body: Dictionary) -> Dictionary:
	return NiuaMcpEditorSelectionOperations.set_selection_with_side_effects(_context.editor, body, Callable(_context, "remember"))


func _focus_node(body: Dictionary) -> Dictionary:
	return NiuaMcpEditorSelectionOperations.focus_node_with_side_effects(_context.editor, body, Callable(_context, "remember"))


func _focus_resource(body: Dictionary) -> Dictionary:
	return NiuaMcpEditorSelectionOperations.focus_resource_with_side_effects(_context.editor, body, Callable(_context, "remember"))


func _set_editor_main_screen(body: Dictionary) -> Dictionary:
	return NiuaMcpEditorSurfaceOperations.set_main_screen_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _invoke_editor_action(body: Dictionary) -> Dictionary:
	return NiuaMcpEditorActions.invoke_with_side_effects(
		_context.editor,
		str(body.get("action", "")),
		body.get("params", {}),
		Callable(_context, "remember")
	)


func _set_viewport_camera(body: Dictionary) -> Dictionary:
	return NiuaMcpViewportOperations.set_viewport_camera_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _send_viewport_input(body: Dictionary) -> Dictionary:
	return NiuaMcpViewportOperations.send_viewport_input_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)
