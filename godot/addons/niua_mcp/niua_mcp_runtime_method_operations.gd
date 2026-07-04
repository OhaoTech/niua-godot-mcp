@tool
extends RefCounted


static func call_runtime_node_method(debugger_probe, body: Dictionary) -> Dictionary:
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

	var method_name := str(body.get("method", ""))
	if method_name.is_empty():
		return _error("runtime node method name is required")

	var args_value = body.get("args", [])
	if args_value == null:
		args_value = []
	if typeof(args_value) != TYPE_ARRAY:
		return _error("runtime node method args must be an array")

	var request_id: String = debugger_probe.next_runtime_request_id("call_node_method")
	var requested_sessions: Array = debugger_probe.send_runtime_node_method_call_request(
		node_path,
		method_name,
		args_value,
		request_id
	)
	var responses: Array = debugger_probe.runtime_node_method_call_result(request_id)
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


static func runtime_node_method_call_result(debugger_probe, query: Dictionary) -> Dictionary:
	var request_id := str(query.get("requestId", ""))
	if request_id.is_empty():
		return _error("runtime node method call requestId is required")

	var responses := []
	if debugger_probe != null:
		responses = debugger_probe.runtime_node_method_call_result(request_id)

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
