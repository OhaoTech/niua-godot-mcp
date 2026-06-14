@tool
extends RefCounted

const NiuaMcpRunOperations = preload("niua_mcp_run_operations.gd")

const HANDLERS := {
	"_set_main_scene": true,
	"_run_main_scene": true,
	"_run_current_scene": true,
	"_run_custom_scene": true,
	"_stop_running_scene": true,
	"_reload_running_scene": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _set_main_scene(body: Dictionary) -> Dictionary:
	return NiuaMcpRunOperations.set_main_scene_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "save_project_settings_if_requested"),
		Callable(_context, "remember")
	)


func _run_main_scene(body: Dictionary) -> Dictionary:
	return NiuaMcpRunOperations.run_main_scene_with_side_effects(_context.editor, body, Callable(_context, "remember"))


func _run_current_scene(body: Dictionary) -> Dictionary:
	return NiuaMcpRunOperations.run_current_scene_with_side_effects(_context.editor, body, Callable(_context, "remember"))


func _run_custom_scene(body: Dictionary) -> Dictionary:
	return NiuaMcpRunOperations.run_custom_scene_with_side_effects(_context.editor, body, Callable(_context, "remember"))


func _stop_running_scene() -> Dictionary:
	return NiuaMcpRunOperations.stop_running_scene_with_side_effects(_context.editor, Callable(_context, "remember"))


func _reload_running_scene(body: Dictionary) -> Dictionary:
	return NiuaMcpRunOperations.reload_running_scene_with_side_effects(_context.editor, body, Callable(_context, "remember"))
