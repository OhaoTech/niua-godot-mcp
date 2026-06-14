@tool
extends RefCounted

const NiuaMcpFilesystemOperations = preload("niua_mcp_filesystem_operations.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")


static func read_script(query: Dictionary) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_script_path(str(query.get("path", "")))
	if not validation.get("ok", false):
		return validation

	return NiuaMcpFilesystemOperations.read_text_file({ "path": str(validation.get("path")) })


static func write_script(body: Dictionary) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_script_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	return NiuaMcpFilesystemOperations.write_text_file({
		"path": str(validation.get("path")),
		"content": str(body.get("content", ""))
	})
