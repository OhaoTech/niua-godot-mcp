@tool
extends RefCounted

const NiuaMcpAnimationPlayerOperations = preload("niua_mcp_animation_player_operations.gd")
const NiuaMcpAnimationSideEffects = preload("niua_mcp_animation_side_effects.gd")
const NiuaMcpAnimationStateOperations = preload("niua_mcp_animation_state_operations.gd")
const NiuaMcpAnimationTreeOperations = preload("niua_mcp_animation_tree_operations.gd")


static func upsert_animation_with_side_effects(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpAnimationSideEffects.upsert_animation_with_side_effects(editor, body, path_validator, remember)


static func play_animation_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpAnimationSideEffects.play_animation_with_side_effects(editor, body, remember)


static func stop_animation_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpAnimationSideEffects.stop_animation_with_side_effects(editor, body, remember)


static func instance_animated_scene_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpAnimationSideEffects.instance_animated_scene_with_side_effects(editor, body, remember)


static func create_animation_tree_state_machine_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpAnimationSideEffects.create_animation_tree_state_machine_with_side_effects(editor, body, remember)


static func travel_animation_tree_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpAnimationSideEffects.travel_animation_tree_with_side_effects(editor, body, remember)


static func upsert_animation(editor: EditorInterface, body: Dictionary, path_validator: Callable) -> Dictionary:
	return NiuaMcpAnimationPlayerOperations.upsert_animation(editor, body, path_validator)


static func play_animation(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpAnimationPlayerOperations.play_animation(editor, body)


static func stop_animation(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpAnimationPlayerOperations.stop_animation(editor, body)


static func instance_animated_scene(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpAnimationPlayerOperations.instance_animated_scene(editor, body)


static func list_animations(editor: EditorInterface, query: Dictionary) -> Dictionary:
	return NiuaMcpAnimationStateOperations.list_animations(editor, query)


static func get_animation_state(editor: EditorInterface, query: Dictionary) -> Dictionary:
	return NiuaMcpAnimationStateOperations.get_animation_state(editor, query)


static func create_animation_tree_state_machine(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpAnimationTreeOperations.create_animation_tree_state_machine(editor, body)


static func travel_animation_tree(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpAnimationTreeOperations.travel_animation_tree(editor, body)
