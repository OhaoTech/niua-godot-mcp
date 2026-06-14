@tool
extends RefCounted

const NiuaMcpTileSetTerrainSetsBuilder = preload("niua_mcp_tile_set_terrain_sets_builder.gd")
const NiuaMcpTileSetTileTerrainBuilder = preload("niua_mcp_tile_set_tile_terrain_builder.gd")


static func apply_terrain_sets(tile_set: TileSet, raw_terrain_sets) -> Dictionary:
	return NiuaMcpTileSetTerrainSetsBuilder.apply_terrain_sets(tile_set, raw_terrain_sets)


static func apply_tile_terrain(
	tile_set: TileSet,
	atlas_source: TileSetAtlasSource,
	atlas_coords: Vector2i,
	tile: Dictionary,
	source_index: int,
	tile_index: int
) -> Dictionary:
	return NiuaMcpTileSetTileTerrainBuilder.apply_tile_terrain(
		tile_set,
		atlas_source,
		atlas_coords,
		tile,
		source_index,
		tile_index
	)
