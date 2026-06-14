@tool
extends RefCounted

const MAX_EVENTS := 100

var events: Array[Dictionary] = []


func record_event(kind: String, data: Dictionary) -> void:
	var event := data.duplicate(true)
	event["kind"] = kind
	event["timeMsec"] = Time.get_ticks_msec()
	events.append(event)
	while events.size() > MAX_EVENTS:
		events.pop_front()


func filtered_events(limit: int = MAX_EVENTS, kinds: Array = [], since_msec: int = -1) -> Dictionary:
	var normalized_limit: int = int(clamp(limit, 1, MAX_EVENTS))
	var kind_filter := {}
	var normalized_kinds := []
	for raw_kind in kinds:
		var kind := str(raw_kind).strip_edges()
		if kind.is_empty():
			continue
		kind_filter[kind] = true
		normalized_kinds.append(kind)

	var matched := []
	for event in events:
		var kind := str(event.get("kind", ""))
		if kind_filter.size() > 0 and not kind_filter.has(kind):
			continue
		if since_msec >= 0 and int(event.get("timeMsec", -1)) <= since_msec:
			continue
		matched.append(event.duplicate(true))

	var start_index: int = max(0, matched.size() - normalized_limit)
	var selected := []
	for index in range(start_index, matched.size()):
		selected.append(matched[index])

	return {
		"events": selected,
		"eventCount": selected.size(),
		"totalMatched": matched.size(),
		"limit": normalized_limit,
		"kinds": normalized_kinds,
		"sinceMsec": since_msec
	}


func runtime_events() -> Array:
	var runtime_events := []
	for event in events:
		var kind := str(event.get("kind", ""))
		if kind.begins_with("runtime_"):
			runtime_events.append(event)
	return runtime_events
