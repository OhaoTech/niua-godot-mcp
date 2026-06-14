@tool
extends RefCounted

const NiuaMcpSceneGraphUtils = preload("niua_mcp_scene_graph_utils.gd")
const NiuaMcpUiControlOperations = preload("niua_mcp_ui_control_operations.gd")
const NiuaMcpUiLayoutOperations = preload("niua_mcp_ui_layout_operations.gd")
const NiuaMcpUiSignalOperations = preload("niua_mcp_ui_signal_operations.gd")
const NiuaMcpUiThemeOperations = preload("niua_mcp_ui_theme_operations.gd")


static func create_ui_control_with_side_effects(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpUiControlOperations.create_ui_control(editor, body, path_validator)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneGraphUtils.remember(remember, "Created UI control %s" % str(data.get("nodePath", "")))
	return response


static func set_control_layout_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpUiLayoutOperations.set_control_layout(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneGraphUtils.remember(remember, "Updated UI layout %s" % str(data.get("nodePath", "")))
	return response


static func create_ui_theme_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpUiThemeOperations.create_ui_theme(editor, body, refresh_filesystem)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneGraphUtils.remember(remember, "Created UI theme %s" % str(data.get("path", "")))
	return response


static func apply_ui_theme_override_with_side_effects(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpUiThemeOperations.apply_ui_theme_override(editor, body, path_validator)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneGraphUtils.remember(remember, "Applied UI theme override %s" % str(data.get("nodePath", "")))
	return response


static func connect_ui_signal_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpUiSignalOperations.connect_ui_signal(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneGraphUtils.remember(remember, "Connected UI signal %s.%s" % [str(data.get("sourcePath", "")), str(data.get("signalName", ""))])
	return response
