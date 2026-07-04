@tool
extends RefCounted

const NiuaMcpNodeSnapshot = preload("niua_mcp_node_snapshot.gd")
const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")


static func reparent_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var node := NiuaMcpSceneNodeContext.resolve_node(editor, str(body.get("nodePath", "")))
	var root := NiuaMcpSceneNodeContext.edited_scene_root(editor)
	if node == null:
		return NiuaMcpSceneNodeContext.error("node not found: %s (call get_scene_tree to list valid node paths)" % str(body.get("nodePath", "")), "not_found")
	if node == root:
		return NiuaMcpSceneNodeContext.error("cannot reparent the edited scene root")

	var new_parent := NiuaMcpSceneNodeContext.resolve_node(editor, str(body.get("newParentPath", "")))
	if new_parent == null:
		return NiuaMcpSceneNodeContext.error("new parent not found: %s (call get_scene_tree to list valid node paths)" % str(body.get("newParentPath", "")), "not_found")
	if node == new_parent or node.is_ancestor_of(new_parent):
		return NiuaMcpSceneNodeContext.error("cannot reparent a node under itself or its descendants")

	var old_parent := node.get_parent()
	if old_parent == null:
		return NiuaMcpSceneNodeContext.error("node has no parent: %s" % NiuaMcpSceneNodeContext.node_path_for_response(editor, node))

	var keep_global_transform := bool(body.get("keepGlobalTransform", true))
	var had_transform3d := keep_global_transform and node is Node3D
	var had_transform2d := keep_global_transform and node is Node2D
	var transform3d: Transform3D
	var transform2d: Transform2D

	if had_transform3d:
		transform3d = (node as Node3D).global_transform
	elif had_transform2d:
		transform2d = (node as Node2D).global_transform

	var previous_path := NiuaMcpSceneNodeContext.node_path_for_response(editor, node)
	old_parent.remove_child(node)
	new_parent.add_child(node)
	NiuaMcpSceneNodeContext.set_owner_recursive(node, root)

	if had_transform3d:
		(node as Node3D).global_transform = transform3d
	elif had_transform2d:
		(node as Node2D).global_transform = transform2d

	var node_path := NiuaMcpSceneNodeContext.node_path_for_response(editor, node)

	# Read-back guarantee: parentPath is derived from node.get_parent() after
	# the move, not from the requested new_parent.
	return {
		"ok": true,
		"data": {
			"previousPath": previous_path,
			"nodePath": node_path,
			"parentPath": NiuaMcpSceneNodeContext.node_path_for_response(editor, node.get_parent())
		}
	}


static func reorder_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var node := NiuaMcpSceneNodeContext.resolve_node(editor, str(body.get("nodePath", "")))
	var root := NiuaMcpSceneNodeContext.edited_scene_root(editor)
	if node == null:
		return NiuaMcpSceneNodeContext.error("node not found: %s (call get_scene_tree to list valid node paths)" % str(body.get("nodePath", "")), "not_found")
	if node == root:
		return NiuaMcpSceneNodeContext.error("cannot reorder the edited scene root")

	if not body.has("index"):
		return NiuaMcpSceneNodeContext.error("index is required")

	var parent := node.get_parent()
	if parent == null:
		return NiuaMcpSceneNodeContext.error("node has no parent: %s" % NiuaMcpSceneNodeContext.node_path_for_response(editor, node))

	var child_count := parent.get_child_count()
	var target_index := int(body.get("index", -1))
	if target_index < 0 or target_index >= child_count:
		return NiuaMcpSceneNodeContext.error("index out of range: %s (valid 0..%s)" % [target_index, max(child_count - 1, 0)])

	var previous_path := NiuaMcpSceneNodeContext.node_path_for_response(editor, node)
	var previous_index := node.get_index()
	parent.move_child(node, target_index)
	var node_path := NiuaMcpSceneNodeContext.node_path_for_response(editor, node)

	return {
		"ok": true,
		"data": {
			"previousPath": previous_path,
			"nodePath": node_path,
			"parentPath": NiuaMcpSceneNodeContext.node_path_for_response(editor, parent),
			"previousIndex": previous_index,
			"index": node.get_index(),
			"siblingOrder": NiuaMcpNodeSnapshot.sibling_order(parent)
		}
	}
