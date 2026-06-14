@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")


static func open_script(editor: EditorInterface, body: Dictionary) -> Dictionary:
	if editor == null:
		return _error("Godot editor interface is unavailable")

	var validation := NiuaMcpPathUtils.validate_script_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	var resource := ResourceLoader.load(path, "GDScript", ResourceLoader.CACHE_MODE_IGNORE)
	if resource == null or not (resource is GDScript):
		return _error("script not found or not loadable: %s" % path, "not_found")

	editor.edit_resource(resource)
	return {
		"ok": true,
		"data": {
			"path": path,
			"type": resource.get_class()
		}
	}


static func goto_script_line(editor: EditorInterface, body: Dictionary) -> Dictionary:
	if editor == null:
		return _error("Godot editor interface is unavailable")
	if not editor.has_method("edit_script"):
		return _error("Godot editor does not expose edit_script")

	var validation := NiuaMcpPathUtils.validate_script_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	var resource := ResourceLoader.load(path, "GDScript", ResourceLoader.CACHE_MODE_IGNORE)
	if resource == null or not (resource is GDScript):
		return _error("script not found or not loadable: %s" % path, "not_found")

	var requested_line := int(body.get("line", 1))
	if requested_line < 1:
		return _error("line must be 1 or greater")

	# EditorInterface.edit_script expects the same 1-based line contract
	# this MCP tool exposes. Cursor snapshots separately report both
	# zero-based and one-based CodeEdit lines.
	var editor_line := requested_line
	var column: int = max(0, int(body.get("column", 0)))
	var grab_focus := bool(body.get("grabFocus", true))
	editor.edit_script(resource, editor_line, column, grab_focus)
	return {
		"ok": true,
		"data": {
			"path": path,
			"requestedLine": requested_line,
			"editorLine": editor_line,
			"column": column,
			"grabFocus": grab_focus,
			"opened": true
		}
	}


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
