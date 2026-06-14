@tool
extends RefCounted

const NiuaMcpFilesystemOperations = preload("niua_mcp_filesystem_operations.gd")

const HANDLERS := {
	"_filesystem_state": true,
	"_list_filesystem": true,
	"_read_text_file": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _filesystem_state() -> Dictionary:
	return NiuaMcpFilesystemOperations.filesystem_state(_context.editor)


func _list_filesystem(query: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemOperations.list_filesystem(query)


func _read_text_file(query: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemOperations.read_text_file(query)
