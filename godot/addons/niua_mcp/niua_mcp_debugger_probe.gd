@tool
extends EditorDebuggerPlugin

const NiuaMcpDebuggerProbeCapture = preload("niua_mcp_debugger_probe_capture.gd")
const NiuaMcpDebuggerProbeEvents = preload("niua_mcp_debugger_probe_events.gd")
const NiuaMcpDebuggerProbeSessionCommands = preload("niua_mcp_debugger_probe_session_commands.gd")
const NiuaMcpDebuggerProbeSessions = preload("niua_mcp_debugger_probe_sessions.gd")
const NiuaMcpDebuggerProbeState = preload("niua_mcp_debugger_probe_state.gd")
const NiuaMcpDebuggerProbeRuntimeRequests = preload("niua_mcp_debugger_probe_runtime_requests.gd")
const NiuaMcpDebuggerProbeStore = preload("niua_mcp_debugger_probe_store.gd")

const MAX_EVENTS := NiuaMcpDebuggerProbeStore.MAX_EVENTS

var _store = NiuaMcpDebuggerProbeStore.new()
var _sessions = NiuaMcpDebuggerProbeSessions.new()
var _runtime_requests = NiuaMcpDebuggerProbeRuntimeRequests.new()


func _setup_session(session_id: int) -> void:
	_sessions.setup_session(self, session_id, Callable(self, "_record_event"), Callable(self, "_on_session_started"), Callable(self, "_on_session_stopped"), Callable(self, "_on_session_breaked"), Callable(self, "_on_session_continued"))


func _breakpoints_cleared_in_tree() -> void:
	NiuaMcpDebuggerProbeEvents.breakpoints_cleared(Callable(self, "_record_event"))


func _breakpoint_set_in_tree(script: Script, line: int, enabled: bool) -> void:
	NiuaMcpDebuggerProbeEvents.breakpoint_set(script, line, enabled, Callable(self, "_record_event"))


func _has_capture(capture: String) -> bool:
	return NiuaMcpDebuggerProbeCapture.has_capture(capture)


func _capture(message: String, data: Array, session_id: int) -> bool:
	return NiuaMcpDebuggerProbeCapture.capture(_store, _sessions, message, data, session_id)


func state() -> Dictionary:
	return NiuaMcpDebuggerProbeState.state(self, _sessions, _store)


func runtime_state() -> Dictionary:
	return NiuaMcpDebuggerProbeState.runtime_state(self, _sessions, _store)


func filtered_events(limit: int = MAX_EVENTS, kinds: Array = [], since_msec: int = -1) -> Dictionary:
	return NiuaMcpDebuggerProbeState.filtered_events(_store, limit, kinds, since_msec)


func set_breakpoint_for_sessions(path: String, line: int, enabled: bool) -> Array:
	return NiuaMcpDebuggerProbeSessionCommands.set_breakpoint_for_sessions(self, _sessions.ids(), path, line, enabled, Callable(self, "_record_event"))


func toggle_profiler_for_sessions(profiler: String, enabled: bool, data: Array) -> Array:
	return NiuaMcpDebuggerProbeSessionCommands.toggle_profiler_for_sessions(self, _sessions.ids(), profiler, enabled, data, Callable(self, "_record_event"))


func send_message_for_sessions(message: String, data: Array, active_only: bool = true) -> Array:
	return NiuaMcpDebuggerProbeSessionCommands.send_message_for_sessions(self, _sessions.ids(), message, data, active_only, Callable(self, "_record_event"))


func send_runtime_snapshot_request() -> Array:
	return _runtime_requests.send_runtime_snapshot_request(self, _sessions.ids(), Callable(self, "_record_event"))


func next_runtime_request_id(prefix: String) -> String:
	return _runtime_requests.next_runtime_request_id(prefix)


func send_runtime_node_properties_request(node_path: String, request_id: String) -> Array:
	return _runtime_requests.send_runtime_node_properties_request(self, _sessions.ids(), node_path, request_id, Callable(self, "_record_event"))


func runtime_node_properties(node_path: String, request_id: String = "") -> Array:
	return NiuaMcpDebuggerProbeState.runtime_node_properties(_store, _sessions, node_path, request_id)


func send_runtime_node_property_set_request(node_path: String, property_name: String, value, request_id: String) -> Array:
	return _runtime_requests.send_runtime_node_property_set_request(self, _sessions.ids(), node_path, property_name, value, request_id, Callable(self, "_record_event"))


func runtime_node_property_set_result(request_id: String) -> Array:
	return NiuaMcpDebuggerProbeState.runtime_node_property_set_result(_store, request_id)


func send_runtime_screenshot_request(request_id: String) -> Array:
	return _runtime_requests.send_runtime_screenshot_request(self, _sessions.ids(), request_id, Callable(self, "_record_event"))


func runtime_screenshot_result(request_id: String) -> Array:
	return NiuaMcpDebuggerProbeState.runtime_screenshot_result(_store, request_id)


func send_runtime_input_request(actions: Array, hold_ms, mouse_motion, request_id: String) -> Array:
	return _runtime_requests.send_runtime_input_request(self, _sessions.ids(), actions, hold_ms, mouse_motion, request_id, Callable(self, "_record_event"))


func runtime_input_send_result(request_id: String) -> Array:
	return NiuaMcpDebuggerProbeState.runtime_input_send_result(_store, request_id)


func _on_session_started(session_id: int) -> void:
	NiuaMcpDebuggerProbeEvents.session_started(session_id, Callable(self, "_record_event"))


func _on_session_stopped(session_id: int) -> void:
	NiuaMcpDebuggerProbeEvents.session_stopped(session_id, Callable(self, "_record_event"))


func _on_session_breaked(can_debug: bool, session_id: int) -> void:
	NiuaMcpDebuggerProbeEvents.session_breaked(can_debug, session_id, Callable(self, "_record_event"))


func _on_session_continued(session_id: int) -> void:
	NiuaMcpDebuggerProbeEvents.session_continued(session_id, Callable(self, "_record_event"))


func _record_event(kind: String, data: Dictionary) -> void:
	NiuaMcpDebuggerProbeEvents.record_event(_store, kind, data)
