@tool
extends RefCounted

const NiuaMcpSceneNodeInstanceCreation = preload("niua_mcp_scene_node_instance_creation.gd")
const NiuaMcpSceneNodeScriptCreation = preload("niua_mcp_scene_node_script_creation.gd")


static func create_node(editor: EditorInterface, body: Dictionary, path_validator: Callable) -> Dictionary:
	return NiuaMcpSceneNodeInstanceCreation.create_node(editor, body, path_validator)


static func create_node_with_script(editor: EditorInterface, body: Dictionary, path_validator: Callable, create_script: Callable, attach_script: Callable) -> Dictionary:
	return NiuaMcpSceneNodeScriptCreation.create_node_with_script(editor, body, path_validator, create_script, attach_script)
