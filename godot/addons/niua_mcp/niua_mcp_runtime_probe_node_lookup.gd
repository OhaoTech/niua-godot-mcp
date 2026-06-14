@tool
extends RefCounted


static func find_node(probe: Node, node_path: String) -> Node:
	if node_path.is_empty():
		return null

	var tree := probe.get_tree()
	var root := tree.root if tree != null else null
	if root == null:
		return null

	var direct := probe.get_node_or_null(NodePath(node_path))
	if direct != null:
		return direct

	if node_path == "/root":
		return root

	if node_path.begins_with("/root/"):
		return root.get_node_or_null(NodePath(node_path.trim_prefix("/root/")))

	return root.get_node_or_null(NodePath(node_path))
