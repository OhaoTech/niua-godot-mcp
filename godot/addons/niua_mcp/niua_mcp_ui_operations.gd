@tool
extends RefCounted

const NiuaMcpUiControlOperations = preload("niua_mcp_ui_control_operations.gd")
const NiuaMcpUiLayoutOperations = preload("niua_mcp_ui_layout_operations.gd")
const NiuaMcpUiSignalOperations = preload("niua_mcp_ui_signal_operations.gd")
const NiuaMcpUiSideEffects = preload("niua_mcp_ui_side_effects.gd")
const NiuaMcpUiThemeOperations = preload("niua_mcp_ui_theme_operations.gd")


static func create_ui_control_with_side_effects(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpUiSideEffects.create_ui_control_with_side_effects(editor, body, path_validator, remember)


static func set_control_layout_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpUiSideEffects.set_control_layout_with_side_effects(editor, body, remember)


static func create_ui_theme_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpUiSideEffects.create_ui_theme_with_side_effects(editor, body, refresh_filesystem, remember)


static func apply_ui_theme_override_with_side_effects(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpUiSideEffects.apply_ui_theme_override_with_side_effects(editor, body, path_validator, remember)


static func connect_ui_signal_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpUiSideEffects.connect_ui_signal_with_side_effects(editor, body, remember)


static func create_ui_control(editor: EditorInterface, body: Dictionary, path_validator: Callable) -> Dictionary:
	return NiuaMcpUiControlOperations.create_ui_control(editor, body, path_validator)


static func set_control_layout(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpUiLayoutOperations.set_control_layout(editor, body)


static func create_ui_theme(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	return NiuaMcpUiThemeOperations.create_ui_theme(editor, body, refresh_filesystem)


static func apply_ui_theme_override(editor: EditorInterface, body: Dictionary, path_validator: Callable) -> Dictionary:
	return NiuaMcpUiThemeOperations.apply_ui_theme_override(editor, body, path_validator)


static func connect_ui_signal(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpUiSignalOperations.connect_ui_signal(editor, body)
