@tool
extends RefCounted

const NiuaMcpDebuggerControlCommands = preload("niua_mcp_debugger_control_commands.gd")
const NiuaMcpDebuggerControlSideEffects = preload("niua_mcp_debugger_control_side_effects.gd")
const NiuaMcpDebuggerControlState = preload("niua_mcp_debugger_control_state.gd")
const NiuaMcpDebuggerControlUtils = preload("niua_mcp_debugger_control_utils.gd")


static func set_debugger_breakpoint_with_side_effects(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpDebuggerControlSideEffects.set_debugger_breakpoint_with_side_effects(debugger_probe, editor, body, remember)


static func toggle_debugger_profiler_with_side_effects(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpDebuggerControlSideEffects.toggle_debugger_profiler_with_side_effects(debugger_probe, editor, body, remember)


static func send_debugger_message_with_side_effects(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpDebuggerControlSideEffects.send_debugger_message_with_side_effects(debugger_probe, editor, body, remember)


static func debugger_state(debugger_probe, editor: EditorInterface) -> Dictionary:
	return NiuaMcpDebuggerControlState.debugger_state(debugger_probe, editor)


static func set_debugger_breakpoint(debugger_probe, editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerControlCommands.set_debugger_breakpoint(debugger_probe, editor, body)


static func toggle_debugger_profiler(debugger_probe, editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerControlCommands.toggle_debugger_profiler(debugger_probe, editor, body)


static func send_debugger_message(debugger_probe, editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerControlCommands.send_debugger_message(debugger_probe, editor, body)


static func debugger_breakpoint_summary(raw_breakpoint: String) -> Dictionary:
	return NiuaMcpDebuggerControlState.debugger_breakpoint_summary(raw_breakpoint)
