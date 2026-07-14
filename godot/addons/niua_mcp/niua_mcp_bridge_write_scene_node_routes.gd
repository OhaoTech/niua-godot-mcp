@tool
extends RefCounted

const NiuaMcpSceneGraphOperations = preload("niua_mcp_scene_graph_operations.gd")

const HANDLERS := {
	"_create_node": true,
	"_instance_scene": true,
	"_rename_node": true,
	"_delete_node": true,
	"_duplicate_node": true,
	"_reparent_node": true,
	"_reorder_node": true,
	"_inspector_properties": true,
	"_set_node_property": true,
	"_assign_material": true
}

var _context


func configure(context, _document_routes = null) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _create_node(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneGraphOperations.create_node_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "validate_res_path"),
		Callable(_context, "remember")
	)


func _instance_scene(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneGraphOperations.instance_scene_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "validate_res_path"),
		Callable(_context, "remember")
	)


func _rename_node(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneGraphOperations.rename_node_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _delete_node(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneGraphOperations.delete_node_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _duplicate_node(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneGraphOperations.duplicate_node_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _reparent_node(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneGraphOperations.reparent_node_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _reorder_node(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneGraphOperations.reorder_node_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _inspector_properties(query: Dictionary) -> Dictionary:
	return NiuaMcpSceneGraphOperations.inspector_properties(_context.editor, query)


func _set_node_property(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneGraphOperations.set_node_property_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "validate_res_path"),
		Callable(_context, "remember")
	)


func _assign_material(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneGraphOperations.assign_material_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)
