@tool
extends RefCounted


static func batch_operation_message(operation: Dictionary) -> String:
	var raw_data = operation.get("data", {})
	if typeof(raw_data) != TYPE_DICTIONARY:
		return ""
	var data: Dictionary = raw_data
	match str(operation.get("kind", "")):
		"copy":
			return "Copied %s to %s" % [str(data.get("fromPath", "")), str(data.get("toPath", ""))]
		"move":
			return "Moved %s to %s" % [str(data.get("fromPath", "")), str(data.get("toPath", ""))]
		"delete":
			return "Deleted filesystem entry %s" % str(data.get("path", ""))
		_:
			return ""


static func _filesystem_batch_result(kind: String, response: Dictionary) -> Dictionary:
	if bool(response.get("ok", false)):
		return {
			"ok": true,
			"kind": kind,
			"data": response.get("data", {})
		}
	return _filesystem_batch_error(kind, str(response.get("error", "filesystem operation failed")), str(response.get("errorCode", "bad_request")), response.get("data", null))


static func _filesystem_batch_error(kind: String, message: String, code: String = "bad_request", data = null) -> Dictionary:
	return {
		"ok": false,
		"kind": kind,
		"error": message,
		"errorCode": code,
		"data": data
	}


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
