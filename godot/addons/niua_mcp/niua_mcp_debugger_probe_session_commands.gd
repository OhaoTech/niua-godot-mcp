@tool
extends RefCounted


static func set_breakpoint_for_sessions(debugger_probe: EditorDebuggerPlugin, session_ids: Array[int], path: String, line: int, enabled: bool, record_event: Callable) -> Array:
	var applied_sessions := []
	for session_id in session_ids:
		var session := debugger_probe.get_session(session_id)
		if session == null:
			continue

		session.set_breakpoint(path, line, enabled)
		applied_sessions.append(session_id)

	_record(record_event, "breakpoint_requested", {
		"path": path,
		"line": line,
		"enabled": enabled,
		"appliedSessions": applied_sessions
	})
	return applied_sessions


static func toggle_profiler_for_sessions(debugger_probe: EditorDebuggerPlugin, session_ids: Array[int], profiler: String, enabled: bool, data: Array, record_event: Callable) -> Array:
	var applied_sessions := []
	for session_id in session_ids:
		var session := debugger_probe.get_session(session_id)
		if session == null or not session.is_active():
			continue

		session.toggle_profiler(profiler, enabled, data)
		applied_sessions.append(session_id)

	_record(record_event, "profiler_toggled", {
		"profiler": profiler,
		"enabled": enabled,
		"data": data.duplicate(true),
		"appliedSessions": applied_sessions
	})
	return applied_sessions


static func send_message_for_sessions(debugger_probe: EditorDebuggerPlugin, session_ids: Array[int], message: String, data: Array, active_only: bool, record_event: Callable) -> Array:
	var requested_sessions := []
	for session_id in session_ids:
		var session := debugger_probe.get_session(session_id)
		if session == null:
			continue
		if active_only and not session.is_active():
			continue

		session.send_message(message, data)
		requested_sessions.append(session_id)

	_record(record_event, "debugger_message_sent", {
		"message": message,
		"data": data.duplicate(true),
		"activeOnly": active_only,
		"requestedSessions": requested_sessions
	})
	return requested_sessions


static func _record(record_event: Callable, kind: String, data: Dictionary) -> void:
	if record_event.is_valid():
		record_event.call(kind, data)
