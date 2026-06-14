@tool
extends RefCounted

const NiuaMcpFilesystemResult = preload("niua_mcp_filesystem_result.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")


static func list_filesystem(query: Dictionary) -> Dictionary:
	var raw_path := str(query.get("path", "res://"))
	var recursive := str(query.get("recursive", "false")).to_lower() == "true"
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
			"entries": directory_entries(path, recursive)
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


static func directory_entries(path: String, recursive: bool) -> Array:
	var entries := []
	var directory := DirAccess.open(path)
	if directory == null:
		return entries

	directory.list_dir_begin()
	var name := directory.get_next()
	while not name.is_empty():
		if not name.begins_with("."):
			var entry_path := NiuaMcpPathUtils.join_res_path(path, name)
			var is_directory := directory.current_is_dir()
			entries.append({
				"name": name,
				"path": entry_path,
				"type": "directory" if is_directory else "file"
			})
			if recursive and is_directory:
				entries.append_array(directory_entries(entry_path, true))
		name = directory.get_next()
	directory.list_dir_end()
	return entries
