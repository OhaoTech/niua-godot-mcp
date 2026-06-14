@tool
extends RefCounted

const NiuaMcpDebuggerRuntimeOperations = preload("niua_mcp_debugger_runtime_operations.gd")

const HANDLERS := {
	"_set_debugger_breakpoint": true,
	"_toggle_debugger_profiler": true,
	"_send_debugger_message": true,
	"_set_runtime_node_property": true,
	"_capture_runtime_screenshot": true,
	"_install_runtime_probe": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _set_debugger_breakpoint(body: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerRuntimeOperations.set_debugger_breakpoint_with_side_effects(
		_context.debugger_probe(),
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _toggle_debugger_profiler(body: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerRuntimeOperations.toggle_debugger_profiler_with_side_effects(
		_context.debugger_probe(),
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _send_debugger_message(body: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerRuntimeOperations.send_debugger_message_with_side_effects(
		_context.debugger_probe(),
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _set_runtime_node_property(body: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerRuntimeOperations.set_runtime_node_property(_context.debugger_probe(), body)


func _capture_runtime_screenshot(_body: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerRuntimeOperations.capture_runtime_screenshot(_context.debugger_probe())


func _install_runtime_probe(body: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerRuntimeOperations.install_runtime_probe_with_side_effects(
		body,
		Callable(_context, "remember")
	)
