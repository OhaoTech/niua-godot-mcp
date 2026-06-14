@tool
extends RefCounted

const NiuaMcpImportMetadata = preload("niua_mcp_import_metadata.gd")


static func import_events_response(query: Dictionary, import_events: Array, events_available: bool, max_events: int) -> Dictionary:
	var limit := int(clamp(int(query.get("limit", "100")), 1, max_events))
	var since_msec := int(query.get("sinceMsec", "-1"))
	var kinds := []
	for raw_kind in str(query.get("kinds", "")).split(",", false):
		var kind := raw_kind.strip_edges()
		if not kind.is_empty():
			kinds.append(kind)

	var matched := []
	for event in import_events:
		var event_kind := str(event.get("kind", ""))
		if not kinds.is_empty() and not kinds.has(event_kind):
			continue
		if since_msec >= 0 and int(event.get("timeMsec", -1)) <= since_msec:
			continue
		matched.append(event)

	var selected := []
	var start_index: int = max(matched.size() - limit, 0)
	for index in range(start_index, matched.size()):
		selected.append(matched[index])

	return {
		"ok": true,
		"data": {
			"available": events_available,
			"events": selected,
			"eventCount": selected.size(),
			"totalMatched": matched.size(),
			"limit": limit,
			"kinds": kinds,
			"sinceMsec": since_msec
		}
	}


static func record_event(import_events: Array, max_events: int, kind: String, raw_paths = [], extra: Dictionary = {}, resource_filesystem = null) -> void:
	var event := NiuaMcpImportMetadata.event_summary(kind, raw_paths, extra, resource_filesystem)
	import_events.append(event)
	while import_events.size() > max_events:
		import_events.pop_front()
