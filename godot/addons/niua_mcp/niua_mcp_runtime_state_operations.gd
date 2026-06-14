@tool
extends RefCounted


static func runtime_state(debugger_probe) -> Dictionary:
	var probe_state := {
		"sessions": [],
		"events": []
	}
	var requested_sessions := []
	if debugger_probe != null:
		requested_sessions = debugger_probe.send_runtime_snapshot_request()
		probe_state = debugger_probe.runtime_state()

	var sessions: Array = probe_state.get("sessions", [])
	return {
		"ok": true,
		"data": {
			"available": debugger_probe != null,
			"sessionCount": sessions.size(),
			"sessions": sessions,
			"events": probe_state.get("events", []),
			"snapshotRequestedSessions": requested_sessions
		}
	}


static func runtime_events(debugger_probe, query: Dictionary) -> Dictionary:
	var limit := int(query.get("limit", "100"))
	var since_msec := int(query.get("sinceMsec", "-1"))
	var kinds := []
	for raw_kind in str(query.get("kinds", "")).split(",", false):
		var kind := raw_kind.strip_edges()
		if not kind.is_empty():
			kinds.append(kind)

	var event_data := {
		"events": [],
		"eventCount": 0,
		"totalMatched": 0,
		"limit": int(clamp(limit, 1, 100)),
		"kinds": kinds,
		"sinceMsec": since_msec
	}
	if debugger_probe != null:
		event_data = debugger_probe.filtered_events(limit, kinds, since_msec)

	event_data["available"] = debugger_probe != null
	return {
		"ok": true,
		"data": event_data
	}
