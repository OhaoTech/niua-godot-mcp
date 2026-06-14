@tool
extends RefCounted


static func breakpoints_cleared(record_event: Callable) -> void:
	record_event.call("breakpoints_cleared", {})


static func breakpoint_set(script: Script, line: int, enabled: bool, record_event: Callable) -> void:
	record_event.call("breakpoint_set", {
		"path": script.resource_path if script != null else "",
		"line": line,
		"enabled": enabled
	})


static func session_started(session_id: int, record_event: Callable) -> void:
	record_event.call("session_started", {
		"sessionId": session_id
	})


static func session_stopped(session_id: int, record_event: Callable) -> void:
	record_event.call("session_stopped", {
		"sessionId": session_id
	})


static func session_breaked(can_debug: bool, session_id: int, record_event: Callable) -> void:
	record_event.call("session_breaked", {
		"sessionId": session_id,
		"canDebug": can_debug
	})


static func session_continued(session_id: int, record_event: Callable) -> void:
	record_event.call("session_continued", {
		"sessionId": session_id
	})


static func record_event(store, kind: String, data: Dictionary) -> void:
	store.record_event(kind, data)
