@tool
extends RefCounted


static func diagnostic_issues(source_path: String, metadata_path: String, metadata: Dictionary, metadata_exists: bool, metadata_load_error: int) -> Array:
	var issues := []
	var source_exists := FileAccess.file_exists(source_path)
	if not source_exists:
		issues.append({
			"code": "missing_source",
			"severity": "error",
			"path": source_path
		})

	if not metadata_exists:
		issues.append({
			"code": "missing_metadata",
			"severity": "error",
			"path": metadata_path
		})
		return issues

	if metadata_load_error != OK:
		issues.append({
			"code": "metadata_unreadable",
			"severity": "error",
			"path": metadata_path,
			"error": metadata_load_error
		})
		return issues

	if source_exists:
		var source_modified := FileAccess.get_modified_time(source_path)
		var metadata_modified := FileAccess.get_modified_time(metadata_path)
		if source_modified > metadata_modified:
			issues.append({
				"code": "source_newer_than_metadata",
				"severity": "warning",
				"path": source_path,
				"sourceModifiedTime": source_modified,
				"metadataModifiedTime": metadata_modified
			})

	var remap = metadata.get("remap", {})
	if typeof(remap) == TYPE_DICTIONARY:
		var imported_path := str(remap.get("path", ""))
		if imported_path.is_empty():
			issues.append({
				"code": "missing_import_target_path",
				"severity": "warning",
				"path": metadata_path
			})
		elif not FileAccess.file_exists(imported_path) and not ResourceLoader.exists(imported_path):
			issues.append({
				"code": "missing_import_target",
				"severity": "error",
				"path": imported_path
			})

	var deps = metadata.get("deps", {})
	if typeof(deps) == TYPE_DICTIONARY:
		var dest_files = deps.get("dest_files", [])
		if typeof(dest_files) == TYPE_ARRAY:
			for raw_dest in dest_files:
				var dest_path := str(raw_dest)
				if not dest_path.is_empty() and not FileAccess.file_exists(dest_path) and not ResourceLoader.exists(dest_path):
					issues.append({
						"code": "missing_dependency_dest",
						"severity": "error",
						"path": dest_path
					})

	return issues
