@tool
extends RefCounted


static func runtime_state(debugger_probe, query: Dictionary) -> Dictionary:
	# Token diet: maxDepth bounds the requested runtime snapshot depth
	# (0 = unlimited); truncated nodes report childrenTruncated. pathFilter
	# serializes only the subtree rooted at a live node path.
	var max_depth := str(query.get("maxDepth", "0")).to_int()
	var path_filter := str(query.get("pathFilter", ""))
	var probe_state := {
		"sessions": [],
		"events": []
	}
	var requested_sessions := []
	var request_id := ""
	if debugger_probe != null:
		request_id = debugger_probe.next_runtime_request_id("snapshot")
		requested_sessions = debugger_probe.send_runtime_snapshot_request(max_depth, path_filter, request_id)
		probe_state = debugger_probe.runtime_state()

	var sessions: Array = probe_state.get("sessions", [])
	# pending is true until the probe's response for THIS requestId lands in
	# the store — the sessions returned here still hold the previous snapshot.
	# Callers poll /runtime/state/result to trade the cached tree for the
	# requested one instead of mistaking old state for current truth.
	return {
		"ok": true,
		"data": {
			"available": debugger_probe != null,
			"requestId": request_id,
			"pending": requested_sessions.size() > 0,
			"sessionCount": sessions.size(),
			"sessions": sessions,
			"events": probe_state.get("events", []),
			"snapshotRequestedSessions": requested_sessions
		}
	}


static func runtime_state_result(debugger_probe, query: Dictionary) -> Dictionary:
	var request_id := str(query.get("requestId", ""))
	if request_id.is_empty():
		return {
			"ok": false,
			"error": "runtime state requestId is required",
			"errorCode": "bad_request"
		}

	var responses := []
	var probe_state := {
		"sessions": [],
		"events": []
	}
	if debugger_probe != null:
		responses = debugger_probe.runtime_snapshot_result(request_id)
		probe_state = debugger_probe.runtime_state()

	var sessions: Array = probe_state.get("sessions", [])
	return {
		"ok": true,
		"data": {
			"available": debugger_probe != null,
			"requestId": request_id,
			"pending": debugger_probe != null and responses.size() == 0,
			"sessionCount": sessions.size(),
			"sessions": sessions,
			"events": probe_state.get("events", []),
			"snapshotRequestedSessions": []
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
