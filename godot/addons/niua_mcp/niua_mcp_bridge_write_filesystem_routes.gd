@tool
extends RefCounted

const NiuaMcpFilesystemOperations = preload("niua_mcp_filesystem_operations.gd")

const HANDLERS := {
	"_create_folder": true,
	"_write_text_file": true,
	"_write_binary_file": true,
	"_move_filesystem_entry": true,
	"_copy_filesystem_entry": true,
	"_batch_filesystem_operations": true,
	"_delete_filesystem_entry": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _create_folder(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemOperations.create_folder_with_side_effects(body, Callable(_context, "refresh_filesystem"), Callable(_context, "remember"))


func _write_text_file(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemOperations.write_text_file_with_side_effects(body, Callable(_context, "refresh_filesystem"), Callable(_context, "remember"))


func _write_binary_file(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemOperations.write_binary_file_with_side_effects(body, Callable(_context, "refresh_filesystem"), Callable(_context, "remember"))


func _move_filesystem_entry(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemOperations.move_entry_with_side_effects(body, Callable(_context, "refresh_filesystem"), Callable(_context, "remember"))


func _copy_filesystem_entry(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemOperations.copy_entry_with_side_effects(body, Callable(_context, "refresh_filesystem"), Callable(_context, "remember"))


func _batch_filesystem_operations(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemOperations.batch_operations_with_side_effects(body, Callable(_context, "refresh_filesystem"), Callable(_context, "remember"))


func _delete_filesystem_entry(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemOperations.delete_entry_with_side_effects(body, Callable(_context, "refresh_filesystem"), Callable(_context, "remember"))
