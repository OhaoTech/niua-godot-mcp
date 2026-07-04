@tool
extends RefCounted

const NiuaMcpDebuggerProbeRuntimeDataUtils = preload("niua_mcp_debugger_probe_runtime_data_utils.gd")

var _runtime_node_method_calls_by_request := {}


func store_runtime_node_method_call(data: Array, session_id: int, record_event: Callable) -> void:
	var entry := NiuaMcpDebuggerProbeRuntimeDataUtils.runtime_payload(data)
	entry["sessionId"] = session_id
	entry["timeMsec"] = Time.get_ticks_msec()

	var request_id := str(entry.get("requestId", ""))
	if not request_id.is_empty():
		_runtime_node_method_calls_by_request[request_id] = entry

	NiuaMcpDebuggerProbeRuntimeDataUtils.record_event(record_event, "runtime_node_method_call", {
		"sessionId": session_id,
		"nodePath": str(entry.get("nodePath", "")),
		"method": str(entry.get("method", "")),
		"requestId": request_id,
		"called": bool(entry.get("called", false))
	})


func runtime_node_method_call_result(request_id: String) -> Array:
	var responses := []
	if not request_id.is_empty() and _runtime_node_method_calls_by_request.has(request_id):
		responses.append(_runtime_node_method_calls_by_request[request_id])
	return responses
