@tool
extends RefCounted

const NiuaMcpExportOperations = preload("niua_mcp_export_operations.gd")
const NiuaMcpResourceOperations = preload("niua_mcp_resource_operations.gd")
const NiuaMcpSceneTabOperations = preload("niua_mcp_scene_tab_operations.gd")

const HANDLERS := {
	"_open_resource": true,
	"_create_resource": true,
	"_save_resource": true,
	"_create_shader_material_resource": true,
	"_create_sprite_frames_resource": true,
	"_create_tile_set_resource": true,
	"_upsert_export_preset": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _open_resource(body: Dictionary) -> Dictionary:
	return NiuaMcpResourceOperations.open_resource_with_side_effects(_context.editor, body, Callable(self, "_open_scene"), Callable(_context, "remember"))


func _create_resource(body: Dictionary) -> Dictionary:
	return NiuaMcpResourceOperations.create_resource_with_side_effects(_context.editor, body, Callable(_context, "refresh_filesystem"), Callable(_context, "remember"))


func _save_resource(body: Dictionary) -> Dictionary:
	return NiuaMcpResourceOperations.save_resource_with_side_effects(_context.editor, body, Callable(_context, "refresh_filesystem"), Callable(_context, "remember"))


func _create_shader_material_resource(body: Dictionary) -> Dictionary:
	return NiuaMcpResourceOperations.create_shader_material_resource_with_side_effects(_context.editor, body, Callable(_context, "refresh_filesystem"), Callable(_context, "remember"))


func _create_sprite_frames_resource(body: Dictionary) -> Dictionary:
	return NiuaMcpResourceOperations.create_sprite_frames_resource_with_side_effects(_context.editor, body, Callable(_context, "refresh_filesystem"), Callable(_context, "remember"))


func _create_tile_set_resource(body: Dictionary) -> Dictionary:
	return NiuaMcpResourceOperations.create_tile_set_resource_with_side_effects(_context.editor, body, Callable(_context, "refresh_filesystem"), Callable(_context, "remember"))


func _upsert_export_preset(body: Dictionary) -> Dictionary:
	return NiuaMcpExportOperations.upsert_export_preset(body)


func _open_scene(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneTabOperations.open_scene_with_side_effects(_context.editor, body, Callable(_context, "remember"))
