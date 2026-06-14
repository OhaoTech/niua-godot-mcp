@tool
extends RefCounted

const NiuaMcpResourceGenericOperations = preload("niua_mcp_resource_generic_operations.gd")
const NiuaMcpResourceShaderMaterialOperations = preload("niua_mcp_resource_shader_material_operations.gd")
const NiuaMcpResourceSpriteFramesOperations = preload("niua_mcp_resource_sprite_frames_operations.gd")
const NiuaMcpResourceTileSetOperations = preload("niua_mcp_resource_tile_set_operations.gd")
const NiuaMcpResourceSideEffects = preload("niua_mcp_resource_side_effects.gd")


static func open_resource_with_side_effects(editor: EditorInterface, body: Dictionary, open_scene: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpResourceSideEffects.open_resource_with_side_effects(editor, body, open_scene, remember)


static func create_resource_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpResourceSideEffects.create_resource_with_side_effects(editor, body, refresh_filesystem, remember)


static func save_resource_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpResourceSideEffects.save_resource_with_side_effects(editor, body, refresh_filesystem, remember)


static func create_shader_material_resource_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpResourceSideEffects.create_shader_material_resource_with_side_effects(editor, body, refresh_filesystem, remember)


static func create_sprite_frames_resource_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpResourceSideEffects.create_sprite_frames_resource_with_side_effects(editor, body, refresh_filesystem, remember)


static func create_tile_set_resource_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpResourceSideEffects.create_tile_set_resource_with_side_effects(editor, body, refresh_filesystem, remember)


static func open_resource(editor: EditorInterface, body: Dictionary, open_scene: Callable) -> Dictionary:
	return NiuaMcpResourceGenericOperations.open_resource(editor, body, open_scene)


static func create_resource(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	return NiuaMcpResourceGenericOperations.create_resource(editor, body, refresh_filesystem)


static func save_resource(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	return NiuaMcpResourceGenericOperations.save_resource(editor, body, refresh_filesystem)


static func create_shader_material_resource(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	return NiuaMcpResourceShaderMaterialOperations.create_shader_material_resource(editor, body, refresh_filesystem)


static func create_sprite_frames_resource(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	return NiuaMcpResourceSpriteFramesOperations.create_sprite_frames_resource(editor, body, refresh_filesystem)


static func create_tile_set_resource(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	return NiuaMcpResourceTileSetOperations.create_tile_set_resource(editor, body, refresh_filesystem)
