@tool
extends RefCounted

const NiuaMcpNavigationOperations = preload("niua_mcp_navigation_operations.gd")

const HANDLERS := {
	"_create_navigation_region_3d": true,
	"_bake_navigation_mesh_3d": true,
	"_create_navigation_agent_3d": true,
	"_create_navigation_target_follow_script": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _create_navigation_region_3d(body: Dictionary) -> Dictionary:
	return NiuaMcpNavigationOperations.create_navigation_region_3d_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _bake_navigation_mesh_3d(body: Dictionary) -> Dictionary:
	return NiuaMcpNavigationOperations.bake_navigation_mesh_3d_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _create_navigation_agent_3d(body: Dictionary) -> Dictionary:
	return NiuaMcpNavigationOperations.create_navigation_agent_3d_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _create_navigation_target_follow_script(body: Dictionary) -> Dictionary:
	return NiuaMcpNavigationOperations.create_navigation_target_follow_script_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "refresh_filesystem"),
		Callable(_context, "remember")
	)
