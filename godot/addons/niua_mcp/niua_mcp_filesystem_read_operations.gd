@tool
extends RefCounted

const NiuaMcpFilesystemResult = preload("niua_mcp_filesystem_result.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")


static func list_filesystem(query: Dictionary) -> Dictionary:
	var raw_path := str(query.get("path", "res://"))
	var recursive := str(query.get("recursive", "false")).to_lower() == "true"
	# Token diet: maxDepth bounds recursion (0 = unlimited); exclude is a CSV of
	# substrings matched against entry paths (e.g. "addons,.godot").
	var max_depth := str(query.get("maxDepth", "0")).to_int()
	var exclude := PackedStringArray()
	var raw_exclude := str(query.get("exclude", ""))
	if not raw_exclude.is_empty():
		for term in raw_exclude.split(",", false):
			exclude.append(term.strip_edges())

	var validation := NiuaMcpPathUtils.validate_res_path(raw_path, true)
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	var directory := DirAccess.open(path)
	if directory == null:
		return NiuaMcpFilesystemResult.error("directory not found: %s" % path, "not_found")

	return {
		"ok": true,
		"data": {
			"path": path,
			"recursive": recursive,
			"entries": directory_entries(path, recursive, exclude, max_depth, 1)
		}
	}


static func read_text_file(query: Dictionary) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_res_path(str(query.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	if not FileAccess.file_exists(path):
		return NiuaMcpFilesystemResult.error("file not found: %s" % path, "not_found")

	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return NiuaMcpFilesystemResult.error("failed to read file %s: %s" % [path, FileAccess.get_open_error()])

	var content := file.get_as_text()
	return {
		"ok": true,
		"data": {
			"path": path,
			"content": content,
			"bytes": content.to_utf8_buffer().size()
		}
	}


static func directory_entries(path: String, recursive: bool, exclude: PackedStringArray = PackedStringArray(), max_depth: int = 0, depth: int = 1) -> Array:
	var entries := []
	var directory := DirAccess.open(path)
	if directory == null:
		return entries

	directory.list_dir_begin()
	var name := directory.get_next()
	while not name.is_empty():
		if not name.begins_with("."):
			var entry_path := NiuaMcpPathUtils.join_res_path(path, name)
			if _excluded(entry_path, exclude):
				name = directory.get_next()
				continue
			var is_directory := directory.current_is_dir()
			entries.append({
				"name": name,
				"path": entry_path,
				"type": "directory" if is_directory else "file"
			})
			if recursive and is_directory and (max_depth <= 0 or depth < max_depth):
				entries.append_array(directory_entries(entry_path, true, exclude, max_depth, depth + 1))
		name = directory.get_next()
	directory.list_dir_end()
	return entries


static func _excluded(entry_path: String, exclude: PackedStringArray) -> bool:
	for term in exclude:
		if not term.is_empty() and entry_path.contains(term):
			return true
	return false
