@tool
extends RefCounted

const NiuaMcpAnimationOperations = preload("niua_mcp_animation_operations.gd")

const HANDLERS := {
	"_upsert_animation": true,
	"_play_animation": true,
	"_stop_animation": true,
	"_instance_animated_scene": true,
	"_create_animation_tree_state_machine": true,
	"_travel_animation_tree": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _upsert_animation(body: Dictionary) -> Dictionary:
	return NiuaMcpAnimationOperations.upsert_animation_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "validate_res_path"),
		Callable(_context, "remember")
	)


func _play_animation(body: Dictionary) -> Dictionary:
	return NiuaMcpAnimationOperations.play_animation_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _stop_animation(body: Dictionary) -> Dictionary:
	return NiuaMcpAnimationOperations.stop_animation_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _instance_animated_scene(body: Dictionary) -> Dictionary:
	return NiuaMcpAnimationOperations.instance_animated_scene_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _create_animation_tree_state_machine(body: Dictionary) -> Dictionary:
	return NiuaMcpAnimationOperations.create_animation_tree_state_machine_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _travel_animation_tree(body: Dictionary) -> Dictionary:
	return NiuaMcpAnimationOperations.travel_animation_tree_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)
