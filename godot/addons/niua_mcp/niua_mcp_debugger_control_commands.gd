@tool
extends RefCounted

const NiuaMcpDebuggerControlState = preload("niua_mcp_debugger_control_state.gd")
const NiuaMcpDebuggerControlUtils = preload("niua_mcp_debugger_control_utils.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")


static func set_debugger_breakpoint(debugger_probe, editor: EditorInterface, body: Dictionary) -> Dictionary:
	if debugger_probe == null:
		return NiuaMcpDebuggerControlUtils.error("debugger probe is unavailable")

	var validation := NiuaMcpPathUtils.validate_script_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	if not FileAccess.file_exists(path) and not ResourceLoader.exists(path):
		return NiuaMcpDebuggerControlUtils.error("script not found: %s" % path, "not_found")

	var line := int(body.get("line", -1))
	if line < 0:
		return NiuaMcpDebuggerControlUtils.error("breakpoint line must be zero or greater")

	var enabled := bool(body.get("enabled", true))
	var applied_sessions: Array = debugger_probe.set_breakpoint_for_sessions(path, line, enabled)

	var state := NiuaMcpDebuggerControlState.debugger_state(debugger_probe, editor)
	var data: Dictionary = state.get("data", {})
	data["requestedBreakpoint"] = {
		"path": path,
		"line": line,
		"enabled": enabled,
		"appliedSessions": applied_sessions
	}
	return {
		"ok": true,
		"data": data
	}


static func toggle_debugger_profiler(debugger_probe, editor: EditorInterface, body: Dictionary) -> Dictionary:
	if debugger_probe == null:
		return NiuaMcpDebuggerControlUtils.error("debugger probe is unavailable")

	var profiler := str(body.get("profiler", "")).strip_edges()
	if profiler.is_empty():
		return NiuaMcpDebuggerControlUtils.error("debugger profiler name is required", "invalid_request")

	var enabled := bool(body.get("enabled", true))
	var data: Array = NiuaMcpDebuggerControlUtils.data_array(body.get("data", []))
	var applied_sessions: Array = debugger_probe.toggle_profiler_for_sessions(profiler, enabled, data)

	var state := NiuaMcpDebuggerControlState.debugger_state(debugger_probe, editor)
	var response_data: Dictionary = state.get("data", {})
	response_data["requestedProfiler"] = {
		"profiler": profiler,
		"enabled": enabled,
		"data": data,
		"appliedSessions": applied_sessions
	}
	return {
		"ok": true,
		"data": response_data
	}


static func send_debugger_message(debugger_probe, editor: EditorInterface, body: Dictionary) -> Dictionary:
	if debugger_probe == null:
		return NiuaMcpDebuggerControlUtils.error("debugger probe is unavailable")

	var message := str(body.get("message", "")).strip_edges()
	if message.is_empty():
		return NiuaMcpDebuggerControlUtils.error("debugger message name is required", "invalid_request")

	var data: Array = NiuaMcpDebuggerControlUtils.data_array(body.get("data", []))
	var active_only := bool(body.get("activeOnly", true))
	var requested_sessions: Array = debugger_probe.send_message_for_sessions(message, data, active_only)

	var state := NiuaMcpDebuggerControlState.debugger_state(debugger_probe, editor)
	var response_data: Dictionary = state.get("data", {})
	response_data["requestedMessage"] = {
		"message": message,
		"data": data,
		"activeOnly": active_only,
		"requestedSessions": requested_sessions
	}
	return {
		"ok": true,
		"data": response_data
	}
