@tool
extends RefCounted

const NiuaMcpTileMapLayerOperations = preload("niua_mcp_tile_map_layer_operations.gd")

const HANDLERS := {
	"_set_tile_map_layer_cells": true,
	"_paint_tile_map_layer_terrain": true
}

var _context


func configure(context, _document_routes = null) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _set_tile_map_layer_cells(body: Dictionary) -> Dictionary:
	return NiuaMcpTileMapLayerOperations.set_cells_with_side_effects(
		Callable(_context, "resolve_node"),
		Callable(_context, "node_path_for_response"),
		body,
		Callable(_context, "remember")
	)


func _paint_tile_map_layer_terrain(body: Dictionary) -> Dictionary:
	return NiuaMcpTileMapLayerOperations.paint_terrain_with_side_effects(
		Callable(_context, "resolve_node"),
		Callable(_context, "node_path_for_response"),
		body,
		Callable(_context, "remember")
	)
