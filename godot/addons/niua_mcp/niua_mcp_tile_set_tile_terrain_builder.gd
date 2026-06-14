@tool
extends RefCounted

const NiuaMcpJsonArgs = preload("niua_mcp_json_args.gd")
const NiuaMcpTileSetTerrainPeeringBuilder = preload("niua_mcp_tile_set_terrain_peering_builder.gd")
const NiuaMcpTileSetTerrainUtils = preload("niua_mcp_tile_set_terrain_utils.gd")


static func apply_tile_terrain(
	tile_set: TileSet,
	atlas_source: TileSetAtlasSource,
	atlas_coords: Vector2i,
	tile: Dictionary,
	source_index: int,
	tile_index: int
) -> Dictionary:
	if not tile.has("terrain"):
		return {
			"ok": true,
			"applied": false
		}

	var raw_terrain = tile.get("terrain")
	if typeof(raw_terrain) != TYPE_DICTIONARY:
		return NiuaMcpTileSetTerrainUtils.error("sources[%d].tiles[%d].terrain must be an object" % [source_index, tile_index])
	var terrain: Dictionary = raw_terrain

	var terrain_set_result := NiuaMcpJsonArgs.integer(
		terrain.get("terrainSet", 0),
		"sources[%d].tiles[%d].terrain.terrainSet" % [source_index, tile_index]
	)
	if not terrain_set_result.get("ok", false):
		return terrain_set_result
	var terrain_set := int(terrain_set_result.get("value"))
	if terrain_set < 0 or terrain_set >= tile_set.get_terrain_sets_count():
		return NiuaMcpTileSetTerrainUtils.error(
			"sources[%d].tiles[%d].terrain.terrainSet must reference an existing terrain set" % [
				source_index,
				tile_index
			]
		)

	var terrain_result := NiuaMcpJsonArgs.integer(
		terrain.get("terrain", 0),
		"sources[%d].tiles[%d].terrain.terrain" % [source_index, tile_index]
	)
	if not terrain_result.get("ok", false):
		return terrain_result
	var terrain_id := int(terrain_result.get("value"))
	if terrain_id < 0 or terrain_id >= tile_set.get_terrains_count(terrain_set):
		return NiuaMcpTileSetTerrainUtils.error(
			"sources[%d].tiles[%d].terrain.terrain must reference an existing terrain" % [
				source_index,
				tile_index
			]
		)

	var tile_data := atlas_source.get_tile_data(atlas_coords, 0)
	if tile_data == null:
		return NiuaMcpTileSetTerrainUtils.error(
			"failed to read TileData for terrain at sources[%d].tiles[%d]" % [
				source_index,
				tile_index
			]
		)

	tile_data.set_terrain_set(terrain_set)
	tile_data.set_terrain(terrain_id)

	var peering_result := NiuaMcpTileSetTerrainPeeringBuilder.apply_peering_bits(
		tile_set,
		tile_data,
		terrain_set,
		terrain.get("peeringBits", []),
		source_index,
		tile_index
	)
	if not peering_result.get("ok", false):
		return peering_result

	return {
		"ok": true,
		"applied": true,
		"terrain": {
			"terrainSet": terrain_set,
			"terrain": terrain_id,
			"peeringBits": peering_result.get("peeringBits", [])
		}
	}
