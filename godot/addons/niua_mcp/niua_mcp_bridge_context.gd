@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpSceneGraphOperations = preload("niua_mcp_scene_graph_operations.gd")


static func editor_resource_filesystem(editor: EditorInterface):
	if editor == null or not editor.has_method("get_resource_filesystem"):
		return null
	return editor.get_resource_filesystem()


static func refresh_filesystem(editor: EditorInterface, path: String = "") -> void:
	var resource_filesystem = editor_resource_filesystem(editor)
	if resource_filesystem == null:
		return
	if not path.is_empty() and resource_filesystem.has_method("update_file"):
		resource_filesystem.update_file(path)
	if resource_filesystem.has_method("scan_sources"):
		resource_filesystem.scan_sources()
	elif resource_filesystem.has_method("scan"):
		resource_filesystem.scan()


static func save_project_settings_if_requested(save_requested: bool) -> int:
	if not save_requested:
		return OK
	return ProjectSettings.save()


static func edited_scene_root(editor: EditorInterface) -> Node:
	return NiuaMcpSceneGraphOperations.edited_scene_root(editor)


static func current_scene_path(editor: EditorInterface) -> String:
	return NiuaMcpSceneGraphOperations.current_scene_path(editor)


static func open_scenes(editor: EditorInterface) -> Array:
	return NiuaMcpSceneGraphOperations.open_scenes(editor)


static func selection_data(editor: EditorInterface) -> Array:
	return NiuaMcpSceneGraphOperations.selection_data(editor)


static func resolve_node(editor: EditorInterface, node_path: String) -> Node:
	return NiuaMcpSceneGraphOperations.resolve_node(editor, node_path)


static func node_path_for_response(editor: EditorInterface, node: Node) -> String:
	return NiuaMcpSceneGraphOperations.node_path_for_response(editor, node)


static func validate_res_path(raw_path: String, allow_root: bool = false) -> Dictionary:
	return NiuaMcpPathUtils.validate_res_path(raw_path, allow_root)
