@tool
extends RefCounted


static func debugger_state(debugger_probe, editor: EditorInterface) -> Dictionary:
	var probe_state := {
		"sessions": [],
		"events": []
	}
	if debugger_probe != null:
		probe_state = debugger_probe.state()

	var sessions: Array = probe_state.get("sessions", [])
	var events: Array = probe_state.get("events", [])
	return {
		"ok": true,
		"data": {
			"available": debugger_probe != null,
			"sessionCount": sessions.size(),
			"sessions": sessions,
			"breakpoints": _debugger_breakpoints(editor),
			"events": events,
			"monitors": _debugger_monitors()
		}
	}


static func debugger_breakpoint_summary(raw_breakpoint: String) -> Dictionary:
	return _debugger_breakpoint_summary(raw_breakpoint)


static func _debugger_breakpoints(editor: EditorInterface) -> Array:
	var breakpoints := []
	if editor == null or not editor.has_method("get_script_editor"):
		return breakpoints

	var script_editor = editor.get_script_editor()
	if script_editor == null or not script_editor.has_method("get_breakpoints"):
		return breakpoints

	for raw_breakpoint in script_editor.get_breakpoints():
		breakpoints.append(_debugger_breakpoint_summary(str(raw_breakpoint)))

	return breakpoints


static func _debugger_breakpoint_summary(raw_breakpoint: String) -> Dictionary:
	var path := raw_breakpoint
	var line := -1
	var separator := raw_breakpoint.rfind(":")
	if separator > -1:
		var suffix := raw_breakpoint.substr(separator + 1)
		if suffix.is_valid_int():
			path = raw_breakpoint.substr(0, separator)
			line = int(suffix)

	return {
		"path": path,
		"line": line,
		"raw": raw_breakpoint
	}


static func _debugger_monitors() -> Dictionary:
	return {
		"timeFps": Performance.get_monitor(Performance.TIME_FPS),
		"timeProcess": Performance.get_monitor(Performance.TIME_PROCESS),
		"timePhysicsProcess": Performance.get_monitor(Performance.TIME_PHYSICS_PROCESS),
		"memoryStatic": Performance.get_monitor(Performance.MEMORY_STATIC),
		"objectCount": Performance.get_monitor(Performance.OBJECT_COUNT),
		"objectNodeCount": Performance.get_monitor(Performance.OBJECT_NODE_COUNT),
		"objectOrphanNodeCount": Performance.get_monitor(Performance.OBJECT_ORPHAN_NODE_COUNT),
		"renderDrawCalls": Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME),
		"renderVideoMemUsed": Performance.get_monitor(Performance.RENDER_VIDEO_MEM_USED),
		"monitorModificationTime": Performance.get_monitor_modification_time()
	}
