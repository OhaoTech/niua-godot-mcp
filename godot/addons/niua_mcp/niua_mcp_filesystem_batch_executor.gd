@tool
extends RefCounted

const NiuaMcpFilesystemBatchDryRun = preload("niua_mcp_filesystem_batch_dry_run.gd")
const NiuaMcpFilesystemBatchResult = preload("niua_mcp_filesystem_batch_result.gd")


static func _execute_filesystem_batch_operation(operation: Dictionary, dry_run: bool, copy_entry: Callable, move_entry: Callable, delete_entry: Callable) -> Dictionary:
	var kind := str(operation.get("kind", operation.get("type", ""))).strip_edges()
	if dry_run:
		return NiuaMcpFilesystemBatchDryRun._dry_run_filesystem_batch_operation(kind, operation)

	match kind:
		"copy":
			return NiuaMcpFilesystemBatchResult._filesystem_batch_result(kind, copy_entry.call(operation))
		"move":
			return NiuaMcpFilesystemBatchResult._filesystem_batch_result(kind, move_entry.call(operation))
		"delete":
			return NiuaMcpFilesystemBatchResult._filesystem_batch_result(kind, delete_entry.call(operation))
		_:
			return NiuaMcpFilesystemBatchResult._filesystem_batch_error(kind, "unsupported filesystem batch operation: %s" % kind, "unsupported_operation")
