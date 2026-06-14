@tool
extends RefCounted

const NiuaMcpDebuggerProbeRuntimeDataUtils = preload("niua_mcp_debugger_probe_runtime_data_utils.gd")

var _runtime_screenshots_by_request := {}


func store_runtime_screenshot(data: Array, session_id: int, record_event: Callable) -> void:
	var entry := NiuaMcpDebuggerProbeRuntimeDataUtils.runtime_payload(data)
	entry["sessionId"] = session_id
	entry["timeMsec"] = Time.get_ticks_msec()

	var request_id := str(entry.get("requestId", ""))
	if not request_id.is_empty():
		_runtime_screenshots_by_request[request_id] = entry

	NiuaMcpDebuggerProbeRuntimeDataUtils.record_event(record_event, "runtime_screenshot_result", {
		"sessionId": session_id,
		"requestId": request_id,
		"available": bool(entry.get("available", false)),
		"width": int(entry.get("width", 0)),
		"height": int(entry.get("height", 0))
	})


func runtime_screenshot_result(request_id: String) -> Array:
	var responses := []
	if not request_id.is_empty() and _runtime_screenshots_by_request.has(request_id):
		responses.append(_runtime_screenshots_by_request[request_id])
	return responses
