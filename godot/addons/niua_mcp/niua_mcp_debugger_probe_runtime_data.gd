@tool
extends RefCounted

const NiuaMcpDebuggerProbeRuntimeCore = preload("niua_mcp_debugger_probe_runtime_core.gd")
const NiuaMcpDebuggerProbeRuntimeDataUtils = preload("niua_mcp_debugger_probe_runtime_data_utils.gd")
const NiuaMcpDebuggerProbeRuntimeNodeData = preload("niua_mcp_debugger_probe_runtime_node_data.gd")
const NiuaMcpDebuggerProbeRuntimeScreenshotData = preload("niua_mcp_debugger_probe_runtime_screenshot_data.gd")

var _core = NiuaMcpDebuggerProbeRuntimeCore.new()
var _node_data = NiuaMcpDebuggerProbeRuntimeNodeData.new()
var _screenshots = NiuaMcpDebuggerProbeRuntimeScreenshotData.new()


func runtime_session_data(session_id: int) -> Dictionary:
	return _core.runtime_session_data(session_id)


func store_runtime_message(kind: String, data: Array, session_id: int, record_event: Callable) -> void:
	_core.store_runtime_message(kind, data, session_id, record_event)


func store_runtime_log(data: Array, session_id: int, record_event: Callable) -> void:
	_core.store_runtime_log(data, session_id, record_event)


func store_runtime_node_properties(data: Array, session_id: int, record_event: Callable) -> void:
	_node_data.store_runtime_node_properties(data, session_id, record_event)


func store_runtime_node_property_set(data: Array, session_id: int, record_event: Callable) -> void:
	_node_data.store_runtime_node_property_set(data, session_id, record_event)


func store_runtime_screenshot(data: Array, session_id: int, record_event: Callable) -> void:
	_screenshots.store_runtime_screenshot(data, session_id, record_event)


func runtime_node_properties(session_ids: Array[int], node_path: String, request_id: String = "") -> Array:
	return _node_data.runtime_node_properties(session_ids, node_path, request_id)


func runtime_node_property_set_result(request_id: String) -> Array:
	return _node_data.runtime_node_property_set_result(request_id)


func runtime_screenshot_result(request_id: String) -> Array:
	return _screenshots.runtime_screenshot_result(request_id)


func runtime_payload(data: Array) -> Dictionary:
	return NiuaMcpDebuggerProbeRuntimeDataUtils.runtime_payload(data)


func runtime_message_kind(message: String, capture_name: String) -> String:
	return NiuaMcpDebuggerProbeRuntimeDataUtils.runtime_message_kind(message, capture_name)


func runtime_node_key(session_id: int, node_path: String) -> String:
	return NiuaMcpDebuggerProbeRuntimeDataUtils.runtime_node_key(session_id, node_path)
