@tool
extends RefCounted

const NiuaMcpConfigFileCodec = preload("niua_mcp_config_file_codec.gd")
const NiuaMcpImportMetadata = preload("niua_mcp_import_metadata.gd")
const NiuaMcpImportUtils = preload("niua_mcp_import_utils.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")


static func set_import_options(body: Dictionary, path_validator: Callable, reimport_assets: Callable) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_res_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var raw_options = body.get("options", {})
	if typeof(raw_options) != TYPE_DICTIONARY:
		return NiuaMcpImportUtils.error("options must be an object")

	var options: Dictionary = raw_options
	if options.is_empty():
		return NiuaMcpImportUtils.error("options must include at least one import parameter")

	var path := str(validation.get("path"))
	if path.ends_with(".import"):
		path = path.trim_suffix(".import")

	var metadata_path := NiuaMcpPathUtils.import_sidecar_path(path)
	if not FileAccess.file_exists(metadata_path):
		return NiuaMcpImportUtils.error("import metadata not found: %s" % metadata_path, "not_found")

	var config := ConfigFile.new()
	var load_error := config.load(metadata_path)
	if load_error != OK:
		return NiuaMcpImportUtils.error("failed to read import metadata %s: %s" % [metadata_path, load_error])

	var updated_options := {}
	var previous_options := {}
	for raw_key in options.keys():
		var key := str(raw_key).strip_edges()
		if key.is_empty():
			return NiuaMcpImportUtils.error("import option keys must be non-empty strings")

		if config.has_section_key("params", key):
			previous_options[key] = NiuaMcpVariantCodec.variant_to_json(config.get_value("params", key))

		var value = NiuaMcpVariantCodec.json_to_variant(options.get(raw_key), path_validator)
		config.set_value("params", key, value)
		updated_options[key] = NiuaMcpVariantCodec.variant_to_json(value)

	var save_error := config.save(metadata_path)
	if save_error != OK:
		return NiuaMcpImportUtils.error("failed to save import metadata %s: %s" % [metadata_path, save_error])

	var reimport_data := {
		"requested": bool(body.get("reimport", false)),
		"reimported": false,
		"scanned": false
	}
	if bool(reimport_data.get("requested", false)):
		var reimport_result = reimport_assets.call({ "paths": [path] })
		if typeof(reimport_result) != TYPE_DICTIONARY:
			return NiuaMcpImportUtils.error("failed to reimport asset: invalid reimport response")
		if not reimport_result.get("ok", false):
			return reimport_result

		var data: Dictionary = reimport_result.get("data", {})
		reimport_data["reimported"] = bool(data.get("reimported", false))
		reimport_data["scanned"] = bool(data.get("scanned", false))

	var metadata := NiuaMcpConfigFileCodec.to_json(config)
	var summary := NiuaMcpImportMetadata.summary(path, metadata_path, metadata)
	summary["updatedOptions"] = updated_options
	summary["previousOptions"] = previous_options
	summary["reimport"] = reimport_data

	return {
		"ok": true,
		"data": summary
	}
