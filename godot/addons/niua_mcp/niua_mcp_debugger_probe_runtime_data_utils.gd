@tool
extends RefCounted


static func runtime_payload(data: Array) -> Dictionary:
	if data.size() > 0 and typeof(data[0]) == TYPE_DICTIONARY:
		return data[0].duplicate(true)

	return {
		"items": data.duplicate(true)
	}


static func runtime_message_kind(message: String, capture_name: String) -> String:
	var prefix := "%s:" % capture_name
	if message.begins_with(prefix):
		return message.trim_prefix(prefix)
	return message


static func runtime_node_key(session_id: int, node_path: String) -> String:
	return "%d:%s" % [session_id, node_path]


static func record_event(record_event: Callable, kind: String, data: Dictionary) -> void:
	if record_event.is_valid():
		record_event.call(kind, data)
