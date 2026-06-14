@tool
extends RefCounted

var _session_ids: Array[int] = []
var _connected_session_ids := {}


func setup_session(debugger_probe: EditorDebuggerPlugin, session_id: int, record_event: Callable, started: Callable, stopped: Callable, breaked: Callable, continued: Callable) -> void:
	remember_session_id(session_id)

	var session := debugger_probe.get_session(session_id)
	if session != null and not _connected_session_ids.has(session_id):
		session.started.connect(started.bind(session_id))
		session.stopped.connect(stopped.bind(session_id))
		session.breaked.connect(breaked.bind(session_id))
		session.continued.connect(continued.bind(session_id))
		_connected_session_ids[session_id] = true

	_record(record_event, "session_setup", {
		"sessionId": session_id
	})


func ids() -> Array[int]:
	var copied: Array[int] = []
	for session_id in _session_ids:
		copied.append(session_id)
	return copied


func remember_session_id(session_id: int) -> void:
	if not _session_ids.has(session_id):
		_session_ids.append(session_id)


func session_snapshots(debugger_probe: EditorDebuggerPlugin) -> Array:
	var snapshots := []
	for session_id in _session_ids:
		var session := debugger_probe.get_session(session_id)
		if session == null:
			continue

		snapshots.append({
			"id": session_id,
			"active": session.is_active(),
			"debuggable": session.is_debuggable(),
			"breaked": session.is_breaked()
		})
	return snapshots


func runtime_session_snapshots(debugger_probe: EditorDebuggerPlugin, store) -> Array:
	var snapshots := []
	for session_id in _session_ids:
		var session := debugger_probe.get_session(session_id)
		var runtime_data: Dictionary = store.runtime_session_data(session_id)
		var session_data := {
			"id": session_id,
			"active": false,
			"debuggable": false,
			"breaked": false,
			"hasRuntimeState": bool(runtime_data.get("hasRuntimeState", false)),
			"lastRuntimeMessage": runtime_data.get("lastRuntimeMessage", null),
			"runtimeState": runtime_data.get("runtimeState", null)
		}

		if session != null:
			session_data["active"] = session.is_active()
			session_data["debuggable"] = session.is_debuggable()
			session_data["breaked"] = session.is_breaked()

		snapshots.append(session_data)
	return snapshots


func _record(record_event: Callable, kind: String, data: Dictionary) -> void:
	if record_event.is_valid():
		record_event.call(kind, data)
