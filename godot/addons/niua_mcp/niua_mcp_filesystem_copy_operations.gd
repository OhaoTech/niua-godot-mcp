@tool
extends RefCounted

const NiuaMcpFilesystemResult = preload("niua_mcp_filesystem_result.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")


static func copy_entry(body: Dictionary) -> Dictionary:
	var from_validation := NiuaMcpPathUtils.validate_res_path(str(body.get("fromPath", "")))
	if not from_validation.get("ok", false):
		return from_validation
	var to_validation := NiuaMcpPathUtils.validate_writable_res_path(str(body.get("toPath", "")))
	if not to_validation.get("ok", false):
		return to_validation

	var from_path := str(from_validation.get("path"))
	var to_path := str(to_validation.get("path"))
	if from_path == to_path:
		return NiuaMcpFilesystemResult.error("copy source and destination must differ: %s" % from_path)

	var from_is_file := FileAccess.file_exists(from_path)
	var from_is_directory := DirAccess.dir_exists_absolute(str(from_validation.get("globalPath")))
	if not from_is_file and not from_is_directory:
		return NiuaMcpFilesystemResult.error("copy source not found: %s" % from_path, "not_found")

	if from_is_directory and to_path.begins_with(NiuaMcpPathUtils.res_child_prefix(from_path)):
		return NiuaMcpFilesystemResult.error("cannot copy a directory into itself: %s -> %s" % [from_path, to_path])

	var overwrite := bool(body.get("overwrite", false))
	if NiuaMcpPathUtils.filesystem_entry_exists(to_path) and not overwrite:
		return NiuaMcpFilesystemResult.error("copy destination already exists: %s" % to_path, "conflict")

	var copied_entries := []
	var copy_error := OK
	if from_is_directory:
		copy_error = _copy_directory_recursive(from_path, to_path, overwrite, copied_entries)
	else:
		copy_error = _copy_file_entry(from_path, to_path, overwrite, copied_entries)

	if copy_error != OK:
		return NiuaMcpFilesystemResult.error("failed to copy %s to %s: %s" % [from_path, to_path, copy_error])

	return {
		"ok": true,
		"data": {
			"fromPath": from_path,
			"toPath": to_path,
			"type": "directory" if from_is_directory else "file",
			"overwrite": overwrite,
			"copiedEntries": copied_entries
		}
	}


static func _copy_file_entry(from_path: String, to_path: String, overwrite: bool, copied_entries: Array) -> int:
	var to_global := ProjectSettings.globalize_path(to_path)
	if DirAccess.dir_exists_absolute(to_global):
		return ERR_ALREADY_EXISTS
	if FileAccess.file_exists(to_path):
		if not overwrite:
			return ERR_ALREADY_EXISTS
		var remove_error := DirAccess.remove_absolute(to_global)
		if remove_error != OK:
			return remove_error

	var parent_error := NiuaMcpPathUtils.ensure_parent_directory(to_path)
	if parent_error != OK:
		return parent_error

	var copy_error := DirAccess.copy_absolute(ProjectSettings.globalize_path(from_path), to_global, -1)
	if copy_error == OK:
		copied_entries.append({
			"path": to_path,
			"type": "file"
		})
	return copy_error


static func _copy_directory_recursive(from_path: String, to_path: String, overwrite: bool, copied_entries: Array) -> int:
	if FileAccess.file_exists(to_path):
		return ERR_ALREADY_EXISTS

	var to_global := ProjectSettings.globalize_path(to_path)
	if not DirAccess.dir_exists_absolute(to_global):
		var make_error := DirAccess.make_dir_recursive_absolute(to_global)
		if make_error != OK:
			return make_error

	copied_entries.append({
		"path": to_path,
		"type": "directory"
	})

	var directory := DirAccess.open(from_path)
	if directory == null:
		return DirAccess.get_open_error()

	for child_directory in directory.get_directories():
		var directory_error := _copy_directory_recursive(NiuaMcpPathUtils.join_res_path(from_path, child_directory), NiuaMcpPathUtils.join_res_path(to_path, child_directory), overwrite, copied_entries)
		if directory_error != OK:
			return directory_error

	for child_file in directory.get_files():
		var file_error := _copy_file_entry(NiuaMcpPathUtils.join_res_path(from_path, child_file), NiuaMcpPathUtils.join_res_path(to_path, child_file), overwrite, copied_entries)
		if file_error != OK:
			return file_error

	return OK
