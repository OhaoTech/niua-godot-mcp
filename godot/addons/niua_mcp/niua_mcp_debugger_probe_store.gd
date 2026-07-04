@tool
extends RefCounted

const NiuaMcpDebuggerProbeEventLog = preload("niua_mcp_debugger_probe_event_log.gd")
const NiuaMcpDebuggerProbeRuntimeData = preload("niua_mcp_debugger_probe_runtime_data.gd")

const MAX_EVENTS := NiuaMcpDebuggerProbeEventLog.MAX_EVENTS

var _events = NiuaMcpDebuggerProbeEventLog.new()
var _runtime = NiuaMcpDebuggerProbeRuntimeData.new()

var events: Array[Dictionary]:
	get:
		return _events.events


func record_event(kind: String, data: Dictionary) -> void:
	_events.record_event(kind, data)


func filtered_events(limit: int = MAX_EVENTS, kinds: Array = [], since_msec: int = -1) -> Dictionary:
	return _events.filtered_events(limit, kinds, since_msec)


func runtime_events() -> Array:
	return _events.runtime_events()


func runtime_session_data(session_id: int) -> Dictionary:
	return _runtime.runtime_session_data(session_id)


func store_runtime_message(kind: String, data: Array, session_id: int) -> void:
	_runtime.store_runtime_message(kind, data, session_id, Callable(self, "record_event"))


func store_runtime_log(data: Array, session_id: int) -> void:
	_runtime.store_runtime_log(data, session_id, Callable(self, "record_event"))


func store_runtime_node_properties(data: Array, session_id: int) -> void:
	_runtime.store_runtime_node_properties(data, session_id, Callable(self, "record_event"))


func store_runtime_node_property_set(data: Array, session_id: int) -> void:
	_runtime.store_runtime_node_property_set(data, session_id, Callable(self, "record_event"))


func store_runtime_screenshot(data: Array, session_id: int) -> void:
	_runtime.store_runtime_screenshot(data, session_id, Callable(self, "record_event"))


func store_runtime_node_method_call(data: Array, session_id: int) -> void:
	_runtime.store_runtime_node_method_call(data, session_id, Callable(self, "record_event"))


func store_runtime_input_result(data: Array, session_id: int) -> void:
	_runtime.store_runtime_input_result(data, session_id, Callable(self, "record_event"))


func runtime_node_properties(session_ids: Array[int], node_path: String, request_id: String = "") -> Array:
	return _runtime.runtime_node_properties(session_ids, node_path, request_id)


func runtime_node_property_set_result(request_id: String) -> Array:
	return _runtime.runtime_node_property_set_result(request_id)


func runtime_screenshot_result(request_id: String) -> Array:
	return _runtime.runtime_screenshot_result(request_id)


func runtime_node_method_call_result(request_id: String) -> Array:
	return _runtime.runtime_node_method_call_result(request_id)


func runtime_input_send_result(request_id: String) -> Array:
	return _runtime.runtime_input_send_result(request_id)


func runtime_payload(data: Array) -> Dictionary:
	return _runtime.runtime_payload(data)


func runtime_message_kind(message: String, capture_name: String) -> String:
	return _runtime.runtime_message_kind(message, capture_name)


func runtime_node_key(session_id: int, node_path: String) -> String:
	return _runtime.runtime_node_key(session_id, node_path)
