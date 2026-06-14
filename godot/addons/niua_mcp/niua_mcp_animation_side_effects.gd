@tool
extends RefCounted

const NiuaMcpAnimationPlayerOperations = preload("niua_mcp_animation_player_operations.gd")
const NiuaMcpAnimationTreeOperations = preload("niua_mcp_animation_tree_operations.gd")


static func upsert_animation_with_side_effects(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpAnimationPlayerOperations.upsert_animation(editor, body, path_validator)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Upserted animation %s on %s" % [str(data.get("animation", "")), str(data.get("playerPath", ""))])
	return response


static func play_animation_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpAnimationPlayerOperations.play_animation(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Playing animation %s on %s" % [str(data.get("currentAnimation", "")), str(data.get("playerPath", ""))])
	return response


static func stop_animation_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpAnimationPlayerOperations.stop_animation(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Stopped animation on %s" % str(data.get("playerPath", "")))
	return response


static func instance_animated_scene_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpAnimationPlayerOperations.instance_animated_scene(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Instanced animated scene %s as %s" % [str(data.get("scenePath", "")), str(data.get("nodePath", ""))])
	return response


static func create_animation_tree_state_machine_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpAnimationTreeOperations.create_animation_tree_state_machine(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Created animation state machine %s states=%d" % [str(data.get("treePath", "")), int(data.get("stateCount", 0))])
	return response


static func travel_animation_tree_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpAnimationTreeOperations.travel_animation_tree(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Traveled animation tree %s to %s" % [str(data.get("treePath", "")), str(data.get("requestedState", ""))])
	return response


static func _remember(remember: Callable, message: String) -> void:
	if remember.is_valid():
		remember.call(message)
