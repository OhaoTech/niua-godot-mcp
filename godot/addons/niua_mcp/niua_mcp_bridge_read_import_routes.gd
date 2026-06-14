@tool
extends RefCounted

const NiuaMcpImportOperations = preload("niua_mcp_import_operations.gd")

const HANDLERS := {
	"_list_imported_assets": true,
	"_get_import_metadata": true,
	"_get_import_diagnostics": true,
	"_import_events_response": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _list_imported_assets(query: Dictionary) -> Dictionary:
	return NiuaMcpImportOperations.list_imported_assets(query)


func _get_import_metadata(query: Dictionary) -> Dictionary:
	return NiuaMcpImportOperations.get_import_metadata(query)


func _get_import_diagnostics(query: Dictionary) -> Dictionary:
	return NiuaMcpImportOperations.get_import_diagnostics(query)


func _import_events_response(query: Dictionary) -> Dictionary:
	return _context.import_event_tracker.response(query)
