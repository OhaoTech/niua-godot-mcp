@tool
extends RefCounted

const NiuaMcpSceneNodeCreationOperations = preload("niua_mcp_scene_node_creation_operations.gd")
const NiuaMcpSceneNodeTreeOperations = preload("niua_mcp_scene_node_tree_operations.gd")


static func create_node_with_side_effects(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneNodeCreationOperations.create_node(editor, body, path_validator)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Created %s node at %s" % [str(data.get("type", "")), str(data.get("nodePath", ""))])
	return response


static func create_node_with_script_with_side_effects(editor: EditorInterface, body: Dictionary, path_validator: Callable, create_script: Callable, attach_script: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneNodeCreationOperations.create_node_with_script(editor, body, path_validator, create_script, attach_script)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		var node_data: Dictionary = data.get("node", {})
		var script_data: Dictionary = data.get("script", {})
		_remember(remember, "Created %s with script %s" % [str(node_data.get("nodePath", "")), str(script_data.get("path", ""))])
	return response


static func rename_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneNodeTreeOperations.rename_node(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Renamed %s to %s" % [str(data.get("previousPath", "")), str(data.get("nodePath", ""))])
	return response


static func delete_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneNodeTreeOperations.delete_node(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Deleted node %s" % str(data.get("deletedPath", "")))
	return response


static func duplicate_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneNodeTreeOperations.duplicate_node(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Duplicated %s to %s" % [str(data.get("sourcePath", "")), str(data.get("nodePath", ""))])
	return response


static func reparent_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneNodeTreeOperations.reparent_node(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Reparented %s to %s" % [str(data.get("previousPath", "")), str(data.get("nodePath", ""))])
	return response


static func reorder_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneNodeTreeOperations.reorder_node(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Reordered %s from index %d to %d" % [str(data.get("nodePath", "")), int(data.get("previousIndex", -1)), int(data.get("index", -1))])
	return response


static func _remember(remember: Callable, message: String) -> void:
	if remember.is_valid():
		remember.call(message)
