@tool
extends RefCounted

const NiuaMcpInputEventJsonWriter = preload("niua_mcp_input_event_json_writer.gd")
const NiuaMcpInputEventJsonReader = preload("niua_mcp_input_event_json_reader.gd")


static func events_to_json(events: Array) -> Array:
	return NiuaMcpInputEventJsonWriter.events_to_json(events)


static func event_to_json(event: InputEvent) -> Dictionary:
	return NiuaMcpInputEventJsonWriter.event_to_json(event)


static func event_from_json(spec) -> InputEvent:
	return NiuaMcpInputEventJsonReader.event_from_json(spec)
