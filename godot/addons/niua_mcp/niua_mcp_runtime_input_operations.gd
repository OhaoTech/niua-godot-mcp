@tool
extends RefCounted


static func send_runtime_input(debugger_probe, body: Dictionary) -> Dictionary:
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

	var actions_value = body.get("actions", [])
	var actions: Array = actions_value if typeof(actions_value) == TYPE_ARRAY else []
	var hold_ms = body.get("holdMs", null)
	var mouse_motion = body.get("mouseMotion", null)

	var request_id: String = debugger_probe.next_runtime_request_id("send_input")
	var requested_sessions: Array = debugger_probe.send_runtime_input_request(
		actions,
		hold_ms,
		mouse_motion,
		request_id
	)
	var responses: Array = debugger_probe.runtime_input_send_result(request_id)
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


static func runtime_input_send_result(debugger_probe, query: Dictionary) -> Dictionary:
	var request_id := str(query.get("requestId", ""))
	if request_id.is_empty():
		return _error("runtime input send requestId is required")

	var responses := []
	if debugger_probe != null:
		responses = debugger_probe.runtime_input_send_result(request_id)

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
