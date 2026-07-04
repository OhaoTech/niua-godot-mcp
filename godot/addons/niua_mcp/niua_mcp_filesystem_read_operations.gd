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
	var total_lines := line_count(content)
	# Token diet: lineStart (1-based) and lineCount bound the returned content
	# to a line range; totalLines always reports the whole file.
	if query.has("lineStart") or query.has("lineCount"):
		return _ranged_text_response(path, content, total_lines, query)

	return {
		"ok": true,
		"data": {
			"path": path,
			"content": content,
			"bytes": content.to_utf8_buffer().size(),
			"totalLines": total_lines
		}
	}


static func line_count(content: String) -> int:
	# Line semantics shared by ranged reads, search_in_scripts, and edit_script:
	# "\n"-separated segments, ignoring one trailing newline (wc -l style).
	if content.is_empty():
		return 0
	var count := content.split("\n").size()
	if content.ends_with("\n"):
		count -= 1
	return count


static func _ranged_text_response(path: String, content: String, total_lines: int, query: Dictionary) -> Dictionary:
	var line_start := str(query.get("lineStart", "1")).to_int()
	if line_start < 1 or line_start > total_lines:
		return NiuaMcpFilesystemResult.error("lineStart %d is out of range for %s: totalLines is %d (pass 1 <= lineStart <= totalLines)" % [line_start, path, total_lines])

	var remaining := total_lines - line_start + 1
	var requested := remaining
	if query.has("lineCount"):
		requested = str(query.get("lineCount", "1")).to_int()
		if requested < 1:
			return NiuaMcpFilesystemResult.error("lineCount must be >= 1: %d" % requested)

	var lines := content.split("\n")
	var end_index := line_start - 1 + mini(requested, remaining)
	var ranged := "\n".join(lines.slice(line_start - 1, end_index))
	return {
		"ok": true,
		"data": {
			"path": path,
			"content": ranged,
			"bytes": ranged.to_utf8_buffer().size(),
			"totalLines": total_lines,
			"lineStart": line_start
		}
	}


static func directory_entries(path: String, recursive: bool, exclude: PackedStringArray = PackedStringArray(), max_depth: int = 0, depth: int = 1) -> Array:
	var entries := []
	var directory := DirAccess.open(path)
	if directory == null:
		return entries

	# Determinism (B6): DirAccess iteration order is filesystem-dependent, so
	# entries are sorted name-ascending within each directory (directories and
	# files interleaved). Recursive listings expand each subdirectory depth-first
	# in that same order, so identical trees always produce identical responses.
	for listed in sorted_directory_listing(directory):
		var entry_name := str(listed.get("name"))
		var entry_path := NiuaMcpPathUtils.join_res_path(path, entry_name)
		if _excluded(entry_path, exclude):
			continue
		var is_directory := bool(listed.get("isDirectory"))
		entries.append({
			"name": entry_name,
			"path": entry_path,
			"type": "directory" if is_directory else "file"
		})
		if recursive and is_directory and (max_depth <= 0 or depth < max_depth):
			entries.append_array(directory_entries(entry_path, true, exclude, max_depth, depth + 1))
	return entries


static func sorted_directory_listing(directory: DirAccess) -> Array:
	var listed := []
	directory.list_dir_begin()
	var name := directory.get_next()
	while not name.is_empty():
		if not name.begins_with("."):
			listed.append({
				"name": name,
				"isDirectory": directory.current_is_dir()
			})
		name = directory.get_next()
	directory.list_dir_end()
	listed.sort_custom(func(left, right): return str(left.get("name")) < str(right.get("name")))
	return listed


static func _excluded(entry_path: String, exclude: PackedStringArray) -> bool:
	for term in exclude:
		if not term.is_empty() and entry_path.contains(term):
			return true
	return false
