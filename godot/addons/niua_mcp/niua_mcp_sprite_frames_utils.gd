@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")


static func load_texture2d(raw_path, label: String) -> Dictionary:
	var texture_validation := NiuaMcpPathUtils.validate_res_path(str(raw_path))
	if not texture_validation.get("ok", false):
		return texture_validation
	var texture_path := str(texture_validation.get("path"))
	var texture_resource := ResourceLoader.load(texture_path)
	if texture_resource == null:
		return error("%s texture not found or not loadable: %s" % [label, texture_path], "not_found")
	if not (texture_resource is Texture2D):
		return error("%s texture is not a Texture2D: %s" % [label, texture_path], "invalid_resource")
	return {
		"ok": true,
		"path": texture_path,
		"texture": texture_resource
	}


static func error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
