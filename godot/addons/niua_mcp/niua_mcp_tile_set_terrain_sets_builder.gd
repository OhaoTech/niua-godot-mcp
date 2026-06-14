@tool
extends RefCounted

const NiuaMcpJsonArgs = preload("niua_mcp_json_args.gd")
const NiuaMcpTileSetTerrainUtils = preload("niua_mcp_tile_set_terrain_utils.gd")
const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")


static func apply_terrain_sets(tile_set: TileSet, raw_terrain_sets) -> Dictionary:
	if typeof(raw_terrain_sets) != TYPE_ARRAY:
		return NiuaMcpTileSetTerrainUtils.error("terrainSets must be an array")

	var summaries := []
	for terrain_set_index in range(raw_terrain_sets.size()):
		var raw_terrain_set = raw_terrain_sets[terrain_set_index]
		if typeof(raw_terrain_set) != TYPE_DICTIONARY:
			return NiuaMcpTileSetTerrainUtils.error("each TileSet terrain set must be an object")
		var terrain_set: Dictionary = raw_terrain_set

		var mode_result := NiuaMcpJsonArgs.integer(
			terrain_set.get("mode", 0),
			"terrainSets[%d].mode" % terrain_set_index
		)
		if not mode_result.get("ok", false):
			return mode_result
		var mode := int(mode_result.get("value"))
		if mode < 0 or mode > 2:
			return NiuaMcpTileSetTerrainUtils.error("terrainSets[%d].mode must be 0, 1, or 2" % terrain_set_index)

		var raw_terrains = terrain_set.get("terrains", [])
		if typeof(raw_terrains) != TYPE_ARRAY or raw_terrains.is_empty():
			return NiuaMcpTileSetTerrainUtils.error("terrainSets[%d].terrains must be a non-empty array" % terrain_set_index)

		tile_set.add_terrain_set()
		var actual_terrain_set_index := tile_set.get_terrain_sets_count() - 1
		tile_set.set_terrain_set_mode(actual_terrain_set_index, mode)

		var terrain_summaries := []
		for terrain_index in range(raw_terrains.size()):
			var raw_terrain = raw_terrains[terrain_index]
			if typeof(raw_terrain) != TYPE_DICTIONARY:
				return NiuaMcpTileSetTerrainUtils.error("each TileSet terrain must be an object")
			var terrain: Dictionary = raw_terrain
			var terrain_name := str(terrain.get("name", "")).strip_edges()
			if terrain_name.is_empty():
				return NiuaMcpTileSetTerrainUtils.error(
					"terrainSets[%d].terrains[%d].name must not be empty" % [
						terrain_set_index,
						terrain_index
					]
				)

			tile_set.add_terrain(actual_terrain_set_index)
			var actual_terrain_index := tile_set.get_terrains_count(actual_terrain_set_index) - 1
			tile_set.set_terrain_name(
				actual_terrain_set_index,
				actual_terrain_index,
				terrain_name
			)

			var color_summary = null
			if terrain.has("color"):
				var color_result := NiuaMcpJsonArgs.typed_color(
					terrain.get("color"),
					"terrainSets[%d].terrains[%d].color" % [
						terrain_set_index,
						terrain_index
					]
				)
				if not color_result.get("ok", false):
					return color_result
				var color: Color = color_result.get("value")
				tile_set.set_terrain_color(actual_terrain_set_index, actual_terrain_index, color)
				color_summary = NiuaMcpVariantCodec.variant_to_json(color)

			terrain_summaries.append({
				"index": actual_terrain_index,
				"name": terrain_name,
				"color": color_summary
			})

		summaries.append({
			"index": actual_terrain_set_index,
			"mode": mode,
			"terrains": terrain_summaries
		})

	return {
		"ok": true,
		"terrainSets": summaries
	}
