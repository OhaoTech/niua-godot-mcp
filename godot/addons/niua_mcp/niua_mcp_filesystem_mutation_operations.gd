@tool
extends RefCounted

const NiuaMcpFilesystemResult = preload("niua_mcp_filesystem_result.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpPayloadLimits = preload("niua_mcp_payload_limits.gd")


static func create_folder(body: Dictionary) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_writable_res_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	var error := DirAccess.make_dir_recursive_absolute(str(validation.get("globalPath")))
	if error != OK and not DirAccess.dir_exists_absolute(str(validation.get("globalPath"))):
		return NiuaMcpFilesystemResult.error("failed to create folder %s: %s" % [path, error])

	return {
		"ok": true,
		"data": {
			"path": path,
			"type": "directory"
		}
	}


static func write_text_file(body: Dictionary) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_writable_res_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	var content := str(body.get("content", ""))
	var size_validation := NiuaMcpPayloadLimits.validate_size("content", content.to_utf8_buffer().size())
	if not size_validation.get("ok", false):
		return size_validation
	var parent_error := NiuaMcpPathUtils.ensure_parent_directory(path)
	if parent_error != OK:
		return NiuaMcpFilesystemResult.error("failed to create parent directory for %s: %s" % [path, parent_error])

	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		return NiuaMcpFilesystemResult.error("failed to write file %s: %s" % [path, FileAccess.get_open_error()])

	file.store_string(content)
	file.close()
	return {
		"ok": true,
		"data": {
			"path": path,
			"bytes": content.to_utf8_buffer().size()
		}
	}


static func write_binary_file(body: Dictionary) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_writable_res_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	var content_base64 := str(body.get("contentBase64", ""))
	if content_base64.is_empty():
		return NiuaMcpFilesystemResult.error("contentBase64 is required")

	var bytes := Marshalls.base64_to_raw(content_base64)
	var size_validation := NiuaMcpPayloadLimits.validate_size("content", bytes.size())
	if not size_validation.get("ok", false):
		return size_validation
	var parent_error := NiuaMcpPathUtils.ensure_parent_directory(path)
	if parent_error != OK:
		return NiuaMcpFilesystemResult.error("failed to create parent directory for %s: %s" % [path, parent_error])

	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		return NiuaMcpFilesystemResult.error("failed to write file %s: %s" % [path, FileAccess.get_open_error()])

	file.store_buffer(bytes)
	file.close()
	return {
		"ok": true,
		"data": {
			"path": path,
			"bytes": bytes.size()
		}
	}


static func move_entry(body: Dictionary) -> Dictionary:
	var from_validation := NiuaMcpPathUtils.validate_writable_res_path(str(body.get("fromPath", "")))
	if not from_validation.get("ok", false):
		return from_validation
	var to_validation := NiuaMcpPathUtils.validate_writable_res_path(str(body.get("toPath", "")))
	if not to_validation.get("ok", false):
		return to_validation

	var from_path := str(from_validation.get("path"))
	var to_path := str(to_validation.get("path"))

	# DirAccess.rename() silently overwrites an existing destination. Refuse
	# unless the caller opts in, mirroring copy_entry and the batch dry-run.
	if not bool(body.get("overwrite", false)):
		var to_global := str(to_validation.get("globalPath"))
		if FileAccess.file_exists(to_path) or DirAccess.dir_exists_absolute(to_global):
			return NiuaMcpFilesystemResult.error("destination already exists: %s (pass overwrite:true to replace)" % to_path, "conflict")

	var parent_error := NiuaMcpPathUtils.ensure_parent_directory(to_path)
	if parent_error != OK:
		return NiuaMcpFilesystemResult.error("failed to create parent directory for %s: %s" % [to_path, parent_error])

	var directory := DirAccess.open("res://")
	if directory == null:
		return NiuaMcpFilesystemResult.error("failed to open project filesystem root")

	var error := directory.rename(NiuaMcpPathUtils.res_relative_path(from_path), NiuaMcpPathUtils.res_relative_path(to_path))
	if error != OK:
		return NiuaMcpFilesystemResult.error("failed to move %s to %s: %s" % [from_path, to_path, error])

	return {
		"ok": true,
		"data": {
			"fromPath": from_path,
			"toPath": to_path
		}
	}


static func delete_entry(body: Dictionary) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_writable_res_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	var directory := DirAccess.open("res://")
	if directory == null:
		return NiuaMcpFilesystemResult.error("failed to open project filesystem root")

	var error := directory.remove(NiuaMcpPathUtils.res_relative_path(path))
	if error != OK:
		return NiuaMcpFilesystemResult.error("failed to delete %s: %s" % [path, error])

	return {
		"ok": true,
		"data": {
			"path": path
		}
	}
