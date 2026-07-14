@tool
extends RefCounted

const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")
const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")


static func instance_scene(editor: EditorInterface, body: Dictionary, path_validator: Callable) -> Dictionary:
	var root := NiuaMcpSceneNodeContext.edited_scene_root(editor)
	if root == null:
		return NiuaMcpSceneNodeContext.error("no edited scene is open", "not_found")

	var scene_path := str(body.get("path", body.get("scenePath", "")))
	var validation := NiuaMcpPathUtils.validate_res_path(scene_path)
	if not bool(validation.get("ok", false)):
		return validation

	scene_path = str(validation.get("path"))
	if not ResourceLoader.exists(scene_path) and not FileAccess.file_exists(scene_path):
		return NiuaMcpSceneNodeContext.error(
			"scene/asset not found or not imported yet: %s" % scene_path,
			"not_found",
			{
				"tool": "wait_for_imported_asset",
				"hint": "wait_for_imported_asset({ path: \"%s\" }) then instance_scene again" % scene_path
			}
		)

	var resource := ResourceLoader.load(scene_path)
	if resource == null:
		return NiuaMcpSceneNodeContext.error("failed to load resource: %s" % scene_path, "not_found")
	if not (resource is PackedScene):
		return NiuaMcpSceneNodeContext.error("resource is not a PackedScene (.tscn/.scn/.glb): %s" % scene_path)

	var instance := (resource as PackedScene).instantiate()
	if instance == null or not (instance is Node):
		if instance != null and instance is Object:
			instance.free()
		return NiuaMcpSceneNodeContext.error("could not instantiate: %s" % scene_path)

	var node := instance as Node
	var parent: Node = root
	var parent_path := str(body.get("parentPath", ""))
	if not parent_path.is_empty():
		parent = NiuaMcpSceneNodeContext.resolve_node(editor, parent_path)
		if parent == null:
			node.free()
			return NiuaMcpSceneNodeContext.error(
				"parent node not found: %s (use find_nodes to locate a stable path)" % parent_path,
				"not_found"
			)

	var desired_name := str(body.get("name", ""))
	if not desired_name.is_empty():
		node.name = desired_name

	parent.add_child(node)
	_set_owners_recursive(node, root)

	var properties = body.get("properties", {})
	if typeof(properties) == TYPE_DICTIONARY:
		for key in properties.keys():
			node.set(str(key), NiuaMcpVariantCodec.json_to_variant(properties[key], path_validator))

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, node),
			"name": str(node.name),
			"type": node.get_class(),
			"scenePath": scene_path,
			"parentPath": NiuaMcpSceneNodeContext.node_path_for_response(editor, node.get_parent())
		}
	}


static func _set_owners_recursive(node: Node, owner: Node) -> void:
	node.owner = owner
	for child in node.get_children():
		if child is Node:
			_set_owners_recursive(child, owner)


static func create_node(editor: EditorInterface, body: Dictionary, path_validator: Callable) -> Dictionary:
	var root := NiuaMcpSceneNodeContext.edited_scene_root(editor)
	if root == null:
		return NiuaMcpSceneNodeContext.error("no edited scene is open")

	var type_name := str(body.get("type", ""))
	if type_name.is_empty():
		return NiuaMcpSceneNodeContext.error("node type is required")
	if not ClassDB.class_exists(type_name):
		return NiuaMcpSceneNodeContext.error("unknown Godot class: %s" % type_name)

	var instance: Object = ClassDB.instantiate(type_name)
	if not (instance is Node):
		if instance != null and instance is Object:
			instance.free()
		return NiuaMcpSceneNodeContext.error("Godot class is not a Node: %s" % type_name)

	var node := instance as Node
	var parent: Node = root
	var parent_path := str(body.get("parentPath", ""))
	if not parent_path.is_empty():
		parent = NiuaMcpSceneNodeContext.resolve_node(editor, parent_path)
		if parent == null:
			node.free()
			return NiuaMcpSceneNodeContext.error("parent node not found: %s (call get_scene_tree to list valid node paths)" % parent_path, "not_found")

	var desired_name := str(body.get("name", ""))
	if not desired_name.is_empty():
		node.name = desired_name

	parent.add_child(node)
	node.owner = root

	var properties = body.get("properties", {})
	if typeof(properties) == TYPE_DICTIONARY:
		for key in properties.keys():
			node.set(str(key), NiuaMcpVariantCodec.json_to_variant(properties[key], path_validator))

	# Read-back guarantee: every field below is derived from the node AFTER
	# add_child — Godot renames on sibling collision (requested "Enemy" can
	# become "@Enemy@3"), so echoing the requested name would lie.
	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, node),
			"name": node.name,
			"type": node.get_class(),
			"parentPath": NiuaMcpSceneNodeContext.node_path_for_response(editor, node.get_parent())
		}
	}
