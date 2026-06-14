@tool
extends RefCounted

const NiuaMcpImportEventOperations = preload("niua_mcp_import_event_operations.gd")
const NiuaMcpImportOptionOperations = preload("niua_mcp_import_option_operations.gd")
const NiuaMcpImportQueryOperations = preload("niua_mcp_import_query_operations.gd")
const NiuaMcpImportReimportOperations = preload("niua_mcp_import_reimport_operations.gd")
const NiuaMcpImportSideEffects = preload("niua_mcp_import_side_effects.gd")
const NiuaMcpImportUtils = preload("niua_mcp_import_utils.gd")


static func set_import_options_with_side_effects(body: Dictionary, path_validator: Callable, reimport_assets: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpImportSideEffects.set_import_options_with_side_effects(body, path_validator, reimport_assets, remember)


static func reimport_assets_with_side_effects(body: Dictionary, resource_filesystem, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpImportSideEffects.reimport_assets_with_side_effects(body, resource_filesystem, refresh_filesystem, remember)


static func list_imported_assets(query: Dictionary) -> Dictionary:
	return NiuaMcpImportQueryOperations.list_imported_assets(query)


static func get_import_metadata(query: Dictionary) -> Dictionary:
	return NiuaMcpImportQueryOperations.get_import_metadata(query)


static func get_import_diagnostics(query: Dictionary) -> Dictionary:
	return NiuaMcpImportQueryOperations.get_import_diagnostics(query)


static func import_events_response(query: Dictionary, import_events: Array, events_available: bool, max_events: int) -> Dictionary:
	return NiuaMcpImportEventOperations.import_events_response(query, import_events, events_available, max_events)


static func set_import_options(body: Dictionary, path_validator: Callable, reimport_assets: Callable) -> Dictionary:
	return NiuaMcpImportOptionOperations.set_import_options(body, path_validator, reimport_assets)


static func reimport_assets(body: Dictionary, resource_filesystem, refresh_filesystem: Callable) -> Dictionary:
	return NiuaMcpImportReimportOperations.reimport_assets(body, resource_filesystem, refresh_filesystem)


static func record_event(import_events: Array, max_events: int, kind: String, raw_paths = [], extra: Dictionary = {}, resource_filesystem = null) -> void:
	NiuaMcpImportEventOperations.record_event(import_events, max_events, kind, raw_paths, extra, resource_filesystem)
