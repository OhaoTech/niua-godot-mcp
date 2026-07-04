@tool
extends RefCounted

const NiuaMcpFilesystemReadOperations = preload("niua_mcp_filesystem_read_operations.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpScriptFileUtils = preload("niua_mcp_script_file_utils.gd")

const MAX_RESULTS_CAP := 200
const MATCH_TEXT_LIMIT := 160


static func search_in_scripts(query: Dictionary) -> Dictionary:
	var needle := str(query.get("query", ""))
	if needle.is_empty():
		return NiuaMcpScriptFileUtils.error("query is required")

	var use_regex := str(query.get("regex", "false")).to_lower() == "true"
	var case_sensitive := str(query.get("caseSensitive", "false")).to_lower() == "true"
	var max_results := int(clamp(str(query.get("maxResults", "50")).to_int(), 1, MAX_RESULTS_CAP))

	var prefix_validation := NiuaMcpPathUtils.validate_res_path(str(query.get("pathPrefix", "res://")), true)
	if not prefix_validation.get("ok", false):
		return prefix_validation
	var path_prefix := str(prefix_validation.get("path"))
	if DirAccess.open(path_prefix) == null:
		return NiuaMcpScriptFileUtils.error("script search root not found: %s (pass a res:// directory pathPrefix)" % path_prefix, "not_found")

	# Token diet: exclude is a CSV of substrings matched against entry paths
	# (e.g. "addons,.godot"), the same idiom as list_filesystem.
	var exclude := PackedStringArray()
	var raw_exclude := str(query.get("exclude", ""))
	if not raw_exclude.is_empty():
		for term in raw_exclude.split(",", false):
			exclude.append(str(term).strip_edges())

	var pattern: RegEx = null
	if use_regex:
		pattern = RegEx.new()
		var compile_error := pattern.compile(needle if case_sensitive else "(?i)" + needle)
		if compile_error != OK:
			return NiuaMcpScriptFileUtils.error("invalid regex pattern: %s (fix the pattern or set regex:false for plain-text search)" % needle)

	var script_paths := []
	_collect_script_paths(path_prefix, exclude, script_paths)

	# Determinism (B6): script_paths arrive in sorted file order, so matches are
	# emitted in sorted file order then ascending line order.
	var matches := []
	var total_matches := 0
	for script_path in script_paths:
		var file := FileAccess.open(str(script_path), FileAccess.READ)
		if file == null:
			continue
		var content := file.get_as_text()
		var lines := content.split("\n")
		var effective_lines := NiuaMcpFilesystemReadOperations.line_count(content)
		for index in effective_lines:
			var line := lines[index]
			if not _line_matches(line, needle, pattern, case_sensitive):
				continue
			total_matches += 1
			if matches.size() < max_results:
				matches.append({
					"path": script_path,
					"line": index + 1,
					"text": line.strip_edges().left(MATCH_TEXT_LIMIT)
				})

	return {
		"ok": true,
		"data": {
			"query": needle,
			"matches": matches,
			"totalMatches": total_matches,
			"truncated": total_matches > matches.size()
		}
	}


static func _collect_script_paths(path: String, exclude: PackedStringArray, collected: Array) -> void:
	var directory := DirAccess.open(path)
	if directory == null:
		return

	# Determinism (B6): reuse the shared sorted lister so identical trees always
	# produce identical match order.
	for listed in NiuaMcpFilesystemReadOperations.sorted_directory_listing(directory):
		var entry_path := NiuaMcpPathUtils.join_res_path(path, str(listed.get("name")))
		if NiuaMcpFilesystemReadOperations._excluded(entry_path, exclude):
			continue
		if bool(listed.get("isDirectory")):
			_collect_script_paths(entry_path, exclude, collected)
		elif entry_path.ends_with(".gd"):
			collected.append(entry_path)


static func _line_matches(line: String, needle: String, pattern: RegEx, case_sensitive: bool) -> bool:
	if pattern != null:
		return pattern.search(line) != null
	if case_sensitive:
		return line.find(needle) != -1
	return line.findn(needle) != -1
