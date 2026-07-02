@tool
extends RefCounted


static func state(debugger_probe: EditorDebuggerPlugin, sessions, store) -> Dictionary:
	return {
		"sessions": sessions.session_snapshots(debugger_probe),
		"events": store.events.duplicate(true)
	}


static func runtime_state(debugger_probe: EditorDebuggerPlugin, sessions, store) -> Dictionary:
	return {
		"sessions": sessions.runtime_session_snapshots(debugger_probe, store),
		"events": store.runtime_events()
	}


static func filtered_events(store, limit: int, kinds: Array, since_msec: int) -> Dictionary:
	return store.filtered_events(limit, kinds, since_msec)


static func runtime_node_properties(store, sessions, node_path: String, request_id: String = "") -> Array:
	return store.runtime_node_properties(sessions.ids(), node_path, request_id)


static func runtime_node_property_set_result(store, request_id: String) -> Array:
	return store.runtime_node_property_set_result(request_id)


static func runtime_screenshot_result(store, request_id: String) -> Array:
	return store.runtime_screenshot_result(request_id)


static func runtime_input_send_result(store, request_id: String) -> Array:
	return store.runtime_input_send_result(request_id)
