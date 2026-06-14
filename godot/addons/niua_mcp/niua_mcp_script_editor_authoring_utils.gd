@tool
extends RefCounted


static func error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}


static func callback_dictionary_result(raw, callback_name: String) -> Dictionary:
	if typeof(raw) != TYPE_DICTIONARY:
		return error("%s callback did not return a dictionary" % callback_name)
	var result: Dictionary = raw
	return result
