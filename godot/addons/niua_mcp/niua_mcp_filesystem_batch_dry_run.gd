@tool
extends RefCounted

const NiuaMcpFilesystemBatchResult = preload("niua_mcp_filesystem_batch_result.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")


static func _dry_run_filesystem_batch_operation(kind: String, operation: Dictionary) -> Dictionary:
	match kind:
		"copy":
			return _dry_run_filesystem_copy_operation(operation)
		"move":
			return _dry_run_filesystem_move_operation(operation)
		"delete":
			return _dry_run_filesystem_delete_operation(operation)
		_:
			return NiuaMcpFilesystemBatchResult._filesystem_batch_error(kind, "unsupported filesystem batch operation: %s" % kind, "unsupported_operation")


static func _dry_run_filesystem_copy_operation(operation: Dictionary) -> Dictionary:
	var from_validation := NiuaMcpPathUtils.validate_res_path(str(operation.get("fromPath", "")))
	if not from_validation.get("ok", false):
		return NiuaMcpFilesystemBatchResult._filesystem_batch_error("copy", str(from_validation.get("error", "invalid copy source")), str(from_validation.get("errorCode", "bad_request")))
	var to_validation := NiuaMcpPathUtils.validate_res_path(str(operation.get("toPath", "")))
	if not to_validation.get("ok", false):
		return NiuaMcpFilesystemBatchResult._filesystem_batch_error("copy", str(to_validation.get("error", "invalid copy destination")), str(to_validation.get("errorCode", "bad_request")))

	var from_path := str(from_validation.get("path"))
	var to_path := str(to_validation.get("path"))
	var from_type := NiuaMcpPathUtils.filesystem_entry_type(from_path)
	if from_path == to_path:
		return NiuaMcpFilesystemBatchResult._filesystem_batch_error("copy", "copy source and destination must differ: %s" % from_path)
	if from_type == "missing":
		return NiuaMcpFilesystemBatchResult._filesystem_batch_error("copy", "copy source not found: %s" % from_path, "not_found")
	if from_type == "directory" and to_path.begins_with(NiuaMcpPathUtils.res_child_prefix(from_path)):
		return NiuaMcpFilesystemBatchResult._filesystem_batch_error("copy", "cannot copy a directory into itself: %s -> %s" % [from_path, to_path])

	var overwrite := bool(operation.get("overwrite", false))
	if NiuaMcpPathUtils.filesystem_entry_exists(to_path) and not overwrite:
		return NiuaMcpFilesystemBatchResult._filesystem_batch_error("copy", "copy destination already exists: %s" % to_path, "conflict")

	return {
		"ok": true,
		"kind": "copy",
		"data": {
			"fromPath": from_path,
			"toPath": to_path,
			"type": from_type,
			"overwrite": overwrite,
			"wouldChange": true
		}
	}


static func _dry_run_filesystem_move_operation(operation: Dictionary) -> Dictionary:
	var from_validation := NiuaMcpPathUtils.validate_res_path(str(operation.get("fromPath", "")))
	if not from_validation.get("ok", false):
		return NiuaMcpFilesystemBatchResult._filesystem_batch_error("move", str(from_validation.get("error", "invalid move source")), str(from_validation.get("errorCode", "bad_request")))
	var to_validation := NiuaMcpPathUtils.validate_res_path(str(operation.get("toPath", "")))
	if not to_validation.get("ok", false):
		return NiuaMcpFilesystemBatchResult._filesystem_batch_error("move", str(to_validation.get("error", "invalid move destination")), str(to_validation.get("errorCode", "bad_request")))

	var from_path := str(from_validation.get("path"))
	var to_path := str(to_validation.get("path"))
	var from_type := NiuaMcpPathUtils.filesystem_entry_type(from_path)
	if from_path == to_path:
		return NiuaMcpFilesystemBatchResult._filesystem_batch_error("move", "move source and destination must differ: %s" % from_path)
	if from_type == "missing":
		return NiuaMcpFilesystemBatchResult._filesystem_batch_error("move", "move source not found: %s" % from_path, "not_found")
	if NiuaMcpPathUtils.filesystem_entry_exists(to_path):
		return NiuaMcpFilesystemBatchResult._filesystem_batch_error("move", "move destination already exists: %s" % to_path, "conflict")

	return {
		"ok": true,
		"kind": "move",
		"data": {
			"fromPath": from_path,
			"toPath": to_path,
			"type": from_type,
			"wouldChange": true
		}
	}


static func _dry_run_filesystem_delete_operation(operation: Dictionary) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_res_path(str(operation.get("path", "")))
	if not validation.get("ok", false):
		return NiuaMcpFilesystemBatchResult._filesystem_batch_error("delete", str(validation.get("error", "invalid delete path")), str(validation.get("errorCode", "bad_request")))

	var path := str(validation.get("path"))
	var entry_type := NiuaMcpPathUtils.filesystem_entry_type(path)
	if entry_type == "missing":
		return NiuaMcpFilesystemBatchResult._filesystem_batch_error("delete", "delete target not found: %s" % path, "not_found")

	return {
		"ok": true,
		"kind": "delete",
		"data": {
			"path": path,
			"type": entry_type,
			"wouldChange": true
		}
	}
