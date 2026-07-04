@tool
extends RefCounted

const NiuaMcpScriptEditOperations = preload("niua_mcp_script_edit_operations.gd")
const NiuaMcpScriptFileBasicOperations = preload("niua_mcp_script_file_basic_operations.gd")
const NiuaMcpScriptFileUtils = preload("niua_mcp_script_file_utils.gd")
const NiuaMcpScriptReplaceOperations = preload("niua_mcp_script_replace_operations.gd")


static func write_script_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpScriptFileBasicOperations.write_script(body)
	if bool(response.get("ok", false)):
		var data = response.get("data", {})
		NiuaMcpScriptFileUtils.refresh(refresh_filesystem)
		NiuaMcpScriptFileUtils.remember(remember, "Wrote text file %s" % str(data.get("path", "")))
	return response


static func edit_script_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpScriptEditOperations.edit_script(body)
	if bool(response.get("ok", false)):
		var data = response.get("data", {})
		var path := str(data.get("path", ""))
		NiuaMcpScriptFileUtils.refresh_path(refresh_filesystem, path)
		NiuaMcpScriptFileUtils.remember(remember, "Edited script %s: %d replacement(s)" % [path, int(data.get("replacements", 0))])
	return response


static func replace_in_scripts_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpScriptReplaceOperations.replace_in_scripts(body)
	if bool(response.get("ok", false)):
		var data = response.get("data", {})
		var dry_run := bool(data.get("dryRun", true))
		var matched_files := int(data.get("matchedFiles", 0))
		var total_replacements := int(data.get("totalReplacements", 0))
		if not dry_run and matched_files > 0:
			NiuaMcpScriptFileUtils.refresh(refresh_filesystem)
		NiuaMcpScriptFileUtils.remember(remember, "Script replace %s: %d replacements across %d file(s)" % ["preview" if dry_run else "applied", total_replacements, matched_files])
	return response
