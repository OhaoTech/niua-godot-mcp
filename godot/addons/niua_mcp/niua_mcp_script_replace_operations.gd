@tool
extends RefCounted

const NiuaMcpScriptFileUtils = preload("niua_mcp_script_file_utils.gd")
const NiuaMcpScriptReplaceLiteral = preload("niua_mcp_script_replace_literal.gd")
const NiuaMcpScriptReplacePaths = preload("niua_mcp_script_replace_paths.gd")
const NiuaMcpScriptReplaceWriter = preload("niua_mcp_script_replace_writer.gd")


static func replace_in_scripts(body: Dictionary) -> Dictionary:
	var search := str(body.get("search", ""))
	if search.is_empty():
		return NiuaMcpScriptFileUtils.error("search is required")

	var replacement := str(body.get("replacement", ""))
	var dry_run := bool(body.get("dryRun", true))
	var case_sensitive := bool(body.get("caseSensitive", true))
	var max_files := int(clamp(int(body.get("maxFiles", 200)), 1, 1000))
	var max_replacements := int(clamp(int(body.get("maxReplacements", 1000)), 1, 10000))
	var script_paths = NiuaMcpScriptReplacePaths.script_paths_for_replace(body, max_files)
	if typeof(script_paths) == TYPE_DICTIONARY:
		return script_paths

	var changes := []
	var pending_writes := []
	var scanned_files := 0
	var total_replacements := 0

	for path in script_paths:
		scanned_files += 1
		var file := FileAccess.open(path, FileAccess.READ)
		if file == null:
			return NiuaMcpScriptFileUtils.error("failed to read script %s: %s" % [path, FileAccess.get_open_error()])

		var content := file.get_as_text()
		var replace_result := NiuaMcpScriptReplaceLiteral.replace_literal(content, search, replacement, case_sensitive)
		var replacements := int(replace_result.get("count", 0))
		if replacements == 0:
			continue

		total_replacements += replacements
		if total_replacements > max_replacements:
			return NiuaMcpScriptFileUtils.error("script replace exceeded maxReplacements: %d > %d" % [total_replacements, max_replacements], "too_many_replacements")

		var next_content := str(replace_result.get("content", content))
		changes.append({
			"path": path,
			"replacements": replacements,
			"bytesBefore": content.to_utf8_buffer().size(),
			"bytesAfter": next_content.to_utf8_buffer().size(),
			"changed": not dry_run
		})
		pending_writes.append({
			"path": path,
			"content": next_content
		})

	if not dry_run:
		for write in pending_writes:
			var write_error := NiuaMcpScriptReplaceWriter.write_script_content(str(write.get("path")), str(write.get("content")))
			if write_error != OK:
				return NiuaMcpScriptFileUtils.error("failed to write script %s: %s" % [write.get("path"), write_error])

	return {
		"ok": true,
		"data": {
			"dryRun": dry_run,
			"caseSensitive": case_sensitive,
			"search": search,
			"replacement": replacement,
			"scannedFiles": scanned_files,
			"matchedFiles": changes.size(),
			"totalReplacements": total_replacements,
			"changes": changes
		}
	}
