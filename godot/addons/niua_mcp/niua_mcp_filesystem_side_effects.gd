@tool
extends RefCounted

const NiuaMcpFilesystemBatchOperations = preload("niua_mcp_filesystem_batch_operations.gd")
const NiuaMcpFilesystemCopyOperations = preload("niua_mcp_filesystem_copy_operations.gd")
const NiuaMcpFilesystemMutationOperations = preload("niua_mcp_filesystem_mutation_operations.gd")


static func create_folder_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpFilesystemMutationOperations.create_folder(body)
	if bool(response.get("ok", false)):
		var data = response.get("data", {})
		_refresh(refresh_filesystem)
		_remember(remember, "Created folder %s" % str(data.get("path", "")))
	return response


static func write_text_file_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpFilesystemMutationOperations.write_text_file(body)
	if bool(response.get("ok", false)):
		var data = response.get("data", {})
		_refresh(refresh_filesystem, str(data.get("path", "")))
		_remember(remember, "Wrote text file %s" % str(data.get("path", "")))
	return response


static func write_binary_file_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpFilesystemMutationOperations.write_binary_file(body)
	if bool(response.get("ok", false)):
		var data = response.get("data", {})
		_refresh(refresh_filesystem, str(data.get("path", "")))
		_remember(remember, "Wrote binary file %s" % str(data.get("path", "")))
	return response


static func move_entry_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpFilesystemMutationOperations.move_entry(body)
	if bool(response.get("ok", false)):
		var data = response.get("data", {})
		_refresh(refresh_filesystem)
		_remember(remember, "Moved %s to %s" % [str(data.get("fromPath", "")), str(data.get("toPath", ""))])
	return response


static func copy_entry_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpFilesystemCopyOperations.copy_entry(body)
	if bool(response.get("ok", false)):
		var data = response.get("data", {})
		_refresh(refresh_filesystem)
		_remember(remember, "Copied %s to %s" % [str(data.get("fromPath", "")), str(data.get("toPath", ""))])
	return response


static func batch_operations_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpFilesystemBatchOperations.batch_operations(
		body,
		func(operation: Dictionary) -> Dictionary: return NiuaMcpFilesystemCopyOperations.copy_entry(operation),
		func(operation: Dictionary) -> Dictionary: return NiuaMcpFilesystemMutationOperations.move_entry(operation),
		func(operation: Dictionary) -> Dictionary: return NiuaMcpFilesystemMutationOperations.delete_entry(operation)
	)
	var data = response.get("data", {})
	if typeof(data) == TYPE_DICTIONARY:
		var dry_run := bool(data.get("dryRun", false))
		var ok_count := int(data.get("okCount", 0))
		if not dry_run:
			var logged_count := 0
			for operation in data.get("operations", []):
				if typeof(operation) != TYPE_DICTIONARY or not bool(operation.get("ok", false)):
					continue
				var message := NiuaMcpFilesystemBatchOperations.batch_operation_message(operation)
				if not message.is_empty():
					_remember(remember, message)
					logged_count += 1
			if logged_count > 0:
				_refresh(refresh_filesystem)
		if bool(response.get("ok", false)) and not dry_run and ok_count > 0:
			_remember(remember, "Batch filesystem operations completed: %d" % ok_count)
	return response


static func delete_entry_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpFilesystemMutationOperations.delete_entry(body)
	if bool(response.get("ok", false)):
		var data = response.get("data", {})
		_refresh(refresh_filesystem)
		_remember(remember, "Deleted filesystem entry %s" % str(data.get("path", "")))
	return response


static func _refresh(refresh_filesystem: Callable, path: String = "") -> void:
	if refresh_filesystem.is_valid():
		if path.is_empty():
			refresh_filesystem.call()
		else:
			refresh_filesystem.call(path)


static func _remember(remember: Callable, message: String) -> void:
	if remember.is_valid():
		remember.call(message)
