@tool
extends RefCounted

const NiuaMcpDebuggerProbeRuntimeDataUtils = preload("niua_mcp_debugger_probe_runtime_data_utils.gd")

var _runtime_node_properties_by_request := {}
var _runtime_node_properties_by_path := {}
var _runtime_node_property_sets_by_request := {}


func store_runtime_node_properties(data: Array, session_id: int, record_event: Callable) -> void:
	var entry := NiuaMcpDebuggerProbeRuntimeDataUtils.runtime_payload(data)
	entry["sessionId"] = session_id
	entry["timeMsec"] = Time.get_ticks_msec()

	var request_id := str(entry.get("requestId", ""))
	var node_path := str(entry.get("nodePath", ""))
	if not request_id.is_empty():
		_runtime_node_properties_by_request[request_id] = entry
	if not node_path.is_empty():
		_runtime_node_properties_by_path[NiuaMcpDebuggerProbeRuntimeDataUtils.runtime_node_key(session_id, node_path)] = entry

	NiuaMcpDebuggerProbeRuntimeDataUtils.record_event(record_event, "runtime_node_properties", {
		"sessionId": session_id,
		"nodePath": node_path,
		"requestId": request_id,
		"exists": bool(entry.get("exists", false))
	})


func store_runtime_node_property_set(data: Array, session_id: int, record_event: Callable) -> void:
	var entry := NiuaMcpDebuggerProbeRuntimeDataUtils.runtime_payload(data)
	entry["sessionId"] = session_id
	entry["timeMsec"] = Time.get_ticks_msec()

	var request_id := str(entry.get("requestId", ""))
	if not request_id.is_empty():
		_runtime_node_property_sets_by_request[request_id] = entry

	NiuaMcpDebuggerProbeRuntimeDataUtils.record_event(record_event, "runtime_node_property_set", {
		"sessionId": session_id,
		"nodePath": str(entry.get("nodePath", "")),
		"property": str(entry.get("property", "")),
		"requestId": request_id,
		"set": bool(entry.get("set", false))
	})


func runtime_node_properties(session_ids: Array[int], node_path: String, request_id: String = "") -> Array:
	var responses := []
	if not request_id.is_empty():
		if _runtime_node_properties_by_request.has(request_id):
			responses.append(_runtime_node_properties_by_request[request_id])
		return responses

	for session_id in session_ids:
		var key := NiuaMcpDebuggerProbeRuntimeDataUtils.runtime_node_key(session_id, node_path)
		if _runtime_node_properties_by_path.has(key):
			responses.append(_runtime_node_properties_by_path[key])

	return responses


func runtime_node_property_set_result(request_id: String) -> Array:
	var responses := []
	if not request_id.is_empty() and _runtime_node_property_sets_by_request.has(request_id):
		responses.append(_runtime_node_property_sets_by_request[request_id])
	return responses
