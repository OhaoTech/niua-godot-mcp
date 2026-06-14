@tool
extends RefCounted

const NiuaMcpBridgeHttp = preload("niua_mcp_bridge_http.gd")
const AUTH_HEADER := "x-niua-mcp-token"

var _server := TCPServer.new()
var _running := false
var _token := ""


func start(host: String, port: int, token: String = "") -> int:
	_token = token.strip_edges()
	var error := _server.listen(port, host)
	_running = error == OK
	return error


func stop() -> void:
	_server.stop()
	_running = false


func is_running() -> bool:
	return _running


func process_clients(route_request: Callable) -> void:
	if not _running:
		return

	while _server.is_connection_available():
		var peer := _server.take_connection()
		_handle_client(peer, route_request)


func _handle_client(peer: StreamPeerTCP, route_request: Callable) -> void:
	var read_result := NiuaMcpBridgeHttp.read_request(peer)
	var raw_payload
	if not bool(read_result.get("ok", false)):
		raw_payload = read_result
	else:
		var request := NiuaMcpBridgeHttp.parse_request(str(read_result.get("raw", "")))
		if not _authorized(request):
			raw_payload = _error(
				"missing or invalid X-NIUA-MCP-Token header; launch the editor with open_project or set matching NIUA_MCP_TOKEN/GODOT_MCP_TOKEN values before retrying",
				"unauthorized"
			)
		else:
			raw_payload = route_request.call(request) if route_request.is_valid() else _error("route callback is unavailable")
	var payload := _dictionary_payload(raw_payload)
	var status_code := NiuaMcpBridgeHttp.status_code(payload)

	NiuaMcpBridgeHttp.write_json(peer, status_code, payload)
	peer.disconnect_from_host()


func _dictionary_payload(raw_payload) -> Dictionary:
	if typeof(raw_payload) == TYPE_DICTIONARY:
		return raw_payload
	return _error("route callback did not return a Dictionary")


func _authorized(request: Dictionary) -> bool:
	if _token.is_empty():
		return true
	var headers = request.get("headers", {})
	if typeof(headers) != TYPE_DICTIONARY:
		return false
	return str(headers.get(AUTH_HEADER, "")) == _token


func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
