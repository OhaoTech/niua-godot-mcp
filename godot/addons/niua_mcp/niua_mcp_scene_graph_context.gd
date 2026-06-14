@tool
extends RefCounted

const NiuaMcpNodeSnapshot = preload("niua_mcp_node_snapshot.gd")


static func edited_scene_root(editor: EditorInterface) -> Node:
	if editor == null:
		return null
	return editor.get_edited_scene_root()


static func current_scene_path(editor: EditorInterface) -> String:
	var root := edited_scene_root(editor)
	if root == null:
		return ""
	return root.scene_file_path


static func open_scenes(editor: EditorInterface) -> Array:
	if editor == null or not editor.has_method("get_open_scenes"):
		return []

	var scenes := []
	for scene_path in editor.get_open_scenes():
		scenes.append(str(scene_path))
	return scenes


static func selection_data(editor: EditorInterface) -> Array:
	if editor == null:
		return []

	var selection := editor.get_selection()
	if selection == null:
		return []

	var items := []
	var root := edited_scene_root(editor)
	var selected_nodes := selection.get_selected_nodes()
	for index in range(selected_nodes.size()):
		items.append(NiuaMcpNodeSnapshot.selection_item(selected_nodes[index], root, index))
	return items


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


static func node_for_inspector(editor: EditorInterface, node_path: String) -> Node:
	if node_path.is_empty():
		if editor != null:
			var selection := editor.get_selection()
			if selection != null:
				var selected_nodes := selection.get_selected_nodes()
				if selected_nodes.size() > 0:
					return selected_nodes[0]
		return edited_scene_root(editor)

	return resolve_node(editor, node_path)
