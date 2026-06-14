@tool
extends RefCounted

const NiuaMcpSceneNodeTreeBasicOperations = preload("niua_mcp_scene_node_tree_basic_operations.gd")
const NiuaMcpSceneNodeTreeHierarchyOperations = preload("niua_mcp_scene_node_tree_hierarchy_operations.gd")


static func rename_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneNodeTreeBasicOperations.rename_node(editor, body)


static func delete_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneNodeTreeBasicOperations.delete_node(editor, body)


static func duplicate_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneNodeTreeBasicOperations.duplicate_node(editor, body)


static func reparent_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneNodeTreeHierarchyOperations.reparent_node(editor, body)


static func reorder_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneNodeTreeHierarchyOperations.reorder_node(editor, body)
