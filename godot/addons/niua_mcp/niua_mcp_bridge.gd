@tool
extends Node

const DEFAULT_HOST := "127.0.0.1"
const DEFAULT_PORT := 9174

const NiuaMcpDebuggerProbeHost = preload("niua_mcp_debugger_probe_host.gd")
const NiuaMcpBridgeContext = preload("niua_mcp_bridge_context.gd")
const NiuaMcpBridgeMemory = preload("niua_mcp_bridge_memory.gd")
const NiuaMcpBridgeReadRoutes = preload("niua_mcp_bridge_read_routes.gd")
const NiuaMcpBridgeRouter = preload("niua_mcp_bridge_router.gd")
const NiuaMcpBridgeServer = preload("niua_mcp_bridge_server.gd")
const NiuaMcpBridgeWriteRoutes = preload("niua_mcp_bridge_write_routes.gd")
const NiuaMcpImportEventTracker = preload("niua_mcp_import_event_tracker.gd")
const READ_ENDPOINTS := NiuaMcpBridgeRouter.READ_ENDPOINTS
const WRITE_ENDPOINTS := NiuaMcpBridgeRouter.WRITE_ENDPOINTS

var _server = NiuaMcpBridgeServer.new()
var _plugin: EditorPlugin
var _editor: EditorInterface
var _debugger_probe_host = NiuaMcpDebuggerProbeHost.new()
var _port := DEFAULT_PORT
var _memory = NiuaMcpBridgeMemory.new()
var _read_routes = NiuaMcpBridgeReadRoutes.new()
var _write_routes = NiuaMcpBridgeWriteRoutes.new()
var _import_event_tracker = NiuaMcpImportEventTracker.new()


func start(plugin: EditorPlugin, port: int = DEFAULT_PORT, token: String = "") -> void:
	_plugin = plugin
	_editor = plugin.get_editor_interface()
	_port = port
	_read_routes.configure(_editor, _server, _memory, _debugger_probe_host, _import_event_tracker, DEFAULT_HOST, _port, READ_ENDPOINTS, WRITE_ENDPOINTS)
	_write_routes.configure(_editor, _debugger_probe_host, _memory)

	var error := _server.start(DEFAULT_HOST, _port, token)
	if error != OK:
		_remember("NIUA MCP bridge failed to listen on %s:%d: %s" % [DEFAULT_HOST, _port, error])
		set_process(false)
		return

	_remember("NIUA MCP bridge listening on %s:%d" % [DEFAULT_HOST, _port])
	if not token.strip_edges().is_empty():
		_remember("NIUA MCP bridge auth token configured")
	_debugger_probe_host.register(_plugin, Callable(self, "_remember"))
	_import_event_tracker.start(_editor_resource_filesystem())
	set_process(true)


func stop() -> void:
	set_process(false)
	if _server.is_running():
		_remember("NIUA MCP bridge stopped")
	_import_event_tracker.stop()
	_debugger_probe_host.unregister(_plugin, Callable(self, "_remember"))
	_server.stop()


func _process(_delta: float) -> void:
	if not _server.is_running():
		return

	_server.process_clients(Callable(self, "_route"))


func _route(request: Dictionary) -> Dictionary:
	return NiuaMcpBridgeRouter.route(self, request)


func route_target_for(handler: String) -> Object:
	if _read_routes.handles(handler):
		return _read_routes.route_target_for(handler)
	if _write_routes.handles(handler):
		return _write_routes.route_target_for(handler)
	return self


func _editor_resource_filesystem():
	return NiuaMcpBridgeContext.editor_resource_filesystem(_editor)


func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}


func _remember(message: String) -> void:
	_memory.remember(message)
