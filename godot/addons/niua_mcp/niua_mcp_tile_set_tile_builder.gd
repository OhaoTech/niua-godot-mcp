@tool
extends RefCounted

const NiuaMcpJsonArgs = preload("niua_mcp_json_args.gd")
const NiuaMcpTileSetPhysicsBuilder = preload("niua_mcp_tile_set_physics_builder.gd")
const NiuaMcpTileSetTerrainBuilder = preload("niua_mcp_tile_set_terrain_builder.gd")


static func build_tile(
	tile_set: TileSet,
	atlas_source: TileSetAtlasSource,
	tile: Dictionary,
	source_index: int,
	tile_index: int
) -> Dictionary:
	if not tile.has("atlasCoords"):
		return _error("sources[%d].tiles[%d].atlasCoords is required" % [source_index, tile_index])

	var atlas_coords_result := NiuaMcpJsonArgs.vector2i_from_json(
		tile.get("atlasCoords"),
		"sources[%d].tiles[%d].atlasCoords" % [source_index, tile_index],
		Vector2i.ZERO,
		false
	)
	if not atlas_coords_result.get("ok", false):
		return atlas_coords_result
	var atlas_coords: Vector2i = atlas_coords_result.get("value")

	var tile_size_in_atlas_result := NiuaMcpJsonArgs.vector2i_from_json(
		tile.get("size", null),
		"sources[%d].tiles[%d].size" % [source_index, tile_index],
		Vector2i(1, 1),
		true
	)
	if not tile_size_in_atlas_result.get("ok", false):
		return tile_size_in_atlas_result
	var tile_size_in_atlas: Vector2i = tile_size_in_atlas_result.get("value")

	atlas_source.create_tile(atlas_coords, tile_size_in_atlas)
	var tile_summary := {
		"atlasCoords": NiuaMcpJsonArgs.vector2i_to_json(atlas_coords),
		"size": NiuaMcpJsonArgs.vector2i_to_json(tile_size_in_atlas)
	}

	var collision_result := NiuaMcpTileSetPhysicsBuilder.apply_collision_polygons(
		tile_set,
		atlas_source,
		atlas_coords,
		tile,
		source_index,
		tile_index
	)
	if not collision_result.get("ok", false):
		return collision_result
	var collision_polygons: Array = collision_result.get("polygons", [])
	if not collision_polygons.is_empty():
		tile_summary["collisionPolygons"] = collision_polygons

	var terrain_result := NiuaMcpTileSetTerrainBuilder.apply_tile_terrain(
		tile_set,
		atlas_source,
		atlas_coords,
		tile,
		source_index,
		tile_index
	)
	if not terrain_result.get("ok", false):
		return terrain_result
	if bool(terrain_result.get("applied", false)):
		tile_summary["terrain"] = terrain_result.get("terrain", {})

	return {
		"ok": true,
		"summary": tile_summary
	}


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
