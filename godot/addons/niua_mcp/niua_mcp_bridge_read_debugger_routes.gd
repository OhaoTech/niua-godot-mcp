@tool
extends RefCounted

const NiuaMcpDebuggerRuntimeOperations = preload("niua_mcp_debugger_runtime_operations.gd")

const HANDLERS := {
	"_debugger_state": true,
	"_runtime_state": true,
	"_runtime_events": true,
	"_runtime_node_properties": true,
	"_runtime_node_property_set_result": true,
	"_runtime_node_method_call_result": true,
	"_runtime_input_send_result": true,
	"_runtime_screenshot_result": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _debugger_state() -> Dictionary:
	return NiuaMcpDebuggerRuntimeOperations.debugger_state(_context.debugger_probe(), _context.editor)


func _runtime_state(query: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerRuntimeOperations.runtime_state(_context.debugger_probe(), query)


func _runtime_events(query: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerRuntimeOperations.runtime_events(_context.debugger_probe(), query)


func _runtime_node_properties(query: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerRuntimeOperations.runtime_node_properties(_context.debugger_probe(), query)


func _runtime_node_property_set_result(query: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerRuntimeOperations.runtime_node_property_set_result(_context.debugger_probe(), query)


func _runtime_node_method_call_result(query: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerRuntimeOperations.runtime_node_method_call_result(_context.debugger_probe(), query)


func _runtime_input_send_result(query: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerRuntimeOperations.runtime_input_send_result(_context.debugger_probe(), query)


func _runtime_screenshot_result(query: Dictionary) -> Dictionary:
	return NiuaMcpDebuggerRuntimeOperations.runtime_screenshot_result(_context.debugger_probe(), query)
