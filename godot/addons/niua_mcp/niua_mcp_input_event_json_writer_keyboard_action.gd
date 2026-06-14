@tool
extends RefCounted

const NiuaMcpInputEventJsonWriterShared = preload("niua_mcp_input_event_json_writer_shared.gd")


static func key_event_to_json(event: InputEventKey) -> Dictionary:
	var output := NiuaMcpInputEventJsonWriterShared.base_input_event_json(event, "key", true)
	NiuaMcpInputEventJsonWriterShared.merge_input_event_json(output, NiuaMcpInputEventJsonWriterShared.input_event_modifier_json(event))
	output.merge({
		"keycode": event.keycode,
		"physicalKeycode": event.physical_keycode,
		"unicode": event.unicode
	}, true)
	return output


static func action_event_to_json(event: InputEventAction) -> Dictionary:
	var output := NiuaMcpInputEventJsonWriterShared.base_input_event_json(event, "action", true)
	output.merge({
		"action": str(event.action),
		"pressed": event.pressed,
		"strength": event.strength,
		"eventIndex": event.event_index
	}, true)
	return output
