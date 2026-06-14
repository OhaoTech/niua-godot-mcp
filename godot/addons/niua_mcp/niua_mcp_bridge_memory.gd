@tool
extends RefCounted

const MAX_LOG_LINES := 200

var _logs: Array[String] = []


func remember(message: String) -> void:
	_logs.append(message)
	while _logs.size() > MAX_LOG_LINES:
		_logs.pop_front()


func logs() -> Array:
	return _logs.duplicate()


func response() -> Dictionary:
	return {
		"ok": true,
		"data": {
			"logs": logs()
		}
	}
