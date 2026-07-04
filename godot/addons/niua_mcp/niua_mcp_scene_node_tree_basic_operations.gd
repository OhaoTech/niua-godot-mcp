@tool
extends RefCounted

const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")


static func rename_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var node := NiuaMcpSceneNodeContext.resolve_node(editor, str(body.get("nodePath", "")))
	var root := NiuaMcpSceneNodeContext.edited_scene_root(editor)
	if node == null:
		return NiuaMcpSceneNodeContext.error("node not found: %s (call get_scene_tree to list valid node paths)" % str(body.get("nodePath", "")), "not_found")
	if node == root:
		return NiuaMcpSceneNodeContext.error("cannot rename the edited scene root")

	var new_name := str(body.get("newName", ""))
	if new_name.is_empty():
		return NiuaMcpSceneNodeContext.error("newName is required")

	var previous_path := NiuaMcpSceneNodeContext.node_path_for_response(editor, node)
	node.name = new_name
	var node_path := NiuaMcpSceneNodeContext.node_path_for_response(editor, node)

	return {
		"ok": true,
		"data": {
			"previousPath": previous_path,
			"nodePath": node_path,
			"name": node.name,
			"type": node.get_class()
		}
	}


static func delete_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var node := NiuaMcpSceneNodeContext.resolve_node(editor, str(body.get("nodePath", "")))
	var root := NiuaMcpSceneNodeContext.edited_scene_root(editor)
	if node == null:
		return NiuaMcpSceneNodeContext.error("node not found: %s (call get_scene_tree to list valid node paths)" % str(body.get("nodePath", "")), "not_found")
	if node == root:
		return NiuaMcpSceneNodeContext.error("cannot delete the edited scene root")

	var parent := node.get_parent()
	if parent == null:
		return NiuaMcpSceneNodeContext.error("node has no parent: %s" % NiuaMcpSceneNodeContext.node_path_for_response(editor, node))

	var deleted_path := NiuaMcpSceneNodeContext.node_path_for_response(editor, node)
	var deleted_name := str(node.name)
	parent.remove_child(node)
	# Read-back guarantee: confirm the node actually left the tree before
	# reporting success — a still-attached child would be a silent no-op.
	if node.get_parent() != null or parent.has_node(NodePath(deleted_name)):
		return NiuaMcpSceneNodeContext.error("delete failed: node is still attached at %s" % deleted_path, "delete_failed")
	node.queue_free()

	return {
		"ok": true,
		"data": {
			"deletedPath": deleted_path
		}
	}


static func duplicate_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var node := NiuaMcpSceneNodeContext.resolve_node(editor, str(body.get("nodePath", "")))
	var root := NiuaMcpSceneNodeContext.edited_scene_root(editor)
	if node == null:
		return NiuaMcpSceneNodeContext.error("node not found: %s (call get_scene_tree to list valid node paths)" % str(body.get("nodePath", "")), "not_found")
	if node == root:
		return NiuaMcpSceneNodeContext.error("cannot duplicate the edited scene root")

	var parent: Node = node.get_parent()
	var parent_path := str(body.get("parentPath", ""))
	if not parent_path.is_empty():
		parent = NiuaMcpSceneNodeContext.resolve_node(editor, parent_path)
	if parent == null:
		return NiuaMcpSceneNodeContext.error("duplicate parent not found (call get_scene_tree to list valid node paths)", "not_found")

	var duplicate := node.duplicate() as Node
	if duplicate == null:
		return NiuaMcpSceneNodeContext.error("failed to duplicate node: %s" % NiuaMcpSceneNodeContext.node_path_for_response(editor, node))

	var new_name := str(body.get("newName", ""))
	if not new_name.is_empty():
		duplicate.name = new_name

	parent.add_child(duplicate)
	NiuaMcpSceneNodeContext.set_owner_recursive(duplicate, root)

	# Read-back guarantee: name/type/paths come from the duplicate AFTER
	# add_child, which renames on sibling collision.
	return {
		"ok": true,
		"data": {
			"sourcePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, node),
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, duplicate),
			"name": duplicate.name,
			"type": duplicate.get_class(),
			"parentPath": NiuaMcpSceneNodeContext.node_path_for_response(editor, duplicate.get_parent())
		}
	}
