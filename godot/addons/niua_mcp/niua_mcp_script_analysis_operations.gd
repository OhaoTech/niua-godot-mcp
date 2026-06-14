@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpScriptFileUtils = preload("niua_mcp_script_file_utils.gd")
const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")


static func resource_summary(script) -> Dictionary:
	if script == null:
		return {}

	return {
		"path": script.resource_path,
		"type": script.get_class()
	}


static func validate_script(query: Dictionary) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_script_path(str(query.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	if not FileAccess.file_exists(path):
		return NiuaMcpScriptFileUtils.error("script not found: %s" % path, "not_found")

	var resource := ResourceLoader.load(path, "GDScript", ResourceLoader.CACHE_MODE_IGNORE)
	if resource == null or not (resource is GDScript):
		return {
			"ok": true,
			"data": {
				"path": path,
				"valid": false,
				"error": "Godot could not load this script"
			}
		}

	var script := resource as GDScript
	var reload_error := script.reload()
	return {
		"ok": true,
		"data": {
			"path": path,
			"valid": reload_error == OK,
			"errorCode": reload_error
		}
	}


static func script_symbols(query: Dictionary) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_script_path(str(query.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	if not FileAccess.file_exists(path):
		return NiuaMcpScriptFileUtils.error("script not found: %s" % path, "not_found")

	var resource := ResourceLoader.load(path, "GDScript", ResourceLoader.CACHE_MODE_IGNORE)
	if resource == null or not (resource is Script):
		return NiuaMcpScriptFileUtils.error("script not found or not loadable: %s" % path, "not_found")

	var script := resource as Script
	var reload_error := script.reload()
	if reload_error != OK:
		return {
			"ok": true,
			"data": {
				"path": path,
				"type": script.get_class(),
				"valid": false,
				"reloadError": reload_error,
				"methods": [],
				"properties": [],
				"signals": [],
				"constants": {}
			}
		}

	return {
		"ok": true,
		"data": {
			"path": path,
			"type": script.get_class(),
			"valid": true,
			"reloadError": reload_error,
			"methods": NiuaMcpVariantCodec.variant_to_json(script.get_script_method_list()),
			"properties": NiuaMcpVariantCodec.variant_to_json(script.get_script_property_list()),
			"signals": NiuaMcpVariantCodec.variant_to_json(script.get_script_signal_list()),
			"constants": NiuaMcpVariantCodec.variant_to_json(script.get_script_constant_map())
		}
	}
