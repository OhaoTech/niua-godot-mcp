@tool
extends RefCounted

const NiuaMcpRunControlOperations = preload("niua_mcp_run_control_operations.gd")
const NiuaMcpRunSettingsOperations = preload("niua_mcp_run_settings_operations.gd")
const NiuaMcpRunUtils = preload("niua_mcp_run_utils.gd")


static func set_main_scene_with_side_effects(editor: EditorInterface, body: Dictionary, save_project_settings: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpRunSettingsOperations.set_main_scene(editor, body, save_project_settings)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpRunUtils.remember(remember, "Set main scene %s" % str(data.get("mainScene", "")))
	return response


static func run_main_scene_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpRunControlOperations.run_main_scene(editor, body)
	if bool(response.get("ok", false)):
		NiuaMcpRunUtils.remember(remember, "Requested run main scene")
	return response


static func run_current_scene_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpRunControlOperations.run_current_scene(editor, body)
	if bool(response.get("ok", false)):
		NiuaMcpRunUtils.remember(remember, "Requested run current scene")
	return response


static func run_custom_scene_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpRunControlOperations.run_custom_scene(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpRunUtils.remember(remember, "Requested run custom scene %s" % str(data.get("path", "")))
	return response


static func stop_running_scene_with_side_effects(editor: EditorInterface, remember: Callable) -> Dictionary:
	var response := NiuaMcpRunControlOperations.stop_running_scene(editor)
	if bool(response.get("ok", false)):
		NiuaMcpRunUtils.remember(remember, "Requested stop running scene")
	return response


static func reload_running_scene_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpRunControlOperations.reload_running_scene(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpRunUtils.remember(remember, "Requested reload running scene %s" % str(data.get("previousScene", "")))
	return response
