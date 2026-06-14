@tool
extends RefCounted


static func refresh(refresh_filesystem: Callable) -> void:
	if refresh_filesystem.is_valid():
		refresh_filesystem.call()


static func remember(remember: Callable, message: String) -> void:
	if remember.is_valid():
		remember.call(message)


static func error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
