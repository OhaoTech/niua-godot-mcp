@tool
extends RefCounted


static func data_array(raw_data) -> Array:
	var data: Array = []
	if typeof(raw_data) == TYPE_ARRAY:
		data = raw_data.duplicate(true)
	else:
		data = [raw_data]
	return data


static func remember(remember: Callable, message: String) -> void:
	if remember.is_valid():
		remember.call(message)


static func error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
