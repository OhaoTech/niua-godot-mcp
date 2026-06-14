@tool
extends RefCounted


static func base_input_event_json(event: InputEvent, kind: String, assignable_to_input_map: bool) -> Dictionary:
	return {
		"type": kind,
		"class": event.get_class(),
		"text": event.as_text(),
		"device": event.device,
		"assignableToInputMap": assignable_to_input_map
	}


static func merge_input_event_json(target: Dictionary, values: Dictionary) -> void:
	for key in values.keys():
		target[key] = values[key]


static func input_event_window_json(event: InputEventFromWindow) -> Dictionary:
	return {
		"windowId": event.window_id
	}


static func input_event_modifier_json(event: InputEventWithModifiers) -> Dictionary:
	var output := input_event_window_json(event)
	output.merge({
		"shift": event.shift_pressed,
		"alt": event.alt_pressed,
		"ctrl": event.ctrl_pressed,
		"meta": event.meta_pressed,
		"commandOrControlAutoremap": event.command_or_control_autoremap
	}, true)
	return output


static func input_event_mouse_json(event: InputEventMouse) -> Dictionary:
	return {
		"buttonMask": event.button_mask,
		"position": vector2_to_json(event.position),
		"globalPosition": vector2_to_json(event.global_position)
	}


static func vector2_to_json(value: Vector2) -> Dictionary:
	return {
		"type": "Vector2",
		"x": value.x,
		"y": value.y
	}
