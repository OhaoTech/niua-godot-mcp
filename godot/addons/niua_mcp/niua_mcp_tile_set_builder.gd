@tool
extends RefCounted

const NiuaMcpJsonArgs = preload("niua_mcp_json_args.gd")
const NiuaMcpTileSetPhysicsBuilder = preload("niua_mcp_tile_set_physics_builder.gd")
const NiuaMcpTileSetSourceBuilder = preload("niua_mcp_tile_set_source_builder.gd")
const NiuaMcpTileSetTerrainBuilder = preload("niua_mcp_tile_set_terrain_builder.gd")


static func build(body: Dictionary) -> Dictionary:
	var raw_sources = body.get("sources", [])
	if typeof(raw_sources) != TYPE_ARRAY or raw_sources.is_empty():
		return _error("sources must be a non-empty array")

	var tile_size_result := NiuaMcpJsonArgs.vector2i_from_json(body.get("tileSize", null), "tileSize", Vector2i(16, 16), true)
	if not tile_size_result.get("ok", false):
		return tile_size_result
	var tile_size: Vector2i = tile_size_result.get("value")

	var tile_set := TileSet.new()
	tile_set.set_tile_size(tile_size)

	var physics_layers_result := NiuaMcpTileSetPhysicsBuilder.apply_physics_layers(
		tile_set,
		body.get("physicsLayers", [])
	)
	if not physics_layers_result.get("ok", false):
		return physics_layers_result

	var terrain_sets_result := NiuaMcpTileSetTerrainBuilder.apply_terrain_sets(
		tile_set,
		body.get("terrainSets", [])
	)
	if not terrain_sets_result.get("ok", false):
		return terrain_sets_result

	var source_summaries := []
	for source_index in range(raw_sources.size()):
		var raw_source = raw_sources[source_index]
		if typeof(raw_source) != TYPE_DICTIONARY:
			return _error("each TileSet source must be an object")
		var source: Dictionary = raw_source

		var source_result := NiuaMcpTileSetSourceBuilder.build_source(
			tile_set,
			source,
			source_index,
			tile_size
		)
		if not source_result.get("ok", false):
			return source_result
		source_summaries.append(source_result.get("summary", {}))

	var resource_name := str(body.get("resourceName", "")).strip_edges()
	if not resource_name.is_empty():
		tile_set.resource_name = resource_name

	return {
		"ok": true,
		"resource": tile_set,
		"resourceName": resource_name,
		"tileSize": NiuaMcpJsonArgs.vector2i_to_json(tile_size),
		"physicsLayers": physics_layers_result.get("layers", []),
		"terrainSets": terrain_sets_result.get("terrainSets", []),
		"sourceCount": source_summaries.size(),
		"sources": source_summaries
	}


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
