@tool
extends RefCounted

const NiuaMcpPayloadLimits = preload("niua_mcp_payload_limits.gd")
const DEFAULT_READ_TIMEOUT_MSEC := 1000


static func read_request(peer: StreamPeerTCP, max_body_bytes: int = NiuaMcpPayloadLimits.DEFAULT_MAX_BYTES, timeout_msec: int = DEFAULT_READ_TIMEOUT_MSEC) -> Dictionary:
	var request := ""
	var deadline := Time.get_ticks_msec() + timeout_msec

	while Time.get_ticks_msec() < deadline:
		peer.poll()
		var available := peer.get_available_bytes()
		if available > 0:
			request += peer.get_utf8_string(available)
			var header_end := request.find("\r\n\r\n")
			if header_end != -1:
				var headers := request.substr(0, header_end)
				var length := content_length(headers)
				if length > max_body_bytes:
					return _error(
						"request body exceeds NIUA MCP payload limit: %d bytes > %d bytes. Reduce the request size or raise NIUA_MCP_MAX_PAYLOAD_BYTES." % [length, max_body_bytes],
						"payload_too_large"
					)
				if request.length() >= header_end + 4 + length:
					break
		OS.delay_msec(2)

	return { "ok": true, "raw": request }


static func parse_request(request: String) -> Dictionary:
	var first_line := request.split("\r\n", false, 1)[0] if request.length() > 0 else ""
	var parts := first_line.split(" ", false)
	var method := parts[0] if parts.size() >= 1 else "GET"
	var target := parts[1] if parts.size() >= 2 else "/health"
	var path := target
	var query := {}
	var query_index := target.find("?")

	if query_index != -1:
		path = target.substr(0, query_index)
		query = parse_query(target.substr(query_index + 1))

	var header_end := request.find("\r\n\r\n")
	var headers_text := request.substr(0, header_end) if header_end != -1 else ""
	var body := request.substr(header_end + 4) if header_end != -1 else ""

	return {
		"method": method,
		"path": path,
		"query": query,
		"headers": parse_headers(headers_text),
		"contentLength": content_length(headers_text),
		"body": body,
		"json": parse_json_body(body)
	}


static func parse_headers(headers: String) -> Dictionary:
	var parsed := {}
	for line in headers.split("\r\n", false):
		var colon := line.find(":")
		if colon <= 0:
			continue
		var key := line.substr(0, colon).strip_edges().to_lower()
		var value := line.substr(colon + 1).strip_edges()
		parsed[key] = value
	return parsed


static func content_length(headers: String) -> int:
	for line in headers.split("\r\n", false):
		if line.to_lower().begins_with("content-length:"):
			return int(line.substr(line.find(":") + 1).strip_edges())
	return 0


static func parse_query(raw_query: String) -> Dictionary:
	var query := {}
	for pair in raw_query.split("&", false):
		var parts := pair.split("=", true, 1)
		var key := parts[0].uri_decode()
		var value := parts[1].uri_decode() if parts.size() > 1 else ""
		query[key] = value
	return query


static func parse_json_body(body: String) -> Dictionary:
	if body.strip_edges().is_empty():
		return {}

	var parsed = JSON.parse_string(body)
	if typeof(parsed) == TYPE_DICTIONARY:
		return parsed

	return {}


static func status_code(payload: Dictionary) -> int:
	if payload.get("ok", false):
		return 200

	match str(payload.get("errorCode", "bad_request")):
		"unauthorized":
			return 401
		"payload_too_large":
			return 413
		"not_found":
			return 404
		"method_not_allowed":
			return 405
		_:
			return 400


static func write_json(peer: StreamPeerTCP, status_code: int, payload: Dictionary) -> void:
	var reason := "OK"
	if status_code == 400:
		reason = "Bad Request"
	elif status_code == 401:
		reason = "Unauthorized"
	elif status_code == 404:
		reason = "Not Found"
	elif status_code == 405:
		reason = "Method Not Allowed"
	elif status_code == 413:
		reason = "Request Entity Too Large"

	var body := JSON.stringify(payload)
	var headers := "HTTP/1.1 %d %s\r\n" % [status_code, reason]
	headers += "Content-Type: application/json\r\n"
	headers += "Access-Control-Allow-Origin: *\r\n"
	headers += "Connection: close\r\n"
	headers += "Content-Length: %d\r\n\r\n" % body.to_utf8_buffer().size()
	peer.put_data((headers + body).to_utf8_buffer())


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
