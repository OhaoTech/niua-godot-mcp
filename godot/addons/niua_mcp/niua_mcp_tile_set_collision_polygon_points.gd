@tool
extends RefCounted

const NiuaMcpJsonArgs = preload("niua_mcp_json_args.gd")
const NiuaMcpTileSetPhysicsUtils = preload("niua_mcp_tile_set_physics_utils.gd")
const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")


static func parse_points(raw_points, source_index: int, tile_index: int, polygon_index: int) -> Dictionary:
	if typeof(raw_points) != TYPE_ARRAY or raw_points.size() < 3:
		return NiuaMcpTileSetPhysicsUtils.error(
			"sources[%d].tiles[%d].collisionPolygons[%d].points must contain at least 3 points" % [
				source_index,
				tile_index,
				polygon_index
			]
		)

	var points := PackedVector2Array()
	var point_summaries := []
	for point_index in range(raw_points.size()):
		var point_result := NiuaMcpJsonArgs.typed_vector2(
			raw_points[point_index],
			"sources[%d].tiles[%d].collisionPolygons[%d].points[%d]" % [
				source_index,
				tile_index,
				polygon_index,
				point_index
			]
		)
		if not point_result.get("ok", false):
			return point_result
		var point: Vector2 = point_result.get("value")
		points.append(point)
		point_summaries.append(NiuaMcpVariantCodec.variant_to_json(point))

	return {
		"ok": true,
		"points": points,
		"pointSummaries": point_summaries
	}
