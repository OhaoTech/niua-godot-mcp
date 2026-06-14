@tool
extends RefCounted

const NiuaMcpFilesystemOperations = preload("niua_mcp_filesystem_operations.gd")
const NiuaMcpSceneGraphOperations = preload("niua_mcp_scene_graph_operations.gd")
const NiuaMcpScriptEditorOperations = preload("niua_mcp_script_editor_operations.gd")

const HANDLERS := {
	"_create_node_with_script": true
}

var _context
var _document_routes


func configure(context, document_routes = null) -> void:
	_context = context
	_document_routes = document_routes


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _create_node_with_script(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneGraphOperations.create_node_with_script_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "validate_res_path"),
		Callable(self, "_create_script"),
		Callable(self, "_attach_script"),
		Callable(_context, "remember")
	)


func _create_script(body: Dictionary) -> Dictionary:
	return NiuaMcpScriptEditorOperations.create_script_with_side_effects(
		body,
		Callable(self, "_write_text_file"),
		Callable(_context, "remember")
	)


func _attach_script(body: Dictionary) -> Dictionary:
	return NiuaMcpScriptEditorOperations.attach_script_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "resolve_node"),
		Callable(self, "_create_script"),
		Callable(_document_routes, "_save_current_scene"),
		Callable(_context, "edited_scene_root"),
		Callable(_context, "remember")
	)


func _write_text_file(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemOperations.write_text_file_with_side_effects(
		body,
		Callable(_context, "refresh_filesystem"),
		Callable(_context, "remember")
	)
