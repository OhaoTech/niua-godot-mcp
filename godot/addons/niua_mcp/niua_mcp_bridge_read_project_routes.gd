@tool
extends RefCounted

const NiuaMcpExportOperations = preload("niua_mcp_export_operations.gd")
const NiuaMcpNodeTypeOperations = preload("niua_mcp_node_type_operations.gd")
const NiuaMcpProjectSettingsOperations = preload("niua_mcp_project_settings_operations.gd")

const HANDLERS := {
	"_search_node_types": true,
	"_project_settings": true,
	"_input_map": true,
	"_export_presets": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _search_node_types(query: Dictionary) -> Dictionary:
	return NiuaMcpNodeTypeOperations.search_node_types(query)


func _project_settings(query: Dictionary) -> Dictionary:
	return NiuaMcpProjectSettingsOperations.project_settings(query)


func _input_map() -> Dictionary:
	return NiuaMcpProjectSettingsOperations.input_map()


func _export_presets() -> Dictionary:
	return NiuaMcpExportOperations.export_presets()
