@tool
extends RefCounted

const NiuaMcpJsonArgs = preload("niua_mcp_json_args.gd")
const NiuaMcpTileSetTerrainUtils = preload("niua_mcp_tile_set_terrain_utils.gd")


static func apply_peering_bits(
	tile_set: TileSet,
	tile_data: TileData,
	terrain_set: int,
	raw_peering_bits,
	source_index: int,
	tile_index: int
) -> Dictionary:
	if typeof(raw_peering_bits) != TYPE_ARRAY:
		return NiuaMcpTileSetTerrainUtils.error(
			"sources[%d].tiles[%d].terrain.peeringBits must be an array" % [
				source_index,
				tile_index
			]
		)

	var peering_summaries := []
	for bit_index in range(raw_peering_bits.size()):
		var raw_bit = raw_peering_bits[bit_index]
		if typeof(raw_bit) != TYPE_DICTIONARY:
			return NiuaMcpTileSetTerrainUtils.error("each terrain peering bit must be an object")
		var bit: Dictionary = raw_bit

		var neighbor_result := NiuaMcpJsonArgs.integer(
			bit.get("neighbor", -1),
			"sources[%d].tiles[%d].terrain.peeringBits[%d].neighbor" % [
				source_index,
				tile_index,
				bit_index
			]
		)
		if not neighbor_result.get("ok", false):
			return neighbor_result
		var neighbor := int(neighbor_result.get("value"))
		if neighbor < 0 or neighbor > 15:
			return NiuaMcpTileSetTerrainUtils.error(
				"sources[%d].tiles[%d].terrain.peeringBits[%d].neighbor must be between 0 and 15" % [
					source_index,
					tile_index,
					bit_index
				]
			)

		var peering_terrain_result := NiuaMcpJsonArgs.integer(
			bit.get("terrain", -1),
			"sources[%d].tiles[%d].terrain.peeringBits[%d].terrain" % [
				source_index,
				tile_index,
				bit_index
			]
		)
		if not peering_terrain_result.get("ok", false):
			return peering_terrain_result
		var peering_terrain := int(peering_terrain_result.get("value"))
		if peering_terrain < -1 or peering_terrain >= tile_set.get_terrains_count(terrain_set):
			return NiuaMcpTileSetTerrainUtils.error(
				"sources[%d].tiles[%d].terrain.peeringBits[%d].terrain must be -1 or an existing terrain" % [
					source_index,
					tile_index,
					bit_index
				]
			)

		if not tile_data.is_valid_terrain_peering_bit(neighbor):
			return NiuaMcpTileSetTerrainUtils.error(
				"sources[%d].tiles[%d].terrain.peeringBits[%d].neighbor is invalid for this tile" % [
					source_index,
					tile_index,
					bit_index
				]
			)

		tile_data.set_terrain_peering_bit(neighbor, peering_terrain)
		peering_summaries.append({
			"neighbor": neighbor,
			"terrain": peering_terrain
		})

	return {
		"ok": true,
		"peeringBits": peering_summaries
	}
