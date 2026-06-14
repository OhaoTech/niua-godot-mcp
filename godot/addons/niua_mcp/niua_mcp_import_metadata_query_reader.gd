@tool
extends RefCounted

const NiuaMcpImportMetadataDiagnostics = preload("niua_mcp_import_metadata_diagnostics.gd")
const NiuaMcpImportMetadataLoader = preload("niua_mcp_import_metadata_loader.gd")
const NiuaMcpImportMetadataSummary = preload("niua_mcp_import_metadata_summary.gd")
const NiuaMcpImportUtils = preload("niua_mcp_import_utils.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")


static func get_metadata(query: Dictionary) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_res_path(str(query.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	var metadata_path := NiuaMcpPathUtils.import_sidecar_path(path)
	if not FileAccess.file_exists(metadata_path):
		return NiuaMcpImportUtils.error("import metadata not found: %s" % metadata_path, "not_found")

	var load_result := NiuaMcpImportMetadataLoader.load_config_metadata(metadata_path)
	if not load_result.get("ok", false):
		return load_result

	var source_path := path.trim_suffix(".import") if path.ends_with(".import") else path
	return {
		"ok": true,
		"data": NiuaMcpImportMetadataSummary.summary(source_path, metadata_path, load_result.get("metadata", {}))
	}


static func get_diagnostics(query: Dictionary) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_res_path(str(query.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	if path.ends_with(".import"):
		path = path.trim_suffix(".import")

	var metadata_path := NiuaMcpPathUtils.import_sidecar_path(path)
	var metadata_exists := FileAccess.file_exists(metadata_path)
	var metadata_load_error := OK
	var metadata := {}
	if metadata_exists:
		var load_result := NiuaMcpImportMetadataLoader.load_config_metadata(metadata_path)
		metadata_load_error = int(load_result.get("loadError", OK if load_result.get("ok", false) else ERR_FILE_CANT_READ))
		if load_result.get("ok", false):
			metadata = load_result.get("metadata", {})

	var issues := NiuaMcpImportMetadataDiagnostics.diagnostic_issues(path, metadata_path, metadata, metadata_exists, metadata_load_error)
	var metadata_summary := NiuaMcpImportMetadataSummary.summary(path, metadata_path, metadata)
	metadata_summary["metadataExists"] = metadata_exists
	metadata_summary["metadataLoadError"] = metadata_load_error
	metadata_summary["status"] = "ok" if issues.is_empty() else "warning"
	metadata_summary["issues"] = issues
	return {
		"ok": true,
		"data": metadata_summary
	}
