@tool
extends RefCounted

const NiuaMcpBridgeReadRouteContext = preload("niua_mcp_bridge_read_route_context.gd")
const NiuaMcpBridgeReadEditorRoutes = preload("niua_mcp_bridge_read_editor_routes.gd")
const NiuaMcpBridgeReadSceneRoutes = preload("niua_mcp_bridge_read_scene_routes.gd")
const NiuaMcpBridgeReadFilesystemRoutes = preload("niua_mcp_bridge_read_filesystem_routes.gd")
const NiuaMcpBridgeReadProjectRoutes = preload("niua_mcp_bridge_read_project_routes.gd")
const NiuaMcpBridgeReadScriptRoutes = preload("niua_mcp_bridge_read_script_routes.gd")
const NiuaMcpBridgeReadImportRoutes = preload("niua_mcp_bridge_read_import_routes.gd")
const NiuaMcpBridgeReadRunRoutes = preload("niua_mcp_bridge_read_run_routes.gd")
const NiuaMcpBridgeReadDebuggerRoutes = preload("niua_mcp_bridge_read_debugger_routes.gd")
const NiuaMcpBridgeReadViewportRoutes = preload("niua_mcp_bridge_read_viewport_routes.gd")
const NiuaMcpBridgeReadAnimationRoutes = preload("niua_mcp_bridge_read_animation_routes.gd")
const NiuaMcpBridgeReadAudioRoutes = preload("niua_mcp_bridge_read_audio_routes.gd")
const NiuaMcpBridgeReadLocalizationRoutes = preload("niua_mcp_bridge_read_localization_routes.gd")

const HANDLERS := {
	"_health": true,
	"_project_info": true,
	"_editor_state": true,
	"_scene_tree": true,
	"_find_nodes": true,
	"_open_scene_tabs": true,
	"_selection": true,
	"_logs_response": true,
	"_capture_editor_screenshot": true,
	"_search_node_types": true,
	"_filesystem_state": true,
	"_list_filesystem": true,
	"_read_text_file": true,
	"_project_settings": true,
	"_input_map": true,
	"_read_script": true,
	"_search_in_scripts": true,
	"_validate_script": true,
	"_script_symbols": true,
	"_script_editor_state": true,
	"_script_cursor_state": true,
	"_list_imported_assets": true,
	"_get_import_metadata": true,
	"_get_import_diagnostics": true,
	"_import_events_response": true,
	"_run_settings": true,
	"_run_status": true,
	"_export_presets": true,
	"_debugger_state": true,
	"_runtime_state": true,
	"_runtime_state_result": true,
	"_runtime_events": true,
	"_runtime_node_properties": true,
	"_runtime_node_property_set_result": true,
	"_runtime_node_method_call_result": true,
	"_runtime_input_send_result": true,
	"_runtime_screenshot_result": true,
	"_capture_viewport_screenshot": true,
	"_viewport_state": true,
	"_list_animations": true,
	"_get_animation_state": true,
	"_list_audio_buses": true,
	"_get_localization_state": true
}

var _context = NiuaMcpBridgeReadRouteContext.new()
var _domains := [
	NiuaMcpBridgeReadEditorRoutes.new(),
	NiuaMcpBridgeReadSceneRoutes.new(),
	NiuaMcpBridgeReadFilesystemRoutes.new(),
	NiuaMcpBridgeReadProjectRoutes.new(),
	NiuaMcpBridgeReadScriptRoutes.new(),
	NiuaMcpBridgeReadImportRoutes.new(),
	NiuaMcpBridgeReadRunRoutes.new(),
	NiuaMcpBridgeReadDebuggerRoutes.new(),
	NiuaMcpBridgeReadViewportRoutes.new(),
	NiuaMcpBridgeReadAnimationRoutes.new(),
	NiuaMcpBridgeReadAudioRoutes.new(),
	NiuaMcpBridgeReadLocalizationRoutes.new()
]


func configure(editor: EditorInterface, server, memory, debugger_probe_host, import_event_tracker, host: String, port: int, read_endpoints: Array, write_endpoints: Array) -> void:
	_context.configure(editor, server, memory, debugger_probe_host, import_event_tracker, host, port, read_endpoints, write_endpoints)
	for domain in _domains:
		domain.configure(_context)


func handles(handler: String) -> bool:
	return HANDLERS.has(handler) and route_target_for(handler) != null


func route_target_for(handler: String) -> Object:
	for domain in _domains:
		if domain.handles(handler):
			return domain
	return null
