@tool
extends RefCounted

const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")
const NiuaMcpSceneNodeCreationOperations = preload("niua_mcp_scene_node_creation_operations.gd")
const NiuaMcpSceneNodeTreeOperations = preload("niua_mcp_scene_node_tree_operations.gd")
const NiuaMcpSceneNodeSideEffects = preload("niua_mcp_scene_node_side_effects.gd")


static func create_node_with_side_effects(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpSceneNodeSideEffects.create_node_with_side_effects(editor, body, path_validator, remember)


static func create_node_with_script_with_side_effects(editor: EditorInterface, body: Dictionary, path_validator: Callable, create_script: Callable, attach_script: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpSceneNodeSideEffects.create_node_with_script_with_side_effects(editor, body, path_validator, create_script, attach_script, remember)


static func rename_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneNodeSideEffects.rename_node_with_side_effects(editor, body, remember)


static func delete_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneNodeSideEffects.delete_node_with_side_effects(editor, body, remember)


static func duplicate_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneNodeSideEffects.duplicate_node_with_side_effects(editor, body, remember)


static func reparent_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneNodeSideEffects.reparent_node_with_side_effects(editor, body, remember)


static func reorder_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneNodeSideEffects.reorder_node_with_side_effects(editor, body, remember)


static func create_node(editor: EditorInterface, body: Dictionary, path_validator: Callable) -> Dictionary:
	return NiuaMcpSceneNodeCreationOperations.create_node(editor, body, path_validator)


static func instance_scene(editor: EditorInterface, body: Dictionary, path_validator: Callable) -> Dictionary:
	return NiuaMcpSceneNodeCreationOperations.instance_scene(editor, body, path_validator)


static func instance_scene_with_side_effects(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable) -> Dictionary:
	var result := instance_scene(editor, body, path_validator)
	if bool(result.get("ok", false)) and remember.is_valid():
		remember.call("instanced scene %s" % str(body.get("path", body.get("scenePath", ""))))
	return result


static func create_node_with_script(editor: EditorInterface, body: Dictionary, path_validator: Callable, create_script: Callable, attach_script: Callable) -> Dictionary:
	return NiuaMcpSceneNodeCreationOperations.create_node_with_script(editor, body, path_validator, create_script, attach_script)


static func rename_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneNodeTreeOperations.rename_node(editor, body)


static func delete_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneNodeTreeOperations.delete_node(editor, body)


static func duplicate_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneNodeTreeOperations.duplicate_node(editor, body)


static func reparent_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneNodeTreeOperations.reparent_node(editor, body)


static func reorder_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneNodeTreeOperations.reorder_node(editor, body)


static func edited_scene_root(editor: EditorInterface) -> Node:
	return NiuaMcpSceneNodeContext.edited_scene_root(editor)


static func resolve_node(editor: EditorInterface, node_path: String) -> Node:
	return NiuaMcpSceneNodeContext.resolve_node(editor, node_path)


static func node_path_for_response(editor: EditorInterface, node: Node) -> String:
	return NiuaMcpSceneNodeContext.node_path_for_response(editor, node)
