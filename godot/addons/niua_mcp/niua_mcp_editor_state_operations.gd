@tool
extends RefCounted

const NiuaMcpNodeSnapshot = preload("niua_mcp_node_snapshot.gd")
const NiuaMcpVersionSupport = preload("niua_mcp_version_support.gd")


static func health(running: bool, host: String, port: int, read_endpoints: Array, write_endpoints: Array) -> Dictionary:
	return {
		"ok": true,
		"data": {
			"status": "ready" if running else "stopped",
			"host": host,
			"port": port,
			"godot": NiuaMcpVersionSupport.health(),
			"readEndpoints": read_endpoints.duplicate(),
			"writeEndpoints": write_endpoints.duplicate()
		}
	}


static func project_info() -> Dictionary:
	return {
		"ok": true,
		"data": {
			"projectRoot": ProjectSettings.globalize_path("res://"),
			"projectName": ProjectSettings.get_setting("application/config/name", ""),
			"godotVersion": Engine.get_version_info()
		}
	}


static func editor_state(current_scene: String, open_scenes: Array, main_screen: Dictionary, selection: Array, logs: Array) -> Dictionary:
	return {
		"ok": true,
		"data": {
			"projectRoot": ProjectSettings.globalize_path("res://"),
			"currentScene": current_scene,
			"openScenes": open_scenes,
			"mainScreen": main_screen,
			"selection": selection,
			"logs": logs.duplicate()
		}
	}


static func scene_tree(current_scene: String, root: Node) -> Dictionary:
	return {
		"ok": true,
		"data": {
			"currentScene": current_scene,
			"root": NiuaMcpNodeSnapshot.serialize_node(root, root) if root != null else null
		}
	}
