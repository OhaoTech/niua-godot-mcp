@tool
extends RefCounted

const NiuaMcpInputEventJsonWriterShared = preload("niua_mcp_input_event_json_writer_shared.gd")


static func mouse_button_event_to_json(event: InputEventMouseButton) -> Dictionary:
	var output := NiuaMcpInputEventJsonWriterShared.base_input_event_json(event, "mouse_button", true)
	NiuaMcpInputEventJsonWriterShared.merge_input_event_json(output, NiuaMcpInputEventJsonWriterShared.input_event_modifier_json(event))
	NiuaMcpInputEventJsonWriterShared.merge_input_event_json(output, NiuaMcpInputEventJsonWriterShared.input_event_mouse_json(event))
	output.merge({
		"buttonIndex": event.button_index,
		"pressed": event.pressed,
		"doubleClick": event.double_click,
		"factor": event.factor
	}, true)
	return output


static func mouse_motion_event_to_json(event: InputEventMouseMotion) -> Dictionary:
	var output := NiuaMcpInputEventJsonWriterShared.base_input_event_json(event, "mouse_motion", false)
	NiuaMcpInputEventJsonWriterShared.merge_input_event_json(output, NiuaMcpInputEventJsonWriterShared.input_event_modifier_json(event))
	NiuaMcpInputEventJsonWriterShared.merge_input_event_json(output, NiuaMcpInputEventJsonWriterShared.input_event_mouse_json(event))
	output.merge({
		"relative": NiuaMcpInputEventJsonWriterShared.vector2_to_json(event.relative),
		"screenRelative": NiuaMcpInputEventJsonWriterShared.vector2_to_json(event.screen_relative),
		"velocity": NiuaMcpInputEventJsonWriterShared.vector2_to_json(event.velocity),
		"screenVelocity": NiuaMcpInputEventJsonWriterShared.vector2_to_json(event.screen_velocity),
		"pressure": event.pressure,
		"tilt": NiuaMcpInputEventJsonWriterShared.vector2_to_json(event.tilt),
		"penInverted": event.pen_inverted
	}, true)
	return output


static func screen_touch_event_to_json(event: InputEventScreenTouch) -> Dictionary:
	var output := NiuaMcpInputEventJsonWriterShared.base_input_event_json(event, "screen_touch", false)
	NiuaMcpInputEventJsonWriterShared.merge_input_event_json(output, NiuaMcpInputEventJsonWriterShared.input_event_window_json(event))
	output.merge({
		"index": event.index,
		"position": NiuaMcpInputEventJsonWriterShared.vector2_to_json(event.position),
		"pressed": event.pressed,
		"canceled": event.canceled,
		"doubleTap": event.double_tap
	}, true)
	return output


static func screen_drag_event_to_json(event: InputEventScreenDrag) -> Dictionary:
	var output := NiuaMcpInputEventJsonWriterShared.base_input_event_json(event, "screen_drag", false)
	NiuaMcpInputEventJsonWriterShared.merge_input_event_json(output, NiuaMcpInputEventJsonWriterShared.input_event_window_json(event))
	output.merge({
		"index": event.index,
		"position": NiuaMcpInputEventJsonWriterShared.vector2_to_json(event.position),
		"relative": NiuaMcpInputEventJsonWriterShared.vector2_to_json(event.relative),
		"screenRelative": NiuaMcpInputEventJsonWriterShared.vector2_to_json(event.screen_relative),
		"velocity": NiuaMcpInputEventJsonWriterShared.vector2_to_json(event.velocity),
		"screenVelocity": NiuaMcpInputEventJsonWriterShared.vector2_to_json(event.screen_velocity),
		"pressure": event.pressure,
		"tilt": NiuaMcpInputEventJsonWriterShared.vector2_to_json(event.tilt),
		"penInverted": event.pen_inverted
	}, true)
	return output
