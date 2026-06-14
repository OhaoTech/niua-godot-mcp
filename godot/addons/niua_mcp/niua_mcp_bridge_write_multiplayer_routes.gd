@tool
extends RefCounted

const NiuaMcpMultiplayerOperations = preload("niua_mcp_multiplayer_operations.gd")

const HANDLERS := {
	"_create_enet_multiplayer_script": true,
	"_create_multiplayer_spawner": true,
	"_create_multiplayer_synchronizer": true,
	"_create_multiplayer_state_script": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _create_enet_multiplayer_script(body: Dictionary) -> Dictionary:
	return NiuaMcpMultiplayerOperations.create_enet_multiplayer_script_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "refresh_filesystem"),
		Callable(_context, "remember")
	)


func _create_multiplayer_spawner(body: Dictionary) -> Dictionary:
	return NiuaMcpMultiplayerOperations.create_multiplayer_spawner_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _create_multiplayer_synchronizer(body: Dictionary) -> Dictionary:
	return NiuaMcpMultiplayerOperations.create_multiplayer_synchronizer_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _create_multiplayer_state_script(body: Dictionary) -> Dictionary:
	return NiuaMcpMultiplayerOperations.create_multiplayer_state_script_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "refresh_filesystem"),
		Callable(_context, "remember")
	)
