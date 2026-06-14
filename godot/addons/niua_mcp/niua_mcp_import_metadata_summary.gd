@tool
extends RefCounted


static func summary(source_path: String, metadata_path: String, metadata: Dictionary) -> Dictionary:
	var metadata_summary := {
		"path": source_path,
		"importMetadataPath": metadata_path,
		"sourceExists": FileAccess.file_exists(source_path),
		"metadata": metadata
	}

	var remap = metadata.get("remap", {})
	if typeof(remap) == TYPE_DICTIONARY:
		metadata_summary["importer"] = str(remap.get("importer", ""))
		metadata_summary["type"] = str(remap.get("type", ""))
		metadata_summary["importedPath"] = str(remap.get("path", ""))

	return metadata_summary
