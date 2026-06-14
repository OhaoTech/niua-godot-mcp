@tool
extends RefCounted

const NiuaMcpScriptEditorAuthoringOperations = preload("niua_mcp_script_editor_authoring_operations.gd")
const NiuaMcpScriptEditorNavigationOperations = preload("niua_mcp_script_editor_navigation_operations.gd")


static func create_script_with_side_effects(body: Dictionary, write_text_file: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpScriptEditorAuthoringOperations.create_script(body, write_text_file)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Created script %s" % str(data.get("path", "")))
	return response


static func attach_script_with_side_effects(editor: EditorInterface, body: Dictionary, resolve_node: Callable, create_script: Callable, save_current_scene: Callable, edited_scene_root: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpScriptEditorAuthoringOperations.attach_script(editor, body, resolve_node, create_script, save_current_scene, edited_scene_root)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		var script: Dictionary = data.get("script", {})
		_remember(remember, "Attached script %s to %s" % [str(script.get("path", "")), str(body.get("nodePath", ""))])
	return response


static func open_script_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpScriptEditorNavigationOperations.open_script(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Opened script %s" % str(data.get("path", "")))
	return response


static func goto_script_line_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpScriptEditorNavigationOperations.goto_script_line(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Opened script %s at line %d" % [str(data.get("path", "")), int(data.get("requestedLine", 1))])
	return response


static func _remember(remember: Callable, message: String) -> void:
	if remember.is_valid():
		remember.call(message)
