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


# Compact node search for large scenes (Wake-sized trees). Avoids dumping the full tree.
static func find_nodes(editor: EditorInterface, query: Dictionary = {}) -> Dictionary:
	if editor == null:
		return {
			"ok": false,
			"error": "Godot editor interface is unavailable",
			"errorCode": "bad_request"
		}
	var root := editor.get_edited_scene_root()
	if root == null:
		return {
			"ok": false,
			"error": "no edited scene is open",
			"errorCode": "not_found",
			"recovery": {
				"tool": "open_scene",
				"hint": "open_scene or create_scene first"
			}
		}

	var name_contains := str(query.get("nameContains", "")).to_lower()
	var type_name := str(query.get("type", ""))
	var path_prefix := str(query.get("pathPrefix", ""))
	var scene_file_contains := str(query.get("sceneFileContains", "")).to_lower()
	var max_results := str(query.get("maxResults", "50")).to_int()
	if max_results <= 0:
		max_results = 50
	if max_results > 200:
		max_results = 200

	var matches: Array = []
	var truncated := false
	_collect_node_matches(
		root,
		root,
		name_contains,
		type_name,
		path_prefix,
		scene_file_contains,
		max_results,
		matches
	)
	if matches.size() >= max_results:
		truncated = true

	return {
		"ok": true,
		"data": {
			"currentScene": str(root.scene_file_path),
			"count": matches.size(),
			"truncated": truncated,
			"nodes": matches
		}
	}


static func _collect_node_matches(
	node: Node,
	response_root: Node,
	name_contains: String,
	type_name: String,
	path_prefix: String,
	scene_file_contains: String,
	max_results: int,
	matches: Array
) -> void:
	if matches.size() >= max_results:
		return

	var path := str(response_root.get_path_to(node)) if node != response_root else ""
	var name_l := str(node.name).to_lower()
	var scene_file := str(node.scene_file_path)
	var ok := true
	if not name_contains.is_empty() and name_l.find(name_contains) < 0:
		ok = false
	if ok and not type_name.is_empty() and not node.is_class(type_name):
		ok = false
	if ok and not path_prefix.is_empty():
		var prefix := path_prefix
		if not path.begins_with(prefix) and path != prefix and not (prefix.is_empty() and path.is_empty()):
			# allow prefix with/without trailing slash semantics
			if not (path.begins_with(prefix + "/") or path == prefix):
				ok = false
	if ok and not scene_file_contains.is_empty() and scene_file.to_lower().find(scene_file_contains) < 0:
		ok = false

	if ok:
		matches.append({
			"path": path,
			"name": str(node.name),
			"type": node.get_class(),
			"sceneFilePath": scene_file,
			"childCount": node.get_child_count()
		})

	for child in node.get_children():
		if child is Node:
			_collect_node_matches(
				child,
				response_root,
				name_contains,
				type_name,
				path_prefix,
				scene_file_contains,
				max_results,
				matches
			)

