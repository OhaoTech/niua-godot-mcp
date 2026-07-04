@tool
extends RefCounted


static func refresh(refresh_filesystem: Callable) -> void:
	if refresh_filesystem.is_valid():
		refresh_filesystem.call()


static func refresh_path(refresh_filesystem: Callable, path: String) -> void:
	# Targeted refresh: update_file for the single written path (the same idiom
	# as write_text_file) instead of a full filesystem rescan.
	if not refresh_filesystem.is_valid():
		return
	if path.is_empty():
		refresh_filesystem.call()
	else:
		refresh_filesystem.call(path)


static func remember(remember: Callable, message: String) -> void:
	if remember.is_valid():
		remember.call(message)


static func error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
