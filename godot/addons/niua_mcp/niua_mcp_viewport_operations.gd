@tool
extends RefCounted

const NiuaMcpViewportCameraOperations = preload("niua_mcp_viewport_camera_operations.gd")
const NiuaMcpViewportInputOperations = preload("niua_mcp_viewport_input_operations.gd")
const NiuaMcpViewportScreenshotOperations = preload("niua_mcp_viewport_screenshot_operations.gd")
const NiuaMcpViewportSideEffects = preload("niua_mcp_viewport_side_effects.gd")
const NiuaMcpViewportStateOperations = preload("niua_mcp_viewport_state_operations.gd")


static func viewport_state(editor: EditorInterface, query: Dictionary) -> Dictionary:
	return NiuaMcpViewportStateOperations.viewport_state(editor, query)


static func set_viewport_camera_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpViewportSideEffects.set_viewport_camera_with_side_effects(editor, body, remember)


static func send_viewport_input_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpViewportSideEffects.send_viewport_input_with_side_effects(editor, body, remember)


static func set_viewport_camera(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpViewportCameraOperations.set_viewport_camera(editor, body)


static func send_viewport_input(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpViewportInputOperations.send_viewport_input(editor, body)


static func capture_viewport_screenshot(editor: EditorInterface, query: Dictionary) -> Dictionary:
	return NiuaMcpViewportScreenshotOperations.capture_viewport_screenshot(editor, query)
