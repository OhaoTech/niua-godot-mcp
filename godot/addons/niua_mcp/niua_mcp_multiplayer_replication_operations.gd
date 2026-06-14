@tool
extends RefCounted

const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")


static func create_multiplayer_spawner(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var root := NiuaMcpSceneNodeContext.edited_scene_root(editor)
	if root == null:
		return NiuaMcpSceneNodeContext.error("no edited scene is open")

	var parent_result := _resolve_parent(editor, body, root)
	if not bool(parent_result.get("ok", false)):
		return parent_result
	var parent: Node = parent_result.get("parent")

	var spawner := MultiplayerSpawner.new()
	spawner.name = str(body.get("name", "MultiplayerSpawner"))
	spawner.spawn_path = NodePath(str(body.get("spawnPath", ".")))
	if body.has("spawnLimit"):
		spawner.spawn_limit = int(body.get("spawnLimit"))

	var spawnable_scenes := []
	var raw_scenes = body.get("spawnableScenes", [])
	if typeof(raw_scenes) == TYPE_ARRAY:
		for raw_scene in raw_scenes:
			var scene_path := str(raw_scene)
			if not scene_path.is_empty():
				spawner.add_spawnable_scene(scene_path)
				spawnable_scenes.append(scene_path)

	parent.add_child(spawner)
	spawner.owner = root

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, spawner),
			"name": spawner.name,
			"type": spawner.get_class(),
			"parentPath": NiuaMcpSceneNodeContext.node_path_for_response(editor, parent),
			"spawnPath": str(spawner.spawn_path),
			"spawnLimit": spawner.spawn_limit,
			"spawnableScenes": spawnable_scenes
		}
	}


static func create_multiplayer_synchronizer(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var root := NiuaMcpSceneNodeContext.edited_scene_root(editor)
	if root == null:
		return NiuaMcpSceneNodeContext.error("no edited scene is open")

	var parent_result := _resolve_parent(editor, body, root)
	if not bool(parent_result.get("ok", false)):
		return parent_result
	var parent: Node = parent_result.get("parent")

	var synchronizer := MultiplayerSynchronizer.new()
	synchronizer.name = str(body.get("name", "MultiplayerSynchronizer"))
	synchronizer.root_path = NodePath(str(body.get("rootPath", "..")))
	if body.has("replicationInterval"):
		synchronizer.replication_interval = float(body.get("replicationInterval"))
	if body.has("deltaInterval"):
		synchronizer.delta_interval = float(body.get("deltaInterval"))
	if body.has("publicVisibility"):
		synchronizer.public_visibility = bool(body.get("publicVisibility"))

	var config := SceneReplicationConfig.new()
	var property_paths := []
	var raw_paths = body.get("propertyPaths", [])
	if typeof(raw_paths) != TYPE_ARRAY or raw_paths.is_empty():
		synchronizer.free()
		return NiuaMcpSceneNodeContext.error("propertyPaths must contain at least one NodePath")

	for raw_path in raw_paths:
		var path_text := str(raw_path)
		if path_text.is_empty():
			continue
		var property_path := NodePath(path_text)
		config.add_property(property_path)
		config.property_set_spawn(property_path, true)
		config.property_set_sync(property_path, true)
		config.property_set_watch(property_path, true)
		property_paths.append(path_text)

	if property_paths.is_empty():
		synchronizer.free()
		return NiuaMcpSceneNodeContext.error("propertyPaths must contain at least one NodePath")

	synchronizer.replication_config = config
	parent.add_child(synchronizer)
	synchronizer.owner = root

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, synchronizer),
			"name": synchronizer.name,
			"type": synchronizer.get_class(),
			"parentPath": NiuaMcpSceneNodeContext.node_path_for_response(editor, parent),
			"rootPath": str(synchronizer.root_path),
			"propertyPaths": property_paths,
			"replicationInterval": synchronizer.replication_interval,
			"deltaInterval": synchronizer.delta_interval,
			"publicVisibility": synchronizer.public_visibility
		}
	}


static func _resolve_parent(editor: EditorInterface, body: Dictionary, root: Node) -> Dictionary:
	var parent: Node = root
	var parent_path := str(body.get("parentPath", ""))
	if not parent_path.is_empty():
		parent = NiuaMcpSceneNodeContext.resolve_node(editor, parent_path)
		if parent == null:
			return NiuaMcpSceneNodeContext.error("parent node not found: %s" % parent_path, "not_found")
	return {
		"ok": true,
		"parent": parent
	}
