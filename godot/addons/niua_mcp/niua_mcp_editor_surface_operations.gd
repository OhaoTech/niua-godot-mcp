@tool
extends RefCounted

const NiuaMcpEditorSurfaceScreenshotOperations = preload("niua_mcp_editor_surface_screenshot_operations.gd")
const NiuaMcpEditorSurfaceMainScreenOperations = preload("niua_mcp_editor_surface_main_screen_operations.gd")


static func capture_editor_screenshot(editor: EditorInterface) -> Dictionary:
	return NiuaMcpEditorSurfaceScreenshotOperations.capture_editor_screenshot(editor)


static func main_screen_state(editor: EditorInterface) -> Dictionary:
	return NiuaMcpEditorSurfaceMainScreenOperations.main_screen_state(editor)


static func set_main_screen_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpEditorSurfaceMainScreenOperations.set_main_screen_with_side_effects(editor, body, remember)


static func set_main_screen(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpEditorSurfaceMainScreenOperations.set_main_screen(editor, body)
