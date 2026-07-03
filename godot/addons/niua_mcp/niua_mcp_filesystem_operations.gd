@tool
extends RefCounted

const NiuaMcpFilesystemBatchOperations = preload("niua_mcp_filesystem_batch_operations.gd")
const NiuaMcpFilesystemCopyOperations = preload("niua_mcp_filesystem_copy_operations.gd")
const NiuaMcpFilesystemMutationOperations = preload("niua_mcp_filesystem_mutation_operations.gd")
const NiuaMcpFilesystemReadOperations = preload("niua_mcp_filesystem_read_operations.gd")
const NiuaMcpFilesystemResult = preload("niua_mcp_filesystem_result.gd")
const NiuaMcpFilesystemSideEffects = preload("niua_mcp_filesystem_side_effects.gd")
const NiuaMcpFilesystemStateOperations = preload("niua_mcp_filesystem_state_operations.gd")


static func create_folder_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpFilesystemSideEffects.create_folder_with_side_effects(body, refresh_filesystem, remember)


static func write_text_file_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpFilesystemSideEffects.write_text_file_with_side_effects(body, refresh_filesystem, remember)


static func write_binary_file_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpFilesystemSideEffects.write_binary_file_with_side_effects(body, refresh_filesystem, remember)


static func move_entry_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpFilesystemSideEffects.move_entry_with_side_effects(body, refresh_filesystem, remember)


static func copy_entry_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpFilesystemSideEffects.copy_entry_with_side_effects(body, refresh_filesystem, remember)


static func batch_operations_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpFilesystemSideEffects.batch_operations_with_side_effects(body, refresh_filesystem, remember)


static func delete_entry_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpFilesystemSideEffects.delete_entry_with_side_effects(body, refresh_filesystem, remember)


static func filesystem_state(editor: EditorInterface) -> Dictionary:
	return NiuaMcpFilesystemStateOperations.filesystem_state(editor)


static func list_filesystem(query: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemReadOperations.list_filesystem(query)


static func create_folder(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemMutationOperations.create_folder(body)


static func read_text_file(query: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemReadOperations.read_text_file(query)


static func write_text_file(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemMutationOperations.write_text_file(body)


static func write_binary_file(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemMutationOperations.write_binary_file(body)


static func move_entry(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemMutationOperations.move_entry(body)


static func copy_entry(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemCopyOperations.copy_entry(body)


static func batch_operations(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemBatchOperations.batch_operations(
		body,
		func(operation: Dictionary) -> Dictionary: return copy_entry(operation),
		func(operation: Dictionary) -> Dictionary: return move_entry(operation),
		func(operation: Dictionary) -> Dictionary: return delete_entry(operation)
	)


static func batch_operation_message(operation: Dictionary) -> String:
	return NiuaMcpFilesystemBatchOperations.batch_operation_message(operation)


static func delete_entry(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemMutationOperations.delete_entry(body)


static func directory_entries(path: String, recursive: bool, exclude: PackedStringArray = PackedStringArray(), max_depth: int = 0, depth: int = 1) -> Array:
	return NiuaMcpFilesystemReadOperations.directory_entries(path, recursive, exclude, max_depth, depth)


static func error(message: String, code: String = "bad_request") -> Dictionary:
	return NiuaMcpFilesystemResult.error(message, code)
