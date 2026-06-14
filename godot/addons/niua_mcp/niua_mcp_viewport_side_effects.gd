@tool
extends RefCounted

const NiuaMcpViewportCameraOperations = preload("niua_mcp_viewport_camera_operations.gd")
const NiuaMcpViewportInputOperations = preload("niua_mcp_viewport_input_operations.gd")
const NiuaMcpViewportUtils = preload("niua_mcp_viewport_utils.gd")


static func set_viewport_camera_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpViewportCameraOperations.set_viewport_camera(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpViewportUtils.remember(remember, "Updated %s viewport camera index=%d" % [str(data.get("viewport", "")), int(data.get("index", 0))])
	return response


static func send_viewport_input_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpViewportInputOperations.send_viewport_input(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpViewportUtils.remember(remember, "Sent %d input event(s) to %s viewport index=%d" % [int(data.get("eventsSent", 0)), str(data.get("viewport", "")), int(data.get("index", 0))])
	return response
