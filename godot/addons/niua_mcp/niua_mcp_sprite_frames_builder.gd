@tool
extends RefCounted

const NiuaMcpSpriteFramesAnimationBuilder = preload("niua_mcp_sprite_frames_animation_builder.gd")
const NiuaMcpSpriteFramesUtils = preload("niua_mcp_sprite_frames_utils.gd")


static func build(body: Dictionary) -> Dictionary:
	var raw_animations = body.get("animations", [])
	if typeof(raw_animations) != TYPE_ARRAY or raw_animations.is_empty():
		return NiuaMcpSpriteFramesUtils.error("animations must be a non-empty array")

	var sprite_frames := SpriteFrames.new()
	for existing_animation in sprite_frames.get_animation_names():
		sprite_frames.remove_animation(str(existing_animation))

	var seen_animation_names := {}
	var animation_summaries := []
	for raw_animation in raw_animations:
		if typeof(raw_animation) != TYPE_DICTIONARY:
			return NiuaMcpSpriteFramesUtils.error("each animation must be an object")
		var animation_result := NiuaMcpSpriteFramesAnimationBuilder.add_animation(
			sprite_frames,
			raw_animation,
			seen_animation_names
		)
		if not animation_result.get("ok", false):
			return animation_result
		animation_summaries.append(animation_result.get("summary"))

	var resource_name := str(body.get("resourceName", "")).strip_edges()
	if not resource_name.is_empty():
		sprite_frames.resource_name = resource_name

	return {
		"ok": true,
		"resource": sprite_frames,
		"resourceName": resource_name,
		"animations": animation_summaries
	}
