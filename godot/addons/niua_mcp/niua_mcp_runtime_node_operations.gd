@tool
extends RefCounted


static func runtime_node_properties(debugger_probe, query: Dictionary) -> Dictionary:
	var node_path := str(query.get("nodePath", "/root"))
	if node_path.is_empty():
		return _error("runtime node path is required")

	var refresh := str(query.get("refresh", "true")).to_lower() != "false"
	var request_id := str(query.get("requestId", ""))
	var requested_sessions := []
	var responses := []

	if debugger_probe != null:
		if refresh:
			if request_id.is_empty():
				request_id = debugger_probe.next_runtime_request_id("node_properties")
			requested_sessions = debugger_probe.send_runtime_node_properties_request(node_path, request_id)

		responses = debugger_probe.runtime_node_properties(node_path, request_id)

	return {
		"ok": true,
		"data": {
			"available": debugger_probe != null,
			"nodePath": node_path,
			"requestId": request_id,
			"pending": debugger_probe != null and not request_id.is_empty() and responses.size() == 0,
			"requestedSessions": requested_sessions,
			"responses": responses
		}
	}


static func set_runtime_node_property(debugger_probe, body: Dictionary) -> Dictionary:
	if debugger_probe == null:
		return {
			"ok": true,
			"data": {
				"available": false,
				"requestId": "",
				"pending": false,
				"requestedSessions": [],
				"responses": []
			}
		}

	var node_path := str(body.get("nodePath", ""))
	if node_path.is_empty():
		return _error("runtime node path is required")

	var property_name := str(body.get("property", ""))
	if property_name.is_empty():
		return _error("runtime node property name is required")

	var request_id: String = debugger_probe.next_runtime_request_id("set_node_property")
	var requested_sessions: Array = debugger_probe.send_runtime_node_property_set_request(
		node_path,
		property_name,
		body.get("value"),
		request_id
	)
	var responses: Array = debugger_probe.runtime_node_property_set_result(request_id)
	return {
		"ok": true,
		"data": {
			"available": true,
			"requestId": request_id,
			"pending": responses.size() == 0,
			"requestedSessions": requested_sessions,
			"responses": responses
		}
	}


static func runtime_node_property_set_result(debugger_probe, query: Dictionary) -> Dictionary:
	var request_id := str(query.get("requestId", ""))
	if request_id.is_empty():
		return _error("runtime node property set requestId is required")

	var responses := []
	if debugger_probe != null:
		responses = debugger_probe.runtime_node_property_set_result(request_id)

	return {
		"ok": true,
		"data": {
			"available": debugger_probe != null,
			"requestId": request_id,
			"pending": debugger_probe != null and responses.size() == 0,
			"responses": responses
		}
	}


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
