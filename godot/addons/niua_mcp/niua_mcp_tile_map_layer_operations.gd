@tool
extends RefCounted

const NiuaMcpTileMapLayerCellOperations = preload("niua_mcp_tile_map_layer_cell_operations.gd")
const NiuaMcpTileMapLayerContext = preload("niua_mcp_tile_map_layer_context.gd")
const NiuaMcpTileMapLayerTerrainOperations = preload("niua_mcp_tile_map_layer_terrain_operations.gd")


static func set_cells_with_side_effects(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary, remember: Callable) -> Dictionary:
	var response := set_cells(resolve_node, node_path_for_response, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpTileMapLayerContext.remember(remember, "Updated TileMapLayer cells at %s" % str(data.get("nodePath", "")))
	return response


static func paint_terrain_with_side_effects(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary, remember: Callable) -> Dictionary:
	var response := paint_terrain(resolve_node, node_path_for_response, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpTileMapLayerContext.remember(remember, "Painted TileMapLayer terrain at %s" % str(data.get("nodePath", "")))
	return response


static func set_cells(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary) -> Dictionary:
	return NiuaMcpTileMapLayerCellOperations.set_cells(resolve_node, node_path_for_response, body)


static func paint_terrain(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary) -> Dictionary:
	return NiuaMcpTileMapLayerTerrainOperations.paint_terrain(resolve_node, node_path_for_response, body)
