@tool
extends RefCounted

const NiuaMcpJsonArgs = preload("niua_mcp_json_args.gd")
const NiuaMcpTileMapLayerContext = preload("niua_mcp_tile_map_layer_context.gd")


static func set_cells(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary) -> Dictionary:
	var layer_result := NiuaMcpTileMapLayerContext.resolve_layer(resolve_node, node_path_for_response, body)
	if not bool(layer_result.get("ok", false)):
		return layer_result

	var raw_cells = body.get("cells", [])
	if typeof(raw_cells) != TYPE_ARRAY:
		return NiuaMcpTileMapLayerContext.error("cells must be an array")
	var clear := bool(body.get("clear", false))
	if raw_cells.is_empty() and not clear:
		return NiuaMcpTileMapLayerContext.error("cells must be non-empty unless clear is true")

	var layer: TileMapLayer = layer_result.get("layer")
	var cleared_count := 0
	if clear:
		for used_cell in layer.get_used_cells():
			layer.erase_cell(used_cell)
			cleared_count += 1

	var set_count := 0
	var erased_count := 0
	var cell_summaries := []
	for cell_index in range(raw_cells.size()):
		var raw_cell = raw_cells[cell_index]
		if typeof(raw_cell) != TYPE_DICTIONARY:
			return NiuaMcpTileMapLayerContext.error("each cell operation must be an object")
		var cell: Dictionary = raw_cell
		if not cell.has("coords"):
			return NiuaMcpTileMapLayerContext.error("cells[%d].coords is required" % cell_index)

		var coords_result := NiuaMcpJsonArgs.vector2i_from_json(
			cell.get("coords"),
			"cells[%d].coords" % cell_index,
			Vector2i.ZERO,
			false
		)
		if not coords_result.get("ok", false):
			return coords_result
		var coords: Vector2i = coords_result.get("value")

		if bool(cell.get("erase", false)):
			layer.erase_cell(coords)
			erased_count += 1
			cell_summaries.append({
				"coords": NiuaMcpJsonArgs.vector2i_to_json(coords),
				"erased": true
			})
			continue

		var source_id_result := NiuaMcpJsonArgs.integer(cell.get("sourceId", 0), "cells[%d].sourceId" % cell_index)
		if not source_id_result.get("ok", false):
			return source_id_result
		var source_id := int(source_id_result.get("value"))
		if source_id < 0:
			return NiuaMcpTileMapLayerContext.error("cells[%d].sourceId must be a non-negative integer" % cell_index)

		var atlas_coords_result := NiuaMcpJsonArgs.vector2i_from_json(
			cell.get("atlasCoords", null),
			"cells[%d].atlasCoords" % cell_index,
			Vector2i.ZERO,
			false
		)
		if not atlas_coords_result.get("ok", false):
			return atlas_coords_result
		var atlas_coords: Vector2i = atlas_coords_result.get("value")

		var alternative_result := NiuaMcpJsonArgs.integer(cell.get("alternativeTile", 0), "cells[%d].alternativeTile" % cell_index)
		if not alternative_result.get("ok", false):
			return alternative_result
		var alternative_tile := int(alternative_result.get("value"))
		if alternative_tile < 0:
			return NiuaMcpTileMapLayerContext.error("cells[%d].alternativeTile must be a non-negative integer" % cell_index)

		layer.set_cell(coords, source_id, atlas_coords, alternative_tile)
		set_count += 1
		cell_summaries.append({
			"coords": NiuaMcpJsonArgs.vector2i_to_json(coords),
			"sourceId": source_id,
			"atlasCoords": NiuaMcpJsonArgs.vector2i_to_json(atlas_coords),
			"alternativeTile": alternative_tile,
			"erased": false
		})

	NiuaMcpTileMapLayerContext.notify_layer_update(layer)

	return {
		"ok": true,
		"data": {
			"nodePath": str(layer_result.get("nodePath", "")),
			"clearedCount": cleared_count,
			"setCount": set_count,
			"erasedCount": erased_count,
			"cells": cell_summaries
		}
	}
