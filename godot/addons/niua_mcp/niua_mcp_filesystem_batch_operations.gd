@tool
extends RefCounted

const NiuaMcpFilesystemBatchDryRun = preload("niua_mcp_filesystem_batch_dry_run.gd")
const NiuaMcpFilesystemBatchExecutor = preload("niua_mcp_filesystem_batch_executor.gd")
const NiuaMcpFilesystemBatchResult = preload("niua_mcp_filesystem_batch_result.gd")
const NiuaMcpFilesystemBatchRunner = preload("niua_mcp_filesystem_batch_runner.gd")


static func batch_operations(body: Dictionary, copy_entry: Callable, move_entry: Callable, delete_entry: Callable) -> Dictionary:
	return NiuaMcpFilesystemBatchRunner.batch_operations(body, copy_entry, move_entry, delete_entry)


static func batch_operation_message(operation: Dictionary) -> String:
	return NiuaMcpFilesystemBatchResult.batch_operation_message(operation)
