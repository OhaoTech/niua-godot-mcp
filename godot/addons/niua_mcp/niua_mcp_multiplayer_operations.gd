@tool
extends RefCounted

const NiuaMcpMultiplayerEnetScriptOperations = preload("niua_mcp_multiplayer_enet_script_operations.gd")
const NiuaMcpMultiplayerReplicationOperations = preload("niua_mcp_multiplayer_replication_operations.gd")
const NiuaMcpMultiplayerStateScriptOperations = preload("niua_mcp_multiplayer_state_script_operations.gd")
const NiuaMcpMultiplayerSideEffects = preload("niua_mcp_multiplayer_side_effects.gd")


static func create_enet_multiplayer_script(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	return NiuaMcpMultiplayerEnetScriptOperations.create_enet_multiplayer_script(editor, body, refresh_filesystem)


static func create_enet_multiplayer_script_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var result := create_enet_multiplayer_script(editor, body, refresh_filesystem)
	NiuaMcpMultiplayerSideEffects.remember_created_enet_multiplayer_script(result, remember)
	return result


static func create_multiplayer_spawner(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpMultiplayerReplicationOperations.create_multiplayer_spawner(editor, body)


static func create_multiplayer_spawner_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var result := create_multiplayer_spawner(editor, body)
	NiuaMcpMultiplayerSideEffects.remember_created_multiplayer_spawner(result, remember)
	return result


static func create_multiplayer_synchronizer(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpMultiplayerReplicationOperations.create_multiplayer_synchronizer(editor, body)


static func create_multiplayer_synchronizer_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var result := create_multiplayer_synchronizer(editor, body)
	NiuaMcpMultiplayerSideEffects.remember_created_multiplayer_synchronizer(result, remember)
	return result


static func create_multiplayer_state_script(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	return NiuaMcpMultiplayerStateScriptOperations.create_multiplayer_state_script(editor, body, refresh_filesystem)


static func create_multiplayer_state_script_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var result := create_multiplayer_state_script(editor, body, refresh_filesystem)
	NiuaMcpMultiplayerSideEffects.remember_created_multiplayer_state_script(result, remember)
	return result
