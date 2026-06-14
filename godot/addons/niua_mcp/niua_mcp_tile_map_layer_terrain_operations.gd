@tool
extends RefCounted

const NiuaMcpJsonArgs = preload("niua_mcp_json_args.gd")
const NiuaMcpTileMapLayerContext = preload("niua_mcp_tile_map_layer_context.gd")


static func paint_terrain(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary) -> Dictionary:
	var layer_result := NiuaMcpTileMapLayerContext.resolve_layer(resolve_node, node_path_for_response, body)
	if not bool(layer_result.get("ok", false)):
		return layer_result

	var raw_coords = body.get("coords", [])
	if typeof(raw_coords) != TYPE_ARRAY:
		return NiuaMcpTileMapLayerContext.error("coords must be an array")
	if raw_coords.is_empty():
		return NiuaMcpTileMapLayerContext.error("coords must be non-empty")

	var coords: Array[Vector2i] = []
	var coord_summaries := []
	for coord_index in range(raw_coords.size()):
		var coords_result := NiuaMcpJsonArgs.vector2i_from_json(
			raw_coords[coord_index],
			"coords[%d]" % coord_index,
			Vector2i.ZERO,
			false
		)
		if not coords_result.get("ok", false):
			return coords_result
		var coord: Vector2i = coords_result.get("value")
		coords.append(coord)
		coord_summaries.append(NiuaMcpJsonArgs.vector2i_to_json(coord))

	var terrain_set_result := NiuaMcpJsonArgs.integer(body.get("terrainSet", 0), "terrainSet")
	if not terrain_set_result.get("ok", false):
		return terrain_set_result
	var terrain_set := int(terrain_set_result.get("value"))
	if terrain_set < 0:
		return NiuaMcpTileMapLayerContext.error("terrainSet must be a non-negative integer")

	var terrain_result := NiuaMcpJsonArgs.integer(body.get("terrain", 0), "terrain")
	if not terrain_result.get("ok", false):
		return terrain_result
	var terrain := int(terrain_result.get("value"))
	if terrain < 0:
		return NiuaMcpTileMapLayerContext.error("terrain must be a non-negative integer")

	var mode := str(body.get("mode", "connect")).to_lower()
	var ignore_empty := bool(body.get("ignoreEmptyTerrains", true))
	var layer: TileMapLayer = layer_result.get("layer")
	match mode:
		"connect":
			layer.set_cells_terrain_connect(coords, terrain_set, terrain, ignore_empty)
		"path":
			layer.set_cells_terrain_path(coords, terrain_set, terrain, ignore_empty)
		_:
			return NiuaMcpTileMapLayerContext.error("mode must be connect or path")

	NiuaMcpTileMapLayerContext.notify_layer_update(layer)

	return {
		"ok": true,
		"data": {
			"nodePath": str(layer_result.get("nodePath", "")),
			"mode": mode,
			"terrainSet": terrain_set,
			"terrain": terrain,
			"ignoreEmptyTerrains": ignore_empty,
			"paintedCount": coords.size(),
			"coords": coord_summaries
		}
	}
