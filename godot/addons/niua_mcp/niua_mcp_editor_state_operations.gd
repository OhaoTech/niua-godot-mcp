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


static func scene_tree(current_scene: String, root: Node, query: Dictionary = {}) -> Dictionary:
	var max_depth := str(query.get("maxDepth", "0")).to_int()
	var path_filter := str(query.get("pathFilter", ""))

	var subtree_root := root
	if root != null and not path_filter.is_empty():
		subtree_root = root.get_node_or_null(NodePath(path_filter))
		if subtree_root == null:
			return {
				"ok": false,
				"error": "pathFilter node not found: %s" % path_filter,
				"errorCode": "not_found"
			}

	return {
		"ok": true,
		"data": {
			"currentScene": current_scene,
			"root": NiuaMcpNodeSnapshot.serialize_node(subtree_root, root, max_depth) if subtree_root != null else null
		}
	}
