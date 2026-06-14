@tool
extends RefCounted

const NiuaMcpBridgeContext = preload("niua_mcp_bridge_context.gd")

var editor: EditorInterface
var server
var memory
var debugger_probe_host
var import_event_tracker
var host := "127.0.0.1"
var port := 9174
var read_endpoints := []
var write_endpoints := []


func configure(editor: EditorInterface, server, memory, debugger_probe_host, import_event_tracker, host: String, port: int, read_endpoints: Array, write_endpoints: Array) -> void:
	self.editor = editor
	self.server = server
	self.memory = memory
	self.debugger_probe_host = debugger_probe_host
	self.import_event_tracker = import_event_tracker
	self.host = host
	self.port = port
	self.read_endpoints = read_endpoints.duplicate()
	self.write_endpoints = write_endpoints.duplicate()


func is_running() -> bool:
	return server != null and server.is_running()


func edited_scene_root() -> Node:
	return NiuaMcpBridgeContext.edited_scene_root(editor)


func current_scene_path() -> String:
	return NiuaMcpBridgeContext.current_scene_path(editor)


func open_scenes() -> Array:
	return NiuaMcpBridgeContext.open_scenes(editor)


func selection_data() -> Array:
	return NiuaMcpBridgeContext.selection_data(editor)


func logs() -> Array:
	if memory == null:
		return []
	return memory.logs()


func memory_response() -> Dictionary:
	if memory == null:
		return {
			"ok": true,
			"data": {
				"logs": []
			}
		}
	return memory.response()


func debugger_probe():
	if debugger_probe_host == null:
		return null
	return debugger_probe_host.probe()
