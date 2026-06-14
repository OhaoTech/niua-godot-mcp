@tool
extends RefCounted

const NiuaMcpJsonArgs = preload("niua_mcp_json_args.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpTileSetTileBuilder = preload("niua_mcp_tile_set_tile_builder.gd")


static func build_source(tile_set: TileSet, source: Dictionary, source_index: int, tile_size: Vector2i) -> Dictionary:
	var texture_validation := NiuaMcpPathUtils.validate_res_path(str(source.get("texturePath", "")))
	if not texture_validation.get("ok", false):
		return texture_validation
	var texture_path := str(texture_validation.get("path"))
	var texture_resource := ResourceLoader.load(texture_path)
	if texture_resource == null:
		return _error("TileSet source texture not found or not loadable: %s" % texture_path, "not_found")
	if not (texture_resource is Texture2D):
		return _error("TileSet source texture is not a Texture2D: %s" % texture_path, "invalid_resource")

	var region_size_result := NiuaMcpJsonArgs.vector2i_from_json(
		source.get("textureRegionSize", null),
		"sources[%d].textureRegionSize" % source_index,
		tile_size,
		true
	)
	if not region_size_result.get("ok", false):
		return region_size_result
	var region_size: Vector2i = region_size_result.get("value")

	var raw_tiles = source.get("tiles", [])
	if typeof(raw_tiles) != TYPE_ARRAY or raw_tiles.is_empty():
		return _error("sources[%d].tiles must be a non-empty array" % source_index)

	var atlas_source := TileSetAtlasSource.new()
	atlas_source.set_texture(texture_resource as Texture2D)
	atlas_source.set_texture_region_size(region_size)
	if source.has("useTexturePadding"):
		atlas_source.set_use_texture_padding(bool(source.get("useTexturePadding", true)))

	var tile_summaries := []
	for tile_index in range(raw_tiles.size()):
		var raw_tile = raw_tiles[tile_index]
		if typeof(raw_tile) != TYPE_DICTIONARY:
			return _error("each TileSet tile must be an object")
		var tile: Dictionary = raw_tile

		var tile_result := NiuaMcpTileSetTileBuilder.build_tile(
			tile_set,
			atlas_source,
			tile,
			source_index,
			tile_index
		)
		if not tile_result.get("ok", false):
			return tile_result
		tile_summaries.append(tile_result.get("summary", {}))

	var source_id := -1
	if source.has("sourceId"):
		source_id = int(source.get("sourceId", -1))
		if source_id < 0:
			return _error("sources[%d].sourceId must be a non-negative integer" % source_index)
	var actual_source_id := tile_set.add_source(atlas_source, source_id)
	if actual_source_id < 0:
		return _error("failed to add TileSet source %d" % source_index)

	return {
		"ok": true,
		"summary": {
			"sourceId": actual_source_id,
			"texturePath": texture_path,
			"textureRegionSize": NiuaMcpJsonArgs.vector2i_to_json(region_size),
			"tileCount": tile_summaries.size(),
			"tiles": tile_summaries
		}
	}


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
