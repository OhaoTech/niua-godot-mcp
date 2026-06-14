@tool
extends RefCounted

const NiuaMcpFilesystemOperations = preload("niua_mcp_filesystem_operations.gd")
const NiuaMcpSceneGraphOperations = preload("niua_mcp_scene_graph_operations.gd")
const NiuaMcpScriptEditorOperations = preload("niua_mcp_script_editor_operations.gd")
const NiuaMcpScriptFileOperations = preload("niua_mcp_script_file_operations.gd")

const HANDLERS := {
	"_write_script": true,
	"_replace_in_scripts": true,
	"_create_script": true,
	"_attach_script": true,
	"_open_script": true,
	"_goto_script_line": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _write_script(body: Dictionary) -> Dictionary:
	return NiuaMcpScriptFileOperations.write_script_with_side_effects(body, Callable(_context, "refresh_filesystem"), Callable(_context, "remember"))


func _replace_in_scripts(body: Dictionary) -> Dictionary:
	return NiuaMcpScriptFileOperations.replace_in_scripts_with_side_effects(body, Callable(_context, "refresh_filesystem"), Callable(_context, "remember"))


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
		Callable(self, "_save_current_scene"),
		Callable(_context, "edited_scene_root"),
		Callable(_context, "remember")
	)


func _open_script(body: Dictionary) -> Dictionary:
	return NiuaMcpScriptEditorOperations.open_script_with_side_effects(_context.editor, body, Callable(_context, "remember"))


func _goto_script_line(body: Dictionary) -> Dictionary:
	return NiuaMcpScriptEditorOperations.goto_script_line_with_side_effects(_context.editor, body, Callable(_context, "remember"))


func _write_text_file(body: Dictionary) -> Dictionary:
	return NiuaMcpFilesystemOperations.write_text_file_with_side_effects(body, Callable(_context, "refresh_filesystem"), Callable(_context, "remember"))


func _save_current_scene(body: Dictionary) -> Dictionary:
	return NiuaMcpSceneGraphOperations.save_current_scene_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)
