@tool
extends RefCounted

const NiuaMcpFilesystemReadOperations = preload("niua_mcp_filesystem_read_operations.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpScriptAnalysisOperations = preload("niua_mcp_script_analysis_operations.gd")
const NiuaMcpScriptFileUtils = preload("niua_mcp_script_file_utils.gd")
const NiuaMcpScriptReplaceLiteral = preload("niua_mcp_script_replace_literal.gd")
const NiuaMcpScriptReplaceWriter = preload("niua_mcp_script_replace_writer.gd")


static func edit_script(body: Dictionary) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_script_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	if not FileAccess.file_exists(path):
		return NiuaMcpScriptFileUtils.error("script not found: %s" % path, "not_found")

	var old_text := str(body.get("oldText", ""))
	if old_text.is_empty():
		return NiuaMcpScriptFileUtils.error("oldText is required")
	var new_text := str(body.get("newText", ""))
	if new_text == old_text:
		return NiuaMcpScriptFileUtils.error("newText must differ from oldText")
	var replace_all := bool(body.get("replaceAll", false))

	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return NiuaMcpScriptFileUtils.error("failed to read script %s: %s" % [path, FileAccess.get_open_error()])
	var content := file.get_as_text()

	var replace_result := NiuaMcpScriptReplaceLiteral.replace_literal(content, old_text, new_text, true)
	var occurrences := int(replace_result.get("count", 0))
	if occurrences == 0:
		return NiuaMcpScriptFileUtils.error("oldText not found in %s (read_script the file to see current content)" % path, "not_found")
	if occurrences > 1 and not replace_all:
		return NiuaMcpScriptFileUtils.error("oldText matches %d locations in %s: make oldText unique by including surrounding lines, or pass replaceAll:true" % [occurrences, path], "conflict")

	var write_error := NiuaMcpScriptReplaceWriter.write_script_content(path, str(replace_result.get("content", content)))
	if write_error != OK:
		return NiuaMcpScriptFileUtils.error("failed to write script %s: %s" % [path, write_error])

	# Read-back (B4): replacements is the count actually applied and totalLines
	# comes from re-reading the written file, not an echo of the request.
	var written := FileAccess.open(path, FileAccess.READ)
	if written == null:
		return NiuaMcpScriptFileUtils.error("failed to re-read script after edit %s: %s" % [path, FileAccess.get_open_error()])
	var data := {
		"path": path,
		"replacements": occurrences,
		"totalLines": NiuaMcpFilesystemReadOperations.line_count(written.get_as_text())
	}

	if bool(body.get("validate", true)):
		var checked := _parse_check(path)
		data["valid"] = checked.get("valid")
		data["parseErrors"] = checked.get("parseErrors")

	return {
		"ok": true,
		"data": data
	}


static func _parse_check(path: String) -> Dictionary:
	# Parse truth (B): reuse validate_script so the post-edit check and the
	# standalone tool can never disagree. The edit already happened — valid:false
	# means the file now has parse errors and must be fixed or reverted.
	var response := NiuaMcpScriptAnalysisOperations.validate_script({ "path": path })
	if not bool(response.get("ok", false)):
		return {
			"valid": false,
			"parseErrors": [str(response.get("error", "validate_script failed"))]
		}

	var validation_data = response.get("data", {})
	if bool(validation_data.get("valid", false)):
		return {
			"valid": true,
			"parseErrors": []
		}

	var parse_errors := []
	if validation_data.has("error"):
		parse_errors.append(str(validation_data.get("error")))
	else:
		parse_errors.append("GDScript reload failed with Godot error %s (run diagnose_script for line-level parser output)" % str(validation_data.get("errorCode", "unknown")))
	return {
		"valid": false,
		"parseErrors": parse_errors
	}
