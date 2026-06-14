@tool
extends RefCounted

const NiuaMcpRunControlOperations = preload("niua_mcp_run_control_operations.gd")
const NiuaMcpRunSettingsOperations = preload("niua_mcp_run_settings_operations.gd")
const NiuaMcpRunSideEffects = preload("niua_mcp_run_side_effects.gd")


static func run_settings(editor: EditorInterface) -> Dictionary:
	return NiuaMcpRunSettingsOperations.run_settings(editor)


static func set_main_scene_with_side_effects(editor: EditorInterface, body: Dictionary, save_project_settings: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpRunSideEffects.set_main_scene_with_side_effects(editor, body, save_project_settings, remember)


static func set_main_scene(editor: EditorInterface, body: Dictionary, save_project_settings: Callable) -> Dictionary:
	return NiuaMcpRunSettingsOperations.set_main_scene(editor, body, save_project_settings)


static func run_status(editor: EditorInterface) -> Dictionary:
	return NiuaMcpRunSettingsOperations.run_status(editor)


static func run_main_scene_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpRunSideEffects.run_main_scene_with_side_effects(editor, body, remember)


static func run_main_scene(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpRunControlOperations.run_main_scene(editor, body)


static func run_current_scene_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpRunSideEffects.run_current_scene_with_side_effects(editor, body, remember)


static func run_current_scene(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpRunControlOperations.run_current_scene(editor, body)


static func run_custom_scene_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpRunSideEffects.run_custom_scene_with_side_effects(editor, body, remember)


static func run_custom_scene(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpRunControlOperations.run_custom_scene(editor, body)


static func stop_running_scene_with_side_effects(editor: EditorInterface, remember: Callable) -> Dictionary:
	return NiuaMcpRunSideEffects.stop_running_scene_with_side_effects(editor, remember)


static func stop_running_scene(editor: EditorInterface) -> Dictionary:
	return NiuaMcpRunControlOperations.stop_running_scene(editor)


static func reload_running_scene_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpRunSideEffects.reload_running_scene_with_side_effects(editor, body, remember)


static func reload_running_scene(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpRunControlOperations.reload_running_scene(editor, body)
