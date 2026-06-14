@tool
extends RefCounted

const NiuaMcpDebuggerControlOperations = preload("niua_mcp_debugger_control_operations.gd")
const NiuaMcpRuntimeStateOperations = preload("niua_mcp_runtime_state_operations.gd")
const NiuaMcpRuntimeNodeOperations = preload("niua_mcp_runtime_node_operations.gd")
const NiuaMcpRuntimeScreenshotOperations = preload("niua_mcp_runtime_screenshot_operations.gd")
const NiuaMcpRuntimeProbeInstaller = preload("niua_mcp_runtime_probe_installer.gd")


static func set_debugger_breakpoint_with_side_effects(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpDebuggerControlOperations.set_debugger_breakpoint_with_side_effects(debugger_probe, editor, body, remember)


static func toggle_debugger_profiler_with_side_effects(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpDebuggerControlOperations.toggle_debugger_profiler_with_side_effects(debugger_probe, editor, body, remember)


static func send_debugger_message_with_side_effects(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpDebuggerControlOperations.send_debugger_message_with_side_effects(debugger_probe, editor, body, remember)


static func install_runtime_probe_with_side_effects(body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpRuntimeProbeInstaller.install_runtime_probe_with_side_effects(body, remember)


static func debugger_state(debugger_probe, editor: EditorInterface) -> Dictionary:
	return NiuaMcpDebuggerControlOperations.debugger_state(debugger_probe, editor)


static func set_debugger_breakpoint(debugger_probe, editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerControlOperations.set_debugger_breakpoint(debugger_probe, editor, body)


static func toggle_debugger_profiler(debugger_probe, editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerControlOperations.toggle_debugger_profiler(debugger_probe, editor, body)


static func send_debugger_message(debugger_probe, editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerControlOperations.send_debugger_message(debugger_probe, editor, body)


static func runtime_state(debugger_probe) -> Dictionary:
	return NiuaMcpRuntimeStateOperations.runtime_state(debugger_probe)


static func runtime_events(debugger_probe, query: Dictionary) -> Dictionary:
	return NiuaMcpRuntimeStateOperations.runtime_events(debugger_probe, query)


static func runtime_node_properties(debugger_probe, query: Dictionary) -> Dictionary:
	return NiuaMcpRuntimeNodeOperations.runtime_node_properties(debugger_probe, query)


static func set_runtime_node_property(debugger_probe, body: Dictionary) -> Dictionary:
	return NiuaMcpRuntimeNodeOperations.set_runtime_node_property(debugger_probe, body)


static func runtime_node_property_set_result(debugger_probe, query: Dictionary) -> Dictionary:
	return NiuaMcpRuntimeNodeOperations.runtime_node_property_set_result(debugger_probe, query)


static func capture_runtime_screenshot(debugger_probe) -> Dictionary:
	return NiuaMcpRuntimeScreenshotOperations.capture_runtime_screenshot(debugger_probe)


static func runtime_screenshot_result(debugger_probe, query: Dictionary) -> Dictionary:
	return NiuaMcpRuntimeScreenshotOperations.runtime_screenshot_result(debugger_probe, query)


static func install_runtime_probe(body: Dictionary) -> Dictionary:
	return NiuaMcpRuntimeProbeInstaller.install_runtime_probe(body)


static func debugger_breakpoint_summary(raw_breakpoint: String) -> Dictionary:
	return NiuaMcpDebuggerControlOperations.debugger_breakpoint_summary(raw_breakpoint)
