@tool
extends RefCounted


static func remember(remember: Callable, message: String) -> void:
	if remember.is_valid():
		remember.call(message)


static func error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}


static func screenshot_unavailable(viewport_kind: String, index: int, reason: String) -> Dictionary:
	return {
		"ok": true,
		"data": {
			"viewport": viewport_kind,
			"index": index,
			"available": false,
			"reason": reason
		}
	}
