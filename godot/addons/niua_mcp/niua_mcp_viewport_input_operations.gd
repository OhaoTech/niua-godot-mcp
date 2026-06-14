@tool
extends RefCounted

const NiuaMcpInputEventCodec = preload("niua_mcp_input_event_codec.gd")
const NiuaMcpViewportResolver = preload("niua_mcp_viewport_resolver.gd")
const NiuaMcpViewportUtils = preload("niua_mcp_viewport_utils.gd")


static func send_viewport_input(editor: EditorInterface, body: Dictionary) -> Dictionary:
	if editor == null:
		return NiuaMcpViewportUtils.error("Godot editor interface is unavailable")

	var viewport_kind := str(body.get("viewport", "3d")).to_lower()
	var index := int(body.get("index", 0))
	var resolved := NiuaMcpViewportResolver.resolve_editor_viewport(editor, viewport_kind, index)
	if not resolved.get("ok", false):
		return resolved

	var viewport := resolved.get("viewport") as SubViewport
	index = int(resolved.get("index", index))
	if viewport == null:
		return NiuaMcpViewportUtils.error("editor viewport unavailable: %s" % viewport_kind, "not_found")

	var raw_events = body.get("events", [])
	if typeof(raw_events) != TYPE_ARRAY:
		return NiuaMcpViewportUtils.error("events must be an array")

	var event_specs: Array = raw_events
	if event_specs.is_empty():
		return NiuaMcpViewportUtils.error("events must not be empty")

	var local := bool(body.get("local", true))
	if bool(body.get("notifyMouseEntered", true)):
		viewport.notify_mouse_entered()

	var pushed_events := []
	for event_index in range(event_specs.size()):
		var input_event := NiuaMcpInputEventCodec.event_from_json(event_specs[event_index])
		if input_event == null:
			return NiuaMcpViewportUtils.error("events[%d] is not a supported input event" % event_index)

		viewport.push_input(input_event, local)
		pushed_events.append(NiuaMcpInputEventCodec.event_to_json(input_event))

	if bool(body.get("updateMouseCursorState", true)):
		viewport.update_mouse_cursor_state()

	return {
		"ok": true,
		"data": {
			"viewport": viewport_kind,
			"index": index,
			"local": local,
			"eventsSent": pushed_events.size(),
			"events": pushed_events
		}
	}
