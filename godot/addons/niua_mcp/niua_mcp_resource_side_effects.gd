@tool
extends RefCounted

const NiuaMcpResourceGenericOperations = preload("niua_mcp_resource_generic_operations.gd")
const NiuaMcpResourceOperationUtils = preload("niua_mcp_resource_operation_utils.gd")
const NiuaMcpResourceShaderMaterialOperations = preload("niua_mcp_resource_shader_material_operations.gd")
const NiuaMcpResourceSpriteFramesOperations = preload("niua_mcp_resource_sprite_frames_operations.gd")
const NiuaMcpResourceTileSetOperations = preload("niua_mcp_resource_tile_set_operations.gd")


static func open_resource_with_side_effects(editor: EditorInterface, body: Dictionary, open_scene: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpResourceGenericOperations.open_resource(editor, body, open_scene)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		if data.has("type"):
			NiuaMcpResourceOperationUtils.remember(remember, "Opened resource %s" % str(data.get("path", "")))
	return response


static func create_resource_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpResourceGenericOperations.create_resource(editor, body, refresh_filesystem)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpResourceOperationUtils.remember(remember, "Created resource %s" % str(data.get("path", "")))
	return response


static func save_resource_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpResourceGenericOperations.save_resource(editor, body, refresh_filesystem)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpResourceOperationUtils.remember(remember, "Saved resource %s" % str(data.get("path", "")))
	return response


static func create_shader_material_resource_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpResourceShaderMaterialOperations.create_shader_material_resource(editor, body, refresh_filesystem)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpResourceOperationUtils.remember(remember, "Created ShaderMaterial resource %s" % str(data.get("path", "")))
	return response


static func create_sprite_frames_resource_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpResourceSpriteFramesOperations.create_sprite_frames_resource(editor, body, refresh_filesystem)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpResourceOperationUtils.remember(remember, "Created SpriteFrames resource %s" % str(data.get("path", "")))
	return response


static func create_tile_set_resource_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpResourceTileSetOperations.create_tile_set_resource(editor, body, refresh_filesystem)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpResourceOperationUtils.remember(remember, "Created TileSet resource %s" % str(data.get("path", "")))
	return response
