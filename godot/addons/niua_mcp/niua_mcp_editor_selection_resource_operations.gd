@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpEditorSelectionUtils = preload("niua_mcp_editor_selection_utils.gd")


static func focus_resource(editor: EditorInterface, body: Dictionary) -> Dictionary:
	if editor == null:
		return NiuaMcpEditorSelectionUtils.error("Godot editor interface is unavailable")

	var validation := NiuaMcpPathUtils.validate_res_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	if not FileAccess.file_exists(path) and not ResourceLoader.exists(path):
		return NiuaMcpEditorSelectionUtils.error("resource not found: %s" % path, "not_found")

	var selected_file := false
	if editor.has_method("select_file"):
		editor.select_file(path)
		selected_file = true

	var resource := ResourceLoader.load(path)
	var resource_type := ""
	var inspected := false
	if resource != null:
		resource_type = resource.get_class()
		if editor.has_method("inspect_object"):
			editor.inspect_object(resource)
			inspected = true
		elif editor.has_method("edit_resource"):
			editor.edit_resource(resource)
			inspected = true

	return {
		"ok": true,
		"data": {
			"path": path,
			"type": resource_type,
			"selectedFile": selected_file,
			"inspected": inspected
		}
	}
