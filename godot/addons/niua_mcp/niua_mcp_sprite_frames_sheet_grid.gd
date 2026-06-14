@tool
extends RefCounted

const NiuaMcpJsonArgs = preload("niua_mcp_json_args.gd")
const NiuaMcpSpriteFramesUtils = preload("niua_mcp_sprite_frames_utils.gd")


static func infer_sprite_sheet_grid(sheet: Dictionary, texture: Texture2D, animation_name: String) -> Dictionary:
	var field_prefix := "animations[%s].sheet" % animation_name
	var frame_size_result := NiuaMcpJsonArgs.typed_vector2(sheet.get("frameSize"), "%s.frameSize" % field_prefix)
	if not frame_size_result.get("ok", false):
		return frame_size_result
	var frame_size: Vector2 = frame_size_result.get("value")
	if frame_size.x <= 0.0 or frame_size.y <= 0.0:
		return NiuaMcpSpriteFramesUtils.error("sheet frameSize entries must be positive for animation: %s" % animation_name)

	var origin := Vector2.ZERO
	if sheet.has("origin"):
		var origin_result := NiuaMcpJsonArgs.typed_vector2(sheet.get("origin"), "%s.origin" % field_prefix)
		if not origin_result.get("ok", false):
			return origin_result
		origin = origin_result.get("value")
	if origin.x < 0.0 or origin.y < 0.0:
		return NiuaMcpSpriteFramesUtils.error("sheet origin entries must be non-negative for animation: %s" % animation_name)

	var separation := Vector2.ZERO
	if sheet.has("separation"):
		var separation_result := NiuaMcpJsonArgs.typed_vector2(sheet.get("separation"), "%s.separation" % field_prefix)
		if not separation_result.get("ok", false):
			return separation_result
		separation = separation_result.get("value")
	if separation.x < 0.0 or separation.y < 0.0:
		return NiuaMcpSpriteFramesUtils.error("sheet separation entries must be non-negative for animation: %s" % animation_name)

	var texture_size := Vector2(float(texture.get_width()), float(texture.get_height()))
	if texture_size.x <= 0.0 or texture_size.y <= 0.0:
		return NiuaMcpSpriteFramesUtils.error("sheet texture has invalid bounds for animation: %s" % animation_name)
	if origin.x >= texture_size.x or origin.y >= texture_size.y:
		return NiuaMcpSpriteFramesUtils.error("sheet origin must be inside texture bounds for animation: %s" % animation_name)

	var physical_columns := int(floor((texture_size.x - origin.x + separation.x) / (frame_size.x + separation.x)))
	var physical_rows := int(floor((texture_size.y - origin.y + separation.y) / (frame_size.y + separation.y)))
	if physical_columns < 1 or physical_rows < 1:
		return NiuaMcpSpriteFramesUtils.error("sheet frameSize does not fit texture bounds for animation: %s" % animation_name)

	var columns := physical_columns
	if sheet.has("columns"):
		var columns_result := NiuaMcpJsonArgs.integer(sheet.get("columns"), "%s.columns" % field_prefix)
		if not columns_result.get("ok", false):
			return columns_result
		columns = int(columns_result.get("value"))
		if columns <= 0:
			return NiuaMcpSpriteFramesUtils.error("sheet columns must be positive for animation: %s" % animation_name)
		if columns > physical_columns:
			return NiuaMcpSpriteFramesUtils.error("sheet columns exceed texture bounds for animation: %s" % animation_name)

	var rows := physical_rows
	if sheet.has("rows"):
		var rows_result := NiuaMcpJsonArgs.integer(sheet.get("rows"), "%s.rows" % field_prefix)
		if not rows_result.get("ok", false):
			return rows_result
		rows = int(rows_result.get("value"))
		if rows <= 0:
			return NiuaMcpSpriteFramesUtils.error("sheet rows must be positive for animation: %s" % animation_name)
		if rows > physical_rows:
			return NiuaMcpSpriteFramesUtils.error("sheet rows exceed texture bounds for animation: %s" % animation_name)

	var capacity := columns * rows
	if capacity < 1:
		return NiuaMcpSpriteFramesUtils.error("sheet grid capacity must be at least 1 for animation: %s" % animation_name)

	var frame_count := capacity
	if sheet.has("frameCount"):
		var frame_count_result := NiuaMcpJsonArgs.integer(sheet.get("frameCount"), "%s.frameCount" % field_prefix)
		if not frame_count_result.get("ok", false):
			return frame_count_result
		frame_count = int(frame_count_result.get("value"))
		if frame_count <= 0:
			return NiuaMcpSpriteFramesUtils.error("sheet frameCount must be positive for animation: %s" % animation_name)
		if frame_count > capacity:
			return NiuaMcpSpriteFramesUtils.error("sheet frameCount exceeds grid capacity for animation: %s" % animation_name)

	for frame_index in range(frame_count):
		var column := frame_index % columns
		var row := int(floor(float(frame_index) / float(columns)))
		var max_x := origin.x + float(column) * (frame_size.x + separation.x) + frame_size.x
		var max_y := origin.y + float(row) * (frame_size.y + separation.y) + frame_size.y
		if max_x > texture_size.x or max_y > texture_size.y:
			return NiuaMcpSpriteFramesUtils.error(
				"sheet frame %d exceeds texture bounds for animation: %s" % [
					frame_index,
					animation_name
				]
			)

	return {
		"ok": true,
		"columns": columns,
		"rows": rows,
		"frameCount": frame_count,
		"frameSize": frame_size,
		"origin": origin,
		"separation": separation,
		"textureSize": texture_size
	}
