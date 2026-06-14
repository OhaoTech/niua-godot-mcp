@tool
extends RefCounted

const NiuaMcpFilesystemBatchExecutor = preload("niua_mcp_filesystem_batch_executor.gd")
const NiuaMcpFilesystemBatchResult = preload("niua_mcp_filesystem_batch_result.gd")


static func batch_operations(body: Dictionary, copy_entry: Callable, move_entry: Callable, delete_entry: Callable) -> Dictionary:
	var raw_operations = body.get("operations", [])
	if typeof(raw_operations) != TYPE_ARRAY:
		return NiuaMcpFilesystemBatchResult._error("operations array is required")
	if raw_operations.is_empty():
		return NiuaMcpFilesystemBatchResult._error("operations array must not be empty")

	var continue_on_error := bool(body.get("continueOnError", false))
	var dry_run := bool(body.get("dryRun", false))
	var results := []
	var ok_count := 0
	var error_count := 0

	for index in range(raw_operations.size()):
		var raw_operation = raw_operations[index]
		if typeof(raw_operation) != TYPE_DICTIONARY:
			results.append({
				"index": index,
				"ok": false,
				"kind": "",
				"error": "filesystem batch operation must be an object",
				"errorCode": "bad_request"
			})
			error_count += 1
			if not continue_on_error:
				break
			continue

		var operation: Dictionary = raw_operation
		var result := NiuaMcpFilesystemBatchExecutor._execute_filesystem_batch_operation(operation, dry_run, copy_entry, move_entry, delete_entry)
		result["index"] = index
		results.append(result)
		if bool(result.get("ok", false)):
			ok_count += 1
		else:
			error_count += 1
			if not continue_on_error:
				break

	var data := {
		"okCount": ok_count,
		"errorCount": error_count,
		"processedCount": results.size(),
		"continueOnError": continue_on_error,
		"dryRun": dry_run,
		"operations": results
	}

	if error_count > 0:
		return {
			"ok": false,
			"error": "filesystem batch completed with %d error(s)" % error_count,
			"errorCode": "batch_failed",
			"data": data
		}

	return {
		"ok": true,
		"data": data
	}
