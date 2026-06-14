@tool
extends RefCounted

const NiuaMcpImportMetadataQueries = preload("niua_mcp_import_metadata_queries.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")


static func list_imported_assets(query: Dictionary) -> Dictionary:
	var raw_path := str(query.get("path", "res://"))
	var recursive := str(query.get("recursive", "true")).to_lower() != "false"
	var validation := NiuaMcpPathUtils.validate_res_path(raw_path, true)
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	var directory := DirAccess.open(path)
	if directory == null:
		return _error("directory not found: %s" % path, "not_found")

	return {
		"ok": true,
		"data": {
			"path": path,
			"recursive": recursive,
			"assets": _collect_imported_assets(path, recursive)
		}
	}


static func _collect_imported_assets(path: String, recursive: bool) -> Array:
	var assets := []
	var directory := DirAccess.open(path)
	if directory == null:
		return assets

	directory.list_dir_begin()
	var name := directory.get_next()
	while not name.is_empty():
		if not name.begins_with("."):
			var entry_path := NiuaMcpPathUtils.join_res_path(path, name)
			var is_directory := directory.current_is_dir()
			if is_directory:
				if recursive:
					assets.append_array(_collect_imported_assets(entry_path, true))
			elif entry_path.ends_with(".import"):
				var source_path := entry_path.trim_suffix(".import")
				var metadata := NiuaMcpImportMetadataQueries.load_metadata(source_path)
				assets.append(NiuaMcpImportMetadataQueries.summary(source_path, entry_path, metadata))
		name = directory.get_next()
	directory.list_dir_end()
	return assets


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
