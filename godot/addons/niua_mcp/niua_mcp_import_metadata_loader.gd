@tool
extends RefCounted

const NiuaMcpConfigFileCodec = preload("niua_mcp_config_file_codec.gd")
const NiuaMcpImportUtils = preload("niua_mcp_import_utils.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")


static func load_metadata(path: String) -> Dictionary:
	var metadata_path := NiuaMcpPathUtils.import_sidecar_path(path)
	if not FileAccess.file_exists(metadata_path):
		return {}

	var load_result := load_config_metadata(metadata_path)
	if not load_result.get("ok", false):
		return {}

	return load_result.get("metadata", {})


static func load_config_metadata(metadata_path: String) -> Dictionary:
	if not FileAccess.file_exists(metadata_path):
		return NiuaMcpImportUtils.error("import metadata not found: %s" % metadata_path, "not_found")

	var config := ConfigFile.new()
	var load_error := config.load(metadata_path)
	if load_error != OK:
		var error := NiuaMcpImportUtils.error("failed to read import metadata %s: %s" % [metadata_path, load_error])
		error["loadError"] = load_error
		return error

	return {
		"ok": true,
		"metadata": NiuaMcpConfigFileCodec.to_json(config),
		"loadError": OK
	}
