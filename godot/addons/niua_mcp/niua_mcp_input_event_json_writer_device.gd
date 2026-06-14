@tool
extends RefCounted

const NiuaMcpInputEventJsonWriterShared = preload("niua_mcp_input_event_json_writer_shared.gd")


static func joypad_button_event_to_json(event: InputEventJoypadButton) -> Dictionary:
	var output := NiuaMcpInputEventJsonWriterShared.base_input_event_json(event, "joypad_button", true)
	output.merge({
		"buttonIndex": event.button_index,
		"pressure": event.pressure
	}, true)
	return output


static func joypad_motion_event_to_json(event: InputEventJoypadMotion) -> Dictionary:
	var output := NiuaMcpInputEventJsonWriterShared.base_input_event_json(event, "joypad_motion", true)
	output.merge({
		"axis": event.axis,
		"axisValue": event.axis_value
	}, true)
	return output


static func midi_event_to_json(event: InputEventMIDI) -> Dictionary:
	var output := NiuaMcpInputEventJsonWriterShared.base_input_event_json(event, "midi", false)
	output.merge({
		"channel": event.channel,
		"message": event.message,
		"pitch": event.pitch,
		"velocity": event.velocity,
		"instrument": event.instrument,
		"pressure": event.pressure,
		"controllerNumber": event.controller_number,
		"controllerValue": event.controller_value
	}, true)
	return output
