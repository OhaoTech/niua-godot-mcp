@tool
extends RefCounted

const NiuaMcpTileSetCollisionPolygonBuilder = preload("niua_mcp_tile_set_collision_polygon_builder.gd")
const NiuaMcpTileSetPhysicsLayerBuilder = preload("niua_mcp_tile_set_physics_layer_builder.gd")
const NiuaMcpTileSetPhysicsUtils = preload("niua_mcp_tile_set_physics_utils.gd")


static func apply_physics_layers(tile_set: TileSet, raw_layers) -> Dictionary:
	return NiuaMcpTileSetPhysicsLayerBuilder.apply_physics_layers(tile_set, raw_layers)


static func apply_collision_polygons(
	tile_set: TileSet,
	atlas_source: TileSetAtlasSource,
	atlas_coords: Vector2i,
	tile: Dictionary,
	source_index: int,
	tile_index: int
) -> Dictionary:
	return NiuaMcpTileSetCollisionPolygonBuilder.apply_collision_polygons(
		tile_set,
		atlas_source,
		atlas_coords,
		tile,
		source_index,
		tile_index
	)
