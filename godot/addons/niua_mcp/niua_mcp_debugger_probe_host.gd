@tool
extends RefCounted

const NiuaMcpDebuggerProbe = preload("niua_mcp_debugger_probe.gd")

var _probe = null


func register(plugin: EditorPlugin, remember: Callable) -> void:
	if plugin == null or not plugin.has_method("add_debugger_plugin"):
		return
	if _probe != null:
		return

	_probe = NiuaMcpDebuggerProbe.new()
	plugin.add_debugger_plugin(_probe)
	_remember(remember, "Registered debugger state probe")


func unregister(plugin: EditorPlugin, remember: Callable) -> void:
	if plugin != null and _probe != null and plugin.has_method("remove_debugger_plugin"):
		plugin.remove_debugger_plugin(_probe)
		_remember(remember, "Unregistered debugger state probe")
	_probe = null


func probe():
	return _probe


func _remember(remember: Callable, message: String) -> void:
	if remember.is_valid():
		remember.call(message)
