@tool
extends RefCounted

const NiuaMcpBridgeWriteRouteContext = preload("niua_mcp_bridge_write_route_context.gd")
const NiuaMcpBridgeWriteFilesystemRoutes = preload("niua_mcp_bridge_write_filesystem_routes.gd")
const NiuaMcpBridgeWriteResourceRoutes = preload("niua_mcp_bridge_write_resource_routes.gd")
const NiuaMcpBridgeWriteProjectRoutes = preload("niua_mcp_bridge_write_project_routes.gd")
const NiuaMcpBridgeWriteScriptRoutes = preload("niua_mcp_bridge_write_script_routes.gd")
const NiuaMcpBridgeWriteImportRoutes = preload("niua_mcp_bridge_write_import_routes.gd")
const NiuaMcpBridgeWriteDebuggerRoutes = preload("niua_mcp_bridge_write_debugger_routes.gd")
const NiuaMcpBridgeWriteRunRoutes = preload("niua_mcp_bridge_write_run_routes.gd")
const NiuaMcpBridgeWriteEditorRoutes = preload("niua_mcp_bridge_write_editor_routes.gd")
const NiuaMcpBridgeWriteSceneRoutes = preload("niua_mcp_bridge_write_scene_routes.gd")
const NiuaMcpBridgeWriteAnimationRoutes = preload("niua_mcp_bridge_write_animation_routes.gd")
const NiuaMcpBridgeWriteUiRoutes = preload("niua_mcp_bridge_write_ui_routes.gd")
const NiuaMcpBridgeWriteParticlesRoutes = preload("niua_mcp_bridge_write_particles_routes.gd")
const NiuaMcpBridgeWriteNavigationRoutes = preload("niua_mcp_bridge_write_navigation_routes.gd")
const NiuaMcpBridgeWriteAudioRoutes = preload("niua_mcp_bridge_write_audio_routes.gd")
const NiuaMcpBridgeWriteLocalizationRoutes = preload("niua_mcp_bridge_write_localization_routes.gd")
const NiuaMcpBridgeWriteMultiplayerRoutes = preload("niua_mcp_bridge_write_multiplayer_routes.gd")

const HANDLERS := {
	"_create_folder": true,
	"_write_text_file": true,
	"_write_binary_file": true,
	"_move_filesystem_entry": true,
	"_copy_filesystem_entry": true,
	"_batch_filesystem_operations": true,
	"_delete_filesystem_entry": true,
	"_open_resource": true,
	"_create_resource": true,
	"_save_resource": true,
	"_create_shader_material_resource": true,
	"_create_sprite_frames_resource": true,
	"_create_tile_set_resource": true,
	"_set_selection": true,
	"_focus_node": true,
	"_focus_resource": true,
	"_set_project_setting": true,
	"_set_project_setting_metadata": true,
	"_set_input_action": true,
	"_write_script": true,
	"_edit_script": true,
	"_replace_in_scripts": true,
	"_create_script": true,
	"_attach_script": true,
	"_open_script": true,
	"_goto_script_line": true,
	"_set_import_options": true,
	"_reimport_assets": true,
	"_set_main_scene": true,
	"_set_debugger_breakpoint": true,
	"_toggle_debugger_profiler": true,
	"_send_debugger_message": true,
	"_set_runtime_node_property": true,
	"_call_runtime_node_method": true,
	"_send_runtime_input": true,
	"_capture_runtime_screenshot": true,
	"_install_runtime_probe": true,
	"_run_main_scene": true,
	"_run_current_scene": true,
	"_run_custom_scene": true,
	"_stop_running_scene": true,
	"_reload_running_scene": true,
	"_upsert_export_preset": true,
	"_set_editor_main_screen": true,
	"_invoke_editor_action": true,
	"_set_viewport_camera": true,
	"_send_viewport_input": true,
	"_open_scene": true,
	"_switch_scene_tab": true,
	"_close_scene_tab": true,
	"_mark_scene_unsaved": true,
	"_undo_editor_action": true,
	"_redo_editor_action": true,
	"_create_scene": true,
	"_create_node": true,
	"_set_tile_map_layer_cells": true,
	"_paint_tile_map_layer_terrain": true,
	"_create_node_with_script": true,
	"_rename_node": true,
	"_delete_node": true,
	"_duplicate_node": true,
	"_reparent_node": true,
	"_reorder_node": true,
	"_inspector_properties": true,
	"_set_node_property": true,
	"_assign_material": true,
	"_save_current_scene": true,
	"_save_scene_as": true,
	"_upsert_animation": true,
	"_play_animation": true,
	"_stop_animation": true,
	"_instance_animated_scene": true,
	"_create_animation_tree_state_machine": true,
	"_travel_animation_tree": true,
	"_create_ui_control": true,
	"_set_control_layout": true,
	"_create_ui_theme": true,
	"_apply_ui_theme_override": true,
	"_connect_ui_signal": true,
	"_create_gpu_particles_3d": true,
	"_create_gpu_particles_2d": true,
	"_configure_particle_process_material": true,
	"_set_particles_emitting": true,
	"_create_navigation_region_3d": true,
	"_bake_navigation_mesh_3d": true,
	"_create_navigation_agent_3d": true,
	"_create_navigation_target_follow_script": true,
	"_upsert_audio_bus": true,
	"_remove_audio_bus": true,
	"_upsert_audio_bus_effect": true,
	"_create_audio_stream_player": true,
	"_create_csv_translation": true,
	"_register_translation_file": true,
	"_set_locale": true,
	"_create_enet_multiplayer_script": true,
	"_create_multiplayer_spawner": true,
	"_create_multiplayer_synchronizer": true,
	"_create_multiplayer_state_script": true
}

var _context = NiuaMcpBridgeWriteRouteContext.new()
var _domains := [
	NiuaMcpBridgeWriteFilesystemRoutes.new(),
	NiuaMcpBridgeWriteResourceRoutes.new(),
	NiuaMcpBridgeWriteProjectRoutes.new(),
	NiuaMcpBridgeWriteScriptRoutes.new(),
	NiuaMcpBridgeWriteImportRoutes.new(),
	NiuaMcpBridgeWriteDebuggerRoutes.new(),
	NiuaMcpBridgeWriteRunRoutes.new(),
	NiuaMcpBridgeWriteEditorRoutes.new(),
	NiuaMcpBridgeWriteSceneRoutes.new(),
	NiuaMcpBridgeWriteAnimationRoutes.new(),
	NiuaMcpBridgeWriteUiRoutes.new(),
	NiuaMcpBridgeWriteParticlesRoutes.new(),
	NiuaMcpBridgeWriteNavigationRoutes.new(),
	NiuaMcpBridgeWriteAudioRoutes.new(),
	NiuaMcpBridgeWriteLocalizationRoutes.new(),
	NiuaMcpBridgeWriteMultiplayerRoutes.new()
]


func configure(editor: EditorInterface, debugger_probe_host, memory) -> void:
	_context.configure(editor, debugger_probe_host, memory)
	for domain in _domains:
		domain.configure(_context)


func handles(handler: String) -> bool:
	return HANDLERS.has(handler) and route_target_for(handler) != null


func route_target_for(handler: String) -> Object:
	for domain in _domains:
		if domain.handles(handler):
			if domain.has_method("route_target_for"):
				var nested_target = domain.route_target_for(handler)
				if nested_target != null:
					return nested_target
			return domain
	return null
