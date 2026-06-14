@tool
extends RefCounted

const NiuaMcpBridgeReadRouteCatalog = preload("niua_mcp_bridge_read_route_catalog.gd")
const NiuaMcpBridgeWriteRouteCatalog = preload("niua_mcp_bridge_write_route_catalog.gd")

const READ_ENDPOINTS := NiuaMcpBridgeReadRouteCatalog.ENDPOINTS
const WRITE_ENDPOINTS := NiuaMcpBridgeWriteRouteCatalog.ENDPOINTS
const READ_ROUTES := NiuaMcpBridgeReadRouteCatalog.ROUTES
const WRITE_ROUTES := NiuaMcpBridgeWriteRouteCatalog.ROUTES


static func route(target: Object, request: Dictionary) -> Dictionary:
	var path := str(request.get("path", "/health"))
	var method := str(request.get("method", "GET"))
	var body := _dictionary_arg(request.get("json", {}))
	var query := _dictionary_arg(request.get("query", {}))

	if READ_ROUTES.has(path):
		return _dispatch(target, READ_ROUTES[path], query, body)

	if WRITE_ROUTES.has(path):
		var route_def: Dictionary = WRITE_ROUTES[path]
		var required_method := str(route_def.get("method", "POST"))
		if not required_method.is_empty() and method != required_method:
			return _error(str(route_def.get("methodError", "%s requires %s" % [path, required_method])), "method_not_allowed")
		return _dispatch(target, route_def, query, body)

	return _error("unknown NIUA MCP bridge endpoint: %s" % path, "not_found")


static func _dispatch(target: Object, route_def: Dictionary, query: Dictionary, body: Dictionary) -> Dictionary:
	var handler := str(route_def.get("handler", ""))
	if handler.is_empty():
		return _error("route handler is missing")

	var args := []
	match str(route_def.get("arg", "")):
		"query":
			args.append(query)
		"body":
			args.append(body)
		"":
			pass
		_:
			return _error("unsupported route argument for %s" % handler)

	var route_target := _route_target(target, handler)
	var raw = route_target.callv(handler, args)
	if typeof(raw) != TYPE_DICTIONARY:
		return _error("route handler did not return a Dictionary: %s" % handler)
	return raw


static func _route_target(target: Object, handler: String) -> Object:
	if target.has_method("route_target_for"):
		var raw_target = target.call("route_target_for", handler)
		if raw_target is Object:
			return raw_target
	return target


static func _dictionary_arg(raw_value) -> Dictionary:
	if typeof(raw_value) == TYPE_DICTIONARY:
		return raw_value
	return {}


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
