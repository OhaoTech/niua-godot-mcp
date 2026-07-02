@tool
extends RefCounted

const SNAPSHOT_MESSAGE := "niua_mcp:snapshot"
const NODE_PROPERTIES_MESSAGE := "niua_mcp:node_properties"
const SET_NODE_PROPERTY_MESSAGE := "niua_mcp:set_node_property"
const RUNTIME_SCREENSHOT_MESSAGE := "niua_mcp:runtime_screenshot"
const SEND_INPUT_MESSAGE := "niua_mcp:send_input"

var _runtime_request_counter := 0


func next_runtime_request_id(prefix: String) -> String:
	_runtime_request_counter += 1
	return "%s:%d:%d" % [prefix, Time.get_ticks_msec(), _runtime_request_counter]


func send_runtime_snapshot_request(debugger_probe: EditorDebuggerPlugin, session_ids: Array[int], record_event: Callable) -> Array:
	var requested_sessions := []
	for session_id in session_ids:
		var session := debugger_probe.get_session(session_id)
		if session == null or not session.is_active():
			continue

		session.send_message(SNAPSHOT_MESSAGE, [])
		requested_sessions.append(session_id)

	_record(record_event, "runtime_snapshot_requested", {
		"requestedSessions": requested_sessions
	})
	return requested_sessions


func send_runtime_node_properties_request(debugger_probe: EditorDebuggerPlugin, session_ids: Array[int], node_path: String, request_id: String, record_event: Callable) -> Array:
	var requested_sessions := []
	for session_id in session_ids:
		var session := debugger_probe.get_session(session_id)
		if session == null or not session.is_active():
			continue

		session.send_message(NODE_PROPERTIES_MESSAGE, [{
			"requestId": request_id,
			"nodePath": node_path
		}])
		requested_sessions.append(session_id)

	_record(record_event, "runtime_node_properties_requested", {
		"nodePath": node_path,
		"requestId": request_id,
		"requestedSessions": requested_sessions
	})
	return requested_sessions


func send_runtime_node_property_set_request(debugger_probe: EditorDebuggerPlugin, session_ids: Array[int], node_path: String, property_name: String, value, request_id: String, record_event: Callable) -> Array:
	var requested_sessions := []
	for session_id in session_ids:
		var session := debugger_probe.get_session(session_id)
		if session == null or not session.is_active():
			continue

		session.send_message(SET_NODE_PROPERTY_MESSAGE, [{
			"requestId": request_id,
			"nodePath": node_path,
			"property": property_name,
			"value": value
		}])
		requested_sessions.append(session_id)

	_record(record_event, "runtime_node_property_set_requested", {
		"nodePath": node_path,
		"property": property_name,
		"requestId": request_id,
		"requestedSessions": requested_sessions
	})
	return requested_sessions


func send_runtime_input_request(debugger_probe: EditorDebuggerPlugin, session_ids: Array[int], actions: Array, hold_ms, mouse_motion, request_id: String, record_event: Callable) -> Array:
	var requested_sessions := []
	for session_id in session_ids:
		var session := debugger_probe.get_session(session_id)
		if session == null or not session.is_active():
			continue

		session.send_message(SEND_INPUT_MESSAGE, [{
			"requestId": request_id,
			"actions": actions,
			"holdMs": hold_ms,
			"mouseMotion": mouse_motion
		}])
		requested_sessions.append(session_id)

	_record(record_event, "runtime_input_send_requested", {
		"requestId": request_id,
		"actionCount": actions.size(),
		"requestedSessions": requested_sessions
	})
	return requested_sessions


func send_runtime_screenshot_request(debugger_probe: EditorDebuggerPlugin, session_ids: Array[int], request_id: String, record_event: Callable) -> Array:
	var requested_sessions := []
	for session_id in session_ids:
		var session := debugger_probe.get_session(session_id)
		if session == null or not session.is_active():
			continue

		session.send_message(RUNTIME_SCREENSHOT_MESSAGE, [{
			"requestId": request_id
		}])
		requested_sessions.append(session_id)

	_record(record_event, "runtime_screenshot_requested", {
		"requestId": request_id,
		"requestedSessions": requested_sessions
	})
	return requested_sessions


func _record(record_event: Callable, kind: String, data: Dictionary) -> void:
	if record_event.is_valid():
		record_event.call(kind, data)
