@tool
extends RefCounted

const NiuaMcpTileSetCollisionPolygonSettings = preload("niua_mcp_tile_set_collision_polygon_settings.gd")
const NiuaMcpTileSetCollisionPolygonPoints = preload("niua_mcp_tile_set_collision_polygon_points.gd")
const NiuaMcpTileSetPhysicsUtils = preload("niua_mcp_tile_set_physics_utils.gd")


static func apply_collision_polygons(
	tile_set: TileSet,
	atlas_source: TileSetAtlasSource,
	atlas_coords: Vector2i,
	tile: Dictionary,
	source_index: int,
	tile_index: int
) -> Dictionary:
	var raw_polygons = tile.get("collisionPolygons", [])
	if typeof(raw_polygons) != TYPE_ARRAY:
		return NiuaMcpTileSetPhysicsUtils.error(
			"sources[%d].tiles[%d].collisionPolygons must be an array" % [source_index, tile_index]
		)
	if raw_polygons.is_empty():
		return {
			"ok": true,
			"polygons": []
		}
	if tile_set.get_physics_layers_count() <= 0:
		return NiuaMcpTileSetPhysicsUtils.error(
			"sources[%d].tiles[%d].collisionPolygons require at least one physics layer" % [
				source_index,
				tile_index
			]
		)

	var tile_data := atlas_source.get_tile_data(atlas_coords, 0)
	if tile_data == null:
		return NiuaMcpTileSetPhysicsUtils.error(
			"failed to read TileData for sources[%d].tiles[%d]" % [source_index, tile_index]
		)

	var summaries := []
	for polygon_index in range(raw_polygons.size()):
		var raw_polygon = raw_polygons[polygon_index]
		if typeof(raw_polygon) != TYPE_DICTIONARY:
			return NiuaMcpTileSetPhysicsUtils.error("each TileSet collision polygon must be an object")
		var polygon: Dictionary = raw_polygon

		var layer_result := NiuaMcpTileSetCollisionPolygonSettings.parse_layer(
			tile_set,
			polygon,
			source_index,
			tile_index,
			polygon_index
		)
		if not layer_result.get("ok", false):
			return layer_result
		var layer_id := int(layer_result.get("layer"))

		var points_result := NiuaMcpTileSetCollisionPolygonPoints.parse_points(
			polygon.get("points", []),
			source_index,
			tile_index,
			polygon_index
		)
		if not points_result.get("ok", false):
			return points_result
		var points: PackedVector2Array = points_result.get("points")
		var point_summaries: Array = points_result.get("pointSummaries", [])

		var one_way := bool(polygon.get("oneWay", false))
		var one_way_margin_result := NiuaMcpTileSetCollisionPolygonSettings.parse_one_way_margin(
			polygon,
			source_index,
			tile_index,
			polygon_index
		)
		if not one_way_margin_result.get("ok", false):
			return one_way_margin_result
		var one_way_margin := float(one_way_margin_result.get("oneWayMargin"))

		tile_data.add_collision_polygon(layer_id)
		var collision_index := tile_data.get_collision_polygons_count(layer_id) - 1
		tile_data.set_collision_polygon_points(layer_id, collision_index, points)
		tile_data.set_collision_polygon_one_way(layer_id, collision_index, one_way)
		tile_data.set_collision_polygon_one_way_margin(layer_id, collision_index, one_way_margin)

		summaries.append({
			"layer": layer_id,
			"polygonIndex": collision_index,
			"points": point_summaries,
			"pointCount": points.size(),
			"oneWay": one_way,
			"oneWayMargin": one_way_margin
		})

	return {
		"ok": true,
		"polygons": summaries
	}
