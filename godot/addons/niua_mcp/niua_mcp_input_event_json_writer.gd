@tool
extends RefCounted

const NiuaMcpInputEventJsonWriterShared = preload("niua_mcp_input_event_json_writer_shared.gd")
const NiuaMcpInputEventJsonWriterKeyboardAction = preload("niua_mcp_input_event_json_writer_keyboard_action.gd")
const NiuaMcpInputEventJsonWriterPointer = preload("niua_mcp_input_event_json_writer_pointer.gd")
const NiuaMcpInputEventJsonWriterDevice = preload("niua_mcp_input_event_json_writer_device.gd")


static func events_to_json(events: Array) -> Array:
	var output := []
	for event in events:
		output.append(event_to_json(event))
	return output


static func event_to_json(event: InputEvent) -> Dictionary:
	if event is InputEventKey:
		return NiuaMcpInputEventJsonWriterKeyboardAction.key_event_to_json(event as InputEventKey)

	if event is InputEventAction:
		return NiuaMcpInputEventJsonWriterKeyboardAction.action_event_to_json(event as InputEventAction)

	if event is InputEventMouseButton:
		return NiuaMcpInputEventJsonWriterPointer.mouse_button_event_to_json(event as InputEventMouseButton)

	if event is InputEventJoypadButton:
		return NiuaMcpInputEventJsonWriterDevice.joypad_button_event_to_json(event as InputEventJoypadButton)

	if event is InputEventJoypadMotion:
		return NiuaMcpInputEventJsonWriterDevice.joypad_motion_event_to_json(event as InputEventJoypadMotion)

	if event is InputEventMouseMotion:
		return NiuaMcpInputEventJsonWriterPointer.mouse_motion_event_to_json(event as InputEventMouseMotion)

	if event is InputEventScreenTouch:
		return NiuaMcpInputEventJsonWriterPointer.screen_touch_event_to_json(event as InputEventScreenTouch)

	if event is InputEventScreenDrag:
		return NiuaMcpInputEventJsonWriterPointer.screen_drag_event_to_json(event as InputEventScreenDrag)

	if event is InputEventMIDI:
		return NiuaMcpInputEventJsonWriterDevice.midi_event_to_json(event as InputEventMIDI)

	return NiuaMcpInputEventJsonWriterShared.base_input_event_json(event, event.get_class(), false)
