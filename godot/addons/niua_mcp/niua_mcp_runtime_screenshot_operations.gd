@tool
extends RefCounted


static func capture_runtime_screenshot(debugger_probe) -> Dictionary:
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

	var request_id: String = debugger_probe.next_runtime_request_id("runtime_screenshot")
	var requested_sessions: Array = debugger_probe.send_runtime_screenshot_request(request_id)
	var responses: Array = debugger_probe.runtime_screenshot_result(request_id)
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


static func runtime_screenshot_result(debugger_probe, query: Dictionary) -> Dictionary:
	var request_id := str(query.get("requestId", ""))
	if request_id.is_empty():
		return _error("runtime screenshot requestId is required")

	var responses := []
	if debugger_probe != null:
		responses = debugger_probe.runtime_screenshot_result(request_id)

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
