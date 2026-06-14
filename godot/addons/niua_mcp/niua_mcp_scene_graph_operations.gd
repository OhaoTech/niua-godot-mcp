@tool
extends RefCounted

const NiuaMcpSceneDocumentOperations = preload("niua_mcp_scene_document_operations.gd")
const NiuaMcpSceneGraphContext = preload("niua_mcp_scene_graph_context.gd")
const NiuaMcpSceneInspectorOperations = preload("niua_mcp_scene_inspector_operations.gd")
const NiuaMcpSceneMaterialOperations = preload("niua_mcp_scene_material_operations.gd")
const NiuaMcpSceneNodeOperations = preload("niua_mcp_scene_node_operations.gd")
const NiuaMcpScenePropertyOperations = preload("niua_mcp_scene_property_operations.gd")


static func create_scene_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpSceneDocumentOperations.create_scene_with_side_effects(editor, body, refresh_filesystem, remember)


static func create_node_with_side_effects(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpSceneNodeOperations.create_node_with_side_effects(editor, body, path_validator, remember)


static func create_node_with_script_with_side_effects(editor: EditorInterface, body: Dictionary, path_validator: Callable, create_script: Callable, attach_script: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpSceneNodeOperations.create_node_with_script_with_side_effects(editor, body, path_validator, create_script, attach_script, remember)


static func rename_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneNodeOperations.rename_node_with_side_effects(editor, body, remember)


static func delete_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneNodeOperations.delete_node_with_side_effects(editor, body, remember)


static func duplicate_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneNodeOperations.duplicate_node_with_side_effects(editor, body, remember)


static func reparent_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneNodeOperations.reparent_node_with_side_effects(editor, body, remember)


static func reorder_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneNodeOperations.reorder_node_with_side_effects(editor, body, remember)


static func set_node_property_with_side_effects(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpScenePropertyOperations.set_node_property_with_side_effects(editor, body, path_validator, remember)


static func assign_material_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneMaterialOperations.assign_material_with_side_effects(editor, body, remember)


static func save_current_scene_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneDocumentOperations.save_current_scene_with_side_effects(editor, body, remember)


static func save_scene_as_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpSceneDocumentOperations.save_scene_as_with_side_effects(editor, body, refresh_filesystem, remember)


static func create_scene(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	return NiuaMcpSceneDocumentOperations.create_scene(editor, body, refresh_filesystem)


static func create_node(editor: EditorInterface, body: Dictionary, path_validator: Callable) -> Dictionary:
	return NiuaMcpSceneNodeOperations.create_node(editor, body, path_validator)


static func create_node_with_script(editor: EditorInterface, body: Dictionary, path_validator: Callable, create_script: Callable, attach_script: Callable) -> Dictionary:
	return NiuaMcpSceneNodeOperations.create_node_with_script(editor, body, path_validator, create_script, attach_script)


static func rename_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneNodeOperations.rename_node(editor, body)


static func delete_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneNodeOperations.delete_node(editor, body)


static func duplicate_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneNodeOperations.duplicate_node(editor, body)


static func reparent_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneNodeOperations.reparent_node(editor, body)


static func reorder_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneNodeOperations.reorder_node(editor, body)


static func inspector_properties(editor: EditorInterface, query: Dictionary) -> Dictionary:
	return NiuaMcpSceneInspectorOperations.inspector_properties(editor, query)


static func set_node_property(editor: EditorInterface, body: Dictionary, path_validator: Callable) -> Dictionary:
	return NiuaMcpScenePropertyOperations.set_node_property(editor, body, path_validator)


static func assign_material(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneMaterialOperations.assign_material(editor, body)


static func save_current_scene(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneDocumentOperations.save_current_scene(editor, body)


static func save_scene_as(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	return NiuaMcpSceneDocumentOperations.save_scene_as(editor, body, refresh_filesystem)


static func edited_scene_root(editor: EditorInterface) -> Node:
	return NiuaMcpSceneGraphContext.edited_scene_root(editor)


static func current_scene_path(editor: EditorInterface) -> String:
	return NiuaMcpSceneGraphContext.current_scene_path(editor)


static func open_scenes(editor: EditorInterface) -> Array:
	return NiuaMcpSceneGraphContext.open_scenes(editor)


static func selection_data(editor: EditorInterface) -> Array:
	return NiuaMcpSceneGraphContext.selection_data(editor)


static func resolve_node(editor: EditorInterface, node_path: String) -> Node:
	return NiuaMcpSceneGraphContext.resolve_node(editor, node_path)


static func node_path_for_response(editor: EditorInterface, node: Node) -> String:
	return NiuaMcpSceneGraphContext.node_path_for_response(editor, node)
