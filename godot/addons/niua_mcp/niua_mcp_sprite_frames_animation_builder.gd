@tool
extends RefCounted

const NiuaMcpSpriteFramesFrameBuilder = preload("niua_mcp_sprite_frames_frame_builder.gd")
const NiuaMcpSpriteFramesUtils = preload("niua_mcp_sprite_frames_utils.gd")


static func add_animation(sprite_frames: SpriteFrames, animation: Dictionary, seen_animation_names: Dictionary) -> Dictionary:
	var animation_name := str(animation.get("name", "")).strip_edges()
	if animation_name.is_empty():
		return NiuaMcpSpriteFramesUtils.error("animation name must not be empty")
	if seen_animation_names.has(animation_name):
		return NiuaMcpSpriteFramesUtils.error("duplicate animation name: %s" % animation_name)
	seen_animation_names[animation_name] = true

	var speed_fps := float(animation.get("speedFps", 5.0))
	if speed_fps <= 0.0:
		return NiuaMcpSpriteFramesUtils.error("speedFps must be positive for animation: %s" % animation_name)
	var frames_result := NiuaMcpSpriteFramesFrameBuilder.animation_frames(animation, animation_name)
	if not frames_result.get("ok", false):
		return frames_result
	var raw_frames: Array = frames_result.get("frames")

	sprite_frames.add_animation(animation_name)
	sprite_frames.set_animation_speed(animation_name, speed_fps)
	sprite_frames.set_animation_loop(animation_name, bool(animation.get("loop", true)))

	for frame_index in range(raw_frames.size()):
		var raw_frame = raw_frames[frame_index]
		if typeof(raw_frame) != TYPE_DICTIONARY:
			return NiuaMcpSpriteFramesUtils.error("each frame must be an object for animation: %s" % animation_name)
		var frame: Dictionary = raw_frame
		var texture_result := NiuaMcpSpriteFramesUtils.load_texture2d(frame.get("texturePath", ""), "frame")
		if not texture_result.get("ok", false):
			return texture_result
		var texture_resource: Texture2D = texture_result.get("texture")
		var duration := float(frame.get("duration", 1.0))
		if duration <= 0.0:
			return NiuaMcpSpriteFramesUtils.error("frame duration must be positive for animation: %s" % animation_name)
		var frame_texture_result := NiuaMcpSpriteFramesFrameBuilder.frame_texture_from_frame(
			frame,
			texture_resource,
			animation_name,
			frame_index
		)
		if not frame_texture_result.get("ok", false):
			return frame_texture_result
		var frame_texture: Texture2D = frame_texture_result.get("texture")
		sprite_frames.add_frame(animation_name, frame_texture, duration)

	var animation_summary := {
		"name": animation_name,
		"speedFps": sprite_frames.get_animation_speed(animation_name),
		"loop": sprite_frames.get_animation_loop(animation_name),
		"frameCount": sprite_frames.get_frame_count(animation_name)
	}
	var sheet_summary = frames_result.get("sheet", null)
	if sheet_summary != null:
		animation_summary["sheet"] = sheet_summary

	return {
		"ok": true,
		"summary": animation_summary
	}
