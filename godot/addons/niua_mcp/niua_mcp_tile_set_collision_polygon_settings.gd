@tool
extends RefCounted

const NiuaMcpJsonArgs = preload("niua_mcp_json_args.gd")
const NiuaMcpTileSetPhysicsUtils = preload("niua_mcp_tile_set_physics_utils.gd")


static func parse_layer(tile_set: TileSet, polygon: Dictionary, source_index: int, tile_index: int, polygon_index: int) -> Dictionary:
	var layer_result := NiuaMcpJsonArgs.integer(
		polygon.get("layer", 0),
		"sources[%d].tiles[%d].collisionPolygons[%d].layer" % [
			source_index,
			tile_index,
			polygon_index
		]
	)
	if not layer_result.get("ok", false):
		return layer_result

	var layer_id := int(layer_result.get("value"))
	if layer_id < 0 or layer_id >= tile_set.get_physics_layers_count():
		return NiuaMcpTileSetPhysicsUtils.error(
			"sources[%d].tiles[%d].collisionPolygons[%d].layer must reference an existing physics layer" % [
				source_index,
				tile_index,
				polygon_index
			]
		)

	return {
		"ok": true,
		"layer": layer_id
	}


static func parse_one_way_margin(polygon: Dictionary, source_index: int, tile_index: int, polygon_index: int) -> Dictionary:
	var one_way_margin_result := NiuaMcpJsonArgs.non_negative_number(
		polygon.get("oneWayMargin", 1.0),
		"sources[%d].tiles[%d].collisionPolygons[%d].oneWayMargin" % [
			source_index,
			tile_index,
			polygon_index
		]
	)
	if not one_way_margin_result.get("ok", false):
		return one_way_margin_result

	return {
		"ok": true,
		"oneWayMargin": float(one_way_margin_result.get("value"))
	}
