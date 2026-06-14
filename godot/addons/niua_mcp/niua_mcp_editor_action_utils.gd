@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")


static func require_editor_method(editor: EditorInterface, method_name: String) -> Dictionary:
	if editor == null:
		return error("Godot editor interface is unavailable")
	if not editor.has_method(method_name):
		return error("Godot editor does not expose %s" % method_name)
	return {
		"ok": true
	}


static func editor_resource_filesystem(editor: EditorInterface):
	if editor == null or not editor.has_method("get_resource_filesystem"):
		return null
	return editor.get_resource_filesystem()


static func action_res_path(params: Dictionary, key: String) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_res_path(str(params.get(key, "")))
	if not validation.get("ok", false):
		return validation
	return validation


static func action_scene_path(params: Dictionary, key: String) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_scene_path(str(params.get(key, "")))
	if not validation.get("ok", false):
		return validation
	return validation


static func action_data(params: Dictionary) -> Dictionary:
	return {
		"ok": true,
		"data": {
			"params": params
		}
	}


static func remember(remember: Callable, message: String) -> void:
	if remember.is_valid():
		remember.call(message)


static func error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
