@tool
extends RefCounted

const NiuaMcpScriptFileOperations = preload("niua_mcp_script_file_operations.gd")


static func current_script_summary(script_editor):
	if script_editor.has_method("get_current_script"):
		var current_script_resource = script_editor.get_current_script()
		if current_script_resource != null:
			return NiuaMcpScriptFileOperations.resource_summary(current_script_resource)
	return null


static func current_editor_base(script_editor):
	if script_editor.has_method("get_current_editor"):
		return script_editor.get_current_editor()
	return null


static func current_editor_summary(editor_base):
	if editor_base == null:
		return null
	return {
		"type": editor_base.get_class(),
		"path": str(editor_base.get_path())
	}


static func unavailable_response(available: bool, reason: String, current_script = null, current_editor = null) -> Dictionary:
	var data := {
		"available": available,
		"cursorAvailable": false,
		"reason": reason
	}
	if available:
		data["currentScript"] = current_script
	if current_editor != null:
		data["currentEditor"] = current_editor
	return {
		"ok": true,
		"data": data
	}


static func error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
