@tool
extends RefCounted

const NiuaMcpSceneGraphOperations = preload("niua_mcp_scene_graph_operations.gd")

const HANDLERS := {
	"_create_scene": true,
	"_save_current_scene": true,
	"_save_scene_as": true
}

var _context


func configure(context, _document_routes = null) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _create_scene(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneGraphOperations.create_scene_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "refresh_filesystem"),
		Callable(_context, "remember")
	)


func _save_current_scene(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneGraphOperations.save_current_scene_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _save_scene_as(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneGraphOperations.save_scene_as_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "refresh_filesystem"),
		Callable(_context, "remember")
	)
