@tool
extends RefCounted

const NiuaMcpImportOptionOperations = preload("niua_mcp_import_option_operations.gd")
const NiuaMcpImportReimportOperations = preload("niua_mcp_import_reimport_operations.gd")
const NiuaMcpImportUtils = preload("niua_mcp_import_utils.gd")


static func set_import_options_with_side_effects(body: Dictionary, path_validator: Callable, reimport_assets: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpImportOptionOperations.set_import_options(body, path_validator, reimport_assets)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpImportUtils.remember(remember, "Updated import options for %s" % str(data.get("path", "")))
	return response


static func reimport_assets_with_side_effects(body: Dictionary, resource_filesystem, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpImportReimportOperations.reimport_assets(body, resource_filesystem, refresh_filesystem)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		var paths = data.get("paths", [])
		var path_text := ", ".join(paths) if typeof(paths) == TYPE_ARRAY else str(paths)
		NiuaMcpImportUtils.remember(remember, "Requested asset reimport for %s" % path_text)
	return response
