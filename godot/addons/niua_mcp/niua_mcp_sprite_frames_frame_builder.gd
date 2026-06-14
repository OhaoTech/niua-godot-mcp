@tool
extends RefCounted

const NiuaMcpJsonArgs = preload("niua_mcp_json_args.gd")
const NiuaMcpSpriteFramesSheetBuilder = preload("niua_mcp_sprite_frames_sheet_builder.gd")
const NiuaMcpSpriteFramesUtils = preload("niua_mcp_sprite_frames_utils.gd")


static func animation_frames(animation: Dictionary, animation_name: String) -> Dictionary:
	var has_frames := animation.has("frames")
	var has_sheet := animation.has("sheet")
	if has_frames and has_sheet:
		return NiuaMcpSpriteFramesUtils.error("animation must include frames or sheet, not both: %s" % animation_name)

	if has_frames:
		var raw_frames = animation.get("frames", [])
		if typeof(raw_frames) != TYPE_ARRAY or raw_frames.is_empty():
			return NiuaMcpSpriteFramesUtils.error("frames must be a non-empty array for animation: %s" % animation_name)
		return {
			"ok": true,
			"frames": raw_frames
		}

	if has_sheet:
		return NiuaMcpSpriteFramesSheetBuilder.expand_sprite_sheet_frames(animation.get("sheet"), animation_name)

	return NiuaMcpSpriteFramesUtils.error("animation must include frames or sheet: %s" % animation_name)


static func frame_texture_from_frame(
	frame: Dictionary,
	texture: Texture2D,
	animation_name: String,
	frame_index: int
) -> Dictionary:
	if not frame.has("region"):
		return {
			"ok": true,
			"texture": texture
		}

	var raw_region = frame.get("region")
	if typeof(raw_region) != TYPE_DICTIONARY:
		return NiuaMcpSpriteFramesUtils.error(
			"frame region must be an object for animation %s frame %d" % [
				animation_name,
				frame_index
			]
		)
	var region: Dictionary = raw_region

	var position := Vector2.ZERO
	if region.has("position"):
		var position_result := NiuaMcpJsonArgs.typed_vector2(
			region.get("position"),
			"animations[%s].frames[%d].region.position" % [animation_name, frame_index]
		)
		if not position_result.get("ok", false):
			return position_result
		position = position_result.get("value")

	var size_result := NiuaMcpJsonArgs.typed_vector2(
		region.get("size"),
		"animations[%s].frames[%d].region.size" % [animation_name, frame_index]
	)
	if not size_result.get("ok", false):
		return size_result
	var size: Vector2 = size_result.get("value")
	if size.x <= 0.0 or size.y <= 0.0:
		return NiuaMcpSpriteFramesUtils.error(
			"frame region size must be positive for animation %s frame %d" % [
				animation_name,
				frame_index
			]
		)

	var atlas_texture := AtlasTexture.new()
	atlas_texture.set_atlas(texture)
	atlas_texture.set_region(Rect2(position, size))
	if frame.has("filterClip"):
		atlas_texture.set_filter_clip(bool(frame.get("filterClip", false)))

	return {
		"ok": true,
		"texture": atlas_texture
	}
