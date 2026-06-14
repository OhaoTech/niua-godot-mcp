@tool
extends RefCounted

const NiuaMcpSpriteFramesSheetGrid = preload("niua_mcp_sprite_frames_sheet_grid.gd")
const NiuaMcpSpriteFramesUtils = preload("niua_mcp_sprite_frames_utils.gd")
const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")


static func expand_sprite_sheet_frames(raw_sheet, animation_name: String) -> Dictionary:
	if typeof(raw_sheet) != TYPE_DICTIONARY:
		return NiuaMcpSpriteFramesUtils.error("sheet must be an object for animation: %s" % animation_name)
	var sheet: Dictionary = raw_sheet

	var texture_result := NiuaMcpSpriteFramesUtils.load_texture2d(sheet.get("texturePath", ""), "sheet")
	if not texture_result.get("ok", false):
		return texture_result
	var texture_path := str(texture_result.get("path"))
	var texture: Texture2D = texture_result.get("texture")

	var grid_result := NiuaMcpSpriteFramesSheetGrid.infer_sprite_sheet_grid(sheet, texture, animation_name)
	if not grid_result.get("ok", false):
		return grid_result

	var duration := float(sheet.get("duration", 1.0))
	if duration <= 0.0:
		return NiuaMcpSpriteFramesUtils.error("sheet duration must be positive for animation: %s" % animation_name)

	var columns := int(grid_result.get("columns"))
	var frame_count := int(grid_result.get("frameCount"))
	var frame_size: Vector2 = grid_result.get("frameSize")
	var origin: Vector2 = grid_result.get("origin")
	var separation: Vector2 = grid_result.get("separation")

	var frames := []
	for frame_index in range(frame_count):
		var column := frame_index % columns
		var row := int(floor(float(frame_index) / float(columns)))
		var position := Vector2(
			origin.x + float(column) * (frame_size.x + separation.x),
			origin.y + float(row) * (frame_size.y + separation.y)
		)
		var frame := {
			"texturePath": texture_path,
			"region": {
				"position": NiuaMcpVariantCodec.variant_to_json(position),
				"size": NiuaMcpVariantCodec.variant_to_json(frame_size)
			},
			"duration": duration
		}
		if sheet.has("filterClip"):
			frame["filterClip"] = bool(sheet.get("filterClip", false))
		frames.append(frame)

	return {
		"ok": true,
		"frames": frames,
		"sheet": {
			"texturePath": texture_path,
			"columns": columns,
			"rows": int(grid_result.get("rows")),
			"frameCount": frame_count,
			"textureSize": NiuaMcpVariantCodec.variant_to_json(grid_result.get("textureSize"))
		}
	}
