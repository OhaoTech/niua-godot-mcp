@tool
extends RefCounted

const NiuaMcpBridgeWriteSceneDocumentRoutes = preload("niua_mcp_bridge_write_scene_document_routes.gd")
const NiuaMcpBridgeWriteSceneNodeRoutes = preload("niua_mcp_bridge_write_scene_node_routes.gd")
const NiuaMcpBridgeWriteSceneScriptRoutes = preload("niua_mcp_bridge_write_scene_script_routes.gd")
const NiuaMcpBridgeWriteSceneTabRoutes = preload("niua_mcp_bridge_write_scene_tab_routes.gd")
const NiuaMcpBridgeWriteSceneTileMapRoutes = preload("niua_mcp_bridge_write_scene_tile_map_routes.gd")

const HANDLERS := {
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
	"_save_scene_as": true
}

var _document_routes = NiuaMcpBridgeWriteSceneDocumentRoutes.new()
var _domains := [
	NiuaMcpBridgeWriteSceneTabRoutes.new(),
	_document_routes,
	NiuaMcpBridgeWriteSceneTileMapRoutes.new(),
	NiuaMcpBridgeWriteSceneNodeRoutes.new(),
	NiuaMcpBridgeWriteSceneScriptRoutes.new()
]


func configure(context) -> void:
	for domain in _domains:
		domain.configure(context, _document_routes)


func handles(handler: String) -> bool:
	return HANDLERS.has(handler) and route_target_for(handler) != null


func route_target_for(handler: String) -> Object:
	for domain in _domains:
		if domain.handles(handler):
			return domain
	return null
