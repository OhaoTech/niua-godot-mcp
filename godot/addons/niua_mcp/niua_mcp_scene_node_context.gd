@tool
extends RefCounted

const NiuaMcpNodeSnapshot = preload("niua_mcp_node_snapshot.gd")


static func edited_scene_root(editor: EditorInterface) -> Node:
	if editor == null:
		return null
	return editor.get_edited_scene_root()


static func resolve_node(editor: EditorInterface, node_path: String) -> Node:
	var root := edited_scene_root(editor)
	if root == null:
		return null

	if node_path.is_empty() or node_path == "." or node_path == root.name:
		return root

	var direct := root.get_node_or_null(NodePath(node_path))
	if direct != null:
		return direct

	if node_path.begins_with("/"):
		return root.get_node_or_null(NodePath(node_path))

	return null


static func node_path_for_response(editor: EditorInterface, node: Node) -> String:
	return NiuaMcpNodeSnapshot.node_path_for_response(node, edited_scene_root(editor))


static func set_owner_recursive(node: Node, owner: Node) -> void:
	node.owner = owner
	for child in node.get_children():
		set_owner_recursive(child, owner)


static func error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
