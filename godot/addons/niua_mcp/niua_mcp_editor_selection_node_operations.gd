@tool
extends RefCounted

const NiuaMcpNodeSnapshot = preload("niua_mcp_node_snapshot.gd")
const NiuaMcpSceneGraphOperations = preload("niua_mcp_scene_graph_operations.gd")
const NiuaMcpEditorSelectionUtils = preload("niua_mcp_editor_selection_utils.gd")


static func selection(editor: EditorInterface) -> Dictionary:
	return {
		"ok": true,
		"data": {
			"selection": NiuaMcpSceneGraphOperations.selection_data(editor)
		}
	}


static func set_selection(editor: EditorInterface, body: Dictionary) -> Dictionary:
	if editor == null:
		return NiuaMcpEditorSelectionUtils.error("Godot editor interface is unavailable")

	var raw_node_paths = body.get("nodePaths", [])
	if typeof(raw_node_paths) != TYPE_ARRAY:
		return NiuaMcpEditorSelectionUtils.error("nodePaths must be an array")

	var editor_selection := editor.get_selection()
	if editor_selection == null:
		return NiuaMcpEditorSelectionUtils.error("Godot editor selection is unavailable")

	var nodes := []
	for raw_node_path in raw_node_paths:
		var node_path := str(raw_node_path)
		var node := NiuaMcpSceneGraphOperations.resolve_node(editor, node_path)
		if node == null:
			return NiuaMcpEditorSelectionUtils.error("node not found: %s" % node_path, "not_found")
		nodes.append(node)

	editor_selection.clear()
	for node in nodes:
		editor_selection.add_node(node)

	var edited := false
	if nodes.size() == 1 and editor.has_method("edit_node"):
		editor.edit_node(nodes[0])
		edited = true

	return {
		"ok": true,
		"data": {
			"selection": NiuaMcpSceneGraphOperations.selection_data(editor),
			"selectedCount": nodes.size(),
			"edited": edited
		}
	}


static func focus_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	if editor == null:
		return NiuaMcpEditorSelectionUtils.error("Godot editor interface is unavailable")

	var node_path := str(body.get("nodePath", ""))
	if node_path.is_empty():
		return NiuaMcpEditorSelectionUtils.error("nodePath is required")

	var node := NiuaMcpSceneGraphOperations.resolve_node(editor, node_path)
	if node == null:
		return NiuaMcpEditorSelectionUtils.error("node not found: %s" % node_path, "not_found")

	var editor_selection := editor.get_selection()
	if editor_selection == null:
		return NiuaMcpEditorSelectionUtils.error("Godot editor selection is unavailable")

	editor_selection.clear()
	editor_selection.add_node(node)

	var edited := false
	if editor.has_method("edit_node"):
		editor.edit_node(node)
		edited = true

	var inspected := false
	if editor.has_method("inspect_object"):
		editor.inspect_object(node)
		inspected = true

	return {
		"ok": true,
		"data": {
			"nodePath": node_path,
			"node": NiuaMcpNodeSnapshot.selection_item(node, NiuaMcpSceneGraphOperations.edited_scene_root(editor)),
			"selection": NiuaMcpSceneGraphOperations.selection_data(editor),
			"edited": edited,
			"inspected": inspected
		}
	}
