@tool
extends RefCounted

const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")


static func event_summary(kind: String, raw_paths, extra: Dictionary, resource_filesystem) -> Dictionary:
	var paths := _string_values(raw_paths)
	var event := {
		"kind": kind,
		"timeMsec": Time.get_ticks_msec(),
		"paths": paths,
		"invalidPaths": _invalid_import_paths(paths, resource_filesystem)
	}
	for raw_key in extra.keys():
		event[str(raw_key)] = NiuaMcpVariantCodec.variant_to_json(extra.get(raw_key))

	return event


static func _string_values(raw_values) -> Array:
	var values := []
	if typeof(raw_values) == TYPE_ARRAY or typeof(raw_values) == TYPE_PACKED_STRING_ARRAY:
		for raw_value in raw_values:
			values.append(str(raw_value))
	elif raw_values != null:
		var value := str(raw_values)
		if not value.is_empty():
			values.append(value)
	return values


static func _invalid_import_paths(paths: Array, resource_filesystem) -> Array:
	var invalid := []
	if resource_filesystem == null or not resource_filesystem.has_method("get_filesystem_path"):
		return invalid

	for raw_path in paths:
		var path := str(raw_path)
		if not path.begins_with("res://"):
			continue

		var directory_path := path.get_base_dir()
		if directory_path == ".":
			directory_path = "res://"

		var directory = resource_filesystem.get_filesystem_path(directory_path)
		if directory == null or not directory.has_method("find_file_index") or not directory.has_method("get_file_import_is_valid"):
			continue

		var index := int(directory.find_file_index(path.get_file()))
		if index >= 0 and not bool(directory.get_file_import_is_valid(index)):
			invalid.append(path)
	return invalid
