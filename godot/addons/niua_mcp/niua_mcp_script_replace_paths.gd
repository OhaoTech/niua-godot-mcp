@tool
extends RefCounted

const NiuaMcpFilesystemReadOperations = preload("niua_mcp_filesystem_read_operations.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpScriptFileUtils = preload("niua_mcp_script_file_utils.gd")


static func script_paths_for_replace(body: Dictionary, max_files: int):
	var raw_paths = body.get("paths", [])
	if typeof(raw_paths) == TYPE_ARRAY and raw_paths.size() > 0:
		if raw_paths.size() > max_files:
			return NiuaMcpScriptFileUtils.error("paths exceeds maxFiles: %d > %d" % [raw_paths.size(), max_files], "too_many_files")

		var paths := []
		var seen := {}
		for raw_path in raw_paths:
			var validation := NiuaMcpPathUtils.validate_script_path(str(raw_path))
			if not validation.get("ok", false):
				return validation
			var path := str(validation.get("path"))
			if not FileAccess.file_exists(path):
				return NiuaMcpScriptFileUtils.error("script not found: %s" % path, "not_found")
			if not seen.has(path):
				paths.append(path)
				seen[path] = true
		return paths

	if typeof(raw_paths) != TYPE_ARRAY:
		return NiuaMcpScriptFileUtils.error("paths must be an array when provided")

	var root_validation := NiuaMcpPathUtils.validate_res_path(str(body.get("rootPath", "res://")), true)
	if not root_validation.get("ok", false):
		return root_validation
	var root_path := str(root_validation.get("path"))
	if DirAccess.open(root_path) == null:
		return NiuaMcpScriptFileUtils.error("script replace root not found: %s" % root_path, "not_found")

	var collected := []
	collect_script_paths(root_path, collected, max_files)
	return collected


static func collect_script_paths(path: String, collected: Array, max_files: int) -> void:
	if collected.size() >= max_files:
		return

	var directory := DirAccess.open(path)
	if directory == null:
		return

	# Determinism (B6): DirAccess iteration order is filesystem-dependent; walk
	# each directory in sorted name-ascending order so the visited-file list —
	# and which files survive the max_files cut — is stable across runs.
	for listed in NiuaMcpFilesystemReadOperations.sorted_directory_listing(directory):
		if collected.size() >= max_files:
			break
		var entry_path := NiuaMcpPathUtils.join_res_path(path, str(listed.get("name")))
		if bool(listed.get("isDirectory")):
			collect_script_paths(entry_path, collected, max_files)
		elif entry_path.ends_with(".gd"):
			collected.append(entry_path)
