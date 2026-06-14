@tool
extends RefCounted

const NiuaMcpScriptEditorAuthoringOperations = preload("niua_mcp_script_editor_authoring_operations.gd")
const NiuaMcpScriptEditorNavigationOperations = preload("niua_mcp_script_editor_navigation_operations.gd")
const NiuaMcpScriptEditorStateOperations = preload("niua_mcp_script_editor_state_operations.gd")
const NiuaMcpScriptEditorSideEffects = preload("niua_mcp_script_editor_side_effects.gd")


static func create_script_with_side_effects(body: Dictionary, write_text_file: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpScriptEditorSideEffects.create_script_with_side_effects(body, write_text_file, remember)


static func attach_script_with_side_effects(editor: EditorInterface, body: Dictionary, resolve_node: Callable, create_script: Callable, save_current_scene: Callable, edited_scene_root: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpScriptEditorSideEffects.attach_script_with_side_effects(editor, body, resolve_node, create_script, save_current_scene, edited_scene_root, remember)


static func open_script_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpScriptEditorSideEffects.open_script_with_side_effects(editor, body, remember)


static func goto_script_line_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpScriptEditorSideEffects.goto_script_line_with_side_effects(editor, body, remember)


static func create_script(body: Dictionary, write_text_file: Callable) -> Dictionary:
	return NiuaMcpScriptEditorAuthoringOperations.create_script(body, write_text_file)


static func attach_script(editor: EditorInterface, body: Dictionary, resolve_node: Callable, create_script: Callable, save_current_scene: Callable, edited_scene_root: Callable) -> Dictionary:
	return NiuaMcpScriptEditorAuthoringOperations.attach_script(editor, body, resolve_node, create_script, save_current_scene, edited_scene_root)


static func open_script(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpScriptEditorNavigationOperations.open_script(editor, body)


static func script_editor_state(editor: EditorInterface) -> Dictionary:
	return NiuaMcpScriptEditorStateOperations.script_editor_state(editor)


static func script_cursor_state(editor: EditorInterface) -> Dictionary:
	return NiuaMcpScriptEditorStateOperations.script_cursor_state(editor)


static func goto_script_line(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpScriptEditorNavigationOperations.goto_script_line(editor, body)
