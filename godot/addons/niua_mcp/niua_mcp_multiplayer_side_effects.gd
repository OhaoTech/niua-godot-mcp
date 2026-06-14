@tool
extends RefCounted


static func remember_created_enet_multiplayer_script(result: Dictionary, remember: Callable) -> void:
	if not bool(result.get("ok", false)) or not remember.is_valid():
		return
	var data: Dictionary = result.get("data", {})
	remember.call("Created ENet multiplayer script %s on %s" % [str(data.get("scriptPath", "")), str(data.get("nodePath", ""))])


static func remember_created_multiplayer_spawner(result: Dictionary, remember: Callable) -> void:
	if not bool(result.get("ok", false)) or not remember.is_valid():
		return
	var data: Dictionary = result.get("data", {})
	remember.call("Created MultiplayerSpawner %s" % str(data.get("nodePath", "")))


static func remember_created_multiplayer_synchronizer(result: Dictionary, remember: Callable) -> void:
	if not bool(result.get("ok", false)) or not remember.is_valid():
		return
	var data: Dictionary = result.get("data", {})
	remember.call("Created MultiplayerSynchronizer %s" % str(data.get("nodePath", "")))


static func remember_created_multiplayer_state_script(result: Dictionary, remember: Callable) -> void:
	if not bool(result.get("ok", false)) or not remember.is_valid():
		return
	var data: Dictionary = result.get("data", {})
	remember.call("Created multiplayer state script %s on %s" % [str(data.get("scriptPath", "")), str(data.get("nodePath", ""))])
