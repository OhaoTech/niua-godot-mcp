@tool
extends RefCounted

const NiuaMcpDebuggerControlCommands = preload("niua_mcp_debugger_control_commands.gd")
const NiuaMcpDebuggerControlUtils = preload("niua_mcp_debugger_control_utils.gd")


static func set_debugger_breakpoint_with_side_effects(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpDebuggerControlCommands.set_debugger_breakpoint(debugger_probe, editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		var breakpoint_data: Dictionary = data.get("requestedBreakpoint", {})
		NiuaMcpDebuggerControlUtils.remember(remember, "Set debugger breakpoint %s:%d enabled=%s" % [
			str(breakpoint_data.get("path", "")),
			int(breakpoint_data.get("line", -1)),
			bool(breakpoint_data.get("enabled", false))
		])
	return response


static func toggle_debugger_profiler_with_side_effects(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpDebuggerControlCommands.toggle_debugger_profiler(debugger_probe, editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		var profiler: Dictionary = data.get("requestedProfiler", {})
		var applied_sessions: Array = profiler.get("appliedSessions", [])
		NiuaMcpDebuggerControlUtils.remember(remember, "Toggled debugger profiler %s enabled=%s sessions=%d" % [
			str(profiler.get("profiler", "")),
			bool(profiler.get("enabled", false)),
			applied_sessions.size()
		])
	return response


static func send_debugger_message_with_side_effects(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpDebuggerControlCommands.send_debugger_message(debugger_probe, editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		var message: Dictionary = data.get("requestedMessage", {})
		var requested_sessions: Array = message.get("requestedSessions", [])
		NiuaMcpDebuggerControlUtils.remember(remember, "Sent debugger message %s sessions=%d" % [
			str(message.get("message", "")),
			requested_sessions.size()
		])
	return response
