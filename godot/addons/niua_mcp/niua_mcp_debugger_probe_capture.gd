@tool
extends RefCounted

const CAPTURE_NAME := "niua_mcp"


static func has_capture(capture: String) -> bool:
	return capture == CAPTURE_NAME


static func capture(store, sessions, message: String, data: Array, session_id: int) -> bool:
	var kind: String = store.runtime_message_kind(message, CAPTURE_NAME)
	match kind:
		"runtime_ready", "runtime_state":
			sessions.remember_session_id(session_id)
			store.store_runtime_message(kind, data, session_id)
			return true
		"runtime_log":
			sessions.remember_session_id(session_id)
			store.store_runtime_log(data, session_id)
			return true
		"node_properties":
			sessions.remember_session_id(session_id)
			store.store_runtime_node_properties(data, session_id)
			return true
		"node_property_set":
			sessions.remember_session_id(session_id)
			store.store_runtime_node_property_set(data, session_id)
			return true
		"runtime_screenshot_result":
			sessions.remember_session_id(session_id)
			store.store_runtime_screenshot(data, session_id)
			return true
		_:
			return false
