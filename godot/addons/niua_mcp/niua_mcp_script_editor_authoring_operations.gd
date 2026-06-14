@tool
extends RefCounted

const NiuaMcpScriptEditorAttachOperations = preload("niua_mcp_script_editor_attach_operations.gd")
const NiuaMcpScriptEditorCreateOperations = preload("niua_mcp_script_editor_create_operations.gd")


static func create_script(body: Dictionary, write_text_file: Callable) -> Dictionary:
	return NiuaMcpScriptEditorCreateOperations.create_script(body, write_text_file)


static func attach_script(editor: EditorInterface, body: Dictionary, resolve_node: Callable, create_script: Callable, save_current_scene: Callable, edited_scene_root: Callable) -> Dictionary:
	return NiuaMcpScriptEditorAttachOperations.attach_script(editor, body, resolve_node, create_script, save_current_scene, edited_scene_root)
