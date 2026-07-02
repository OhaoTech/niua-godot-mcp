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


static func object_has_property(object: Object, property_name: String) -> bool:
	for property in object.get_property_list():
		if str(property.get("name", "")) == property_name:
			return true
	return false


static func property_type(object: Object, property_name: String) -> int:
	for property in object.get_property_list():
		if str(property.get("name", "")) == property_name:
			return int(property.get("type", TYPE_NIL))
	return TYPE_NIL
