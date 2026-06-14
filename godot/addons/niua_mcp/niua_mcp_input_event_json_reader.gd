@tool
extends RefCounted


static func event_from_json(spec) -> InputEvent:
	if typeof(spec) != TYPE_DICTIONARY:
		return null

	var kind := str(spec.get("type", ""))
	match kind:
		"key":
			var key_event := InputEventKey.new()
			key_event.keycode = int(spec.get("keycode", 0))
			key_event.physical_keycode = int(spec.get("physicalKeycode", 0))
			key_event.unicode = int(spec.get("unicode", 0))
			key_event.shift_pressed = bool(spec.get("shift", false))
			key_event.alt_pressed = bool(spec.get("alt", false))
			key_event.ctrl_pressed = bool(spec.get("ctrl", false))
			key_event.meta_pressed = bool(spec.get("meta", false))
			key_event.device = int(spec.get("device", 0))
			key_event.window_id = int(spec.get("windowId", 0))
			key_event.command_or_control_autoremap = bool(spec.get("commandOrControlAutoremap", false))
			return key_event
		"action":
			var action_event := InputEventAction.new()
			action_event.action = StringName(str(spec.get("action", "")))
			action_event.pressed = bool(spec.get("pressed", true))
			action_event.strength = float(spec.get("strength", 1.0))
			action_event.event_index = int(spec.get("eventIndex", -1))
			action_event.device = int(spec.get("device", 0))
			return action_event
		"mouse_button":
			var mouse_event := InputEventMouseButton.new()
			mouse_event.button_index = int(spec.get("buttonIndex", 0))
			mouse_event.pressed = bool(spec.get("pressed", true))
			mouse_event.double_click = bool(spec.get("doubleClick", false))
			mouse_event.factor = float(spec.get("factor", 1.0))
			mouse_event.device = int(spec.get("device", 0))
			mouse_event.window_id = int(spec.get("windowId", 0))
			mouse_event.shift_pressed = bool(spec.get("shift", false))
			mouse_event.alt_pressed = bool(spec.get("alt", false))
			mouse_event.ctrl_pressed = bool(spec.get("ctrl", false))
			mouse_event.meta_pressed = bool(spec.get("meta", false))
			mouse_event.command_or_control_autoremap = bool(spec.get("commandOrControlAutoremap", false))
			mouse_event.button_mask = int(spec.get("buttonMask", 0))
			mouse_event.position = json_vector2(spec.get("position"))
			mouse_event.global_position = json_vector2(spec.get("globalPosition", spec.get("position")))
			return mouse_event
		"mouse_motion":
			var mouse_motion_event := InputEventMouseMotion.new()
			mouse_motion_event.device = int(spec.get("device", 0))
			mouse_motion_event.window_id = int(spec.get("windowId", 0))
			mouse_motion_event.shift_pressed = bool(spec.get("shift", false))
			mouse_motion_event.alt_pressed = bool(spec.get("alt", false))
			mouse_motion_event.ctrl_pressed = bool(spec.get("ctrl", false))
			mouse_motion_event.meta_pressed = bool(spec.get("meta", false))
			mouse_motion_event.command_or_control_autoremap = bool(spec.get("commandOrControlAutoremap", false))
			mouse_motion_event.button_mask = int(spec.get("buttonMask", 0))
			mouse_motion_event.position = json_vector2(spec.get("position"))
			mouse_motion_event.global_position = json_vector2(spec.get("globalPosition", spec.get("position")))
			mouse_motion_event.relative = json_vector2(spec.get("relative"))
			mouse_motion_event.screen_relative = json_vector2(spec.get("screenRelative"))
			mouse_motion_event.velocity = json_vector2(spec.get("velocity"))
			mouse_motion_event.screen_velocity = json_vector2(spec.get("screenVelocity"))
			mouse_motion_event.pressure = float(spec.get("pressure", 0.0))
			mouse_motion_event.tilt = json_vector2(spec.get("tilt"))
			mouse_motion_event.pen_inverted = bool(spec.get("penInverted", false))
			return mouse_motion_event
		"joypad_button":
			var button_event := InputEventJoypadButton.new()
			button_event.button_index = int(spec.get("buttonIndex", 0))
			button_event.pressure = float(spec.get("pressure", 0.0))
			button_event.device = int(spec.get("device", 0))
			return button_event
		"joypad_motion":
			var motion_event := InputEventJoypadMotion.new()
			motion_event.axis = int(spec.get("axis", 0))
			motion_event.axis_value = float(spec.get("axisValue", 0.0))
			motion_event.device = int(spec.get("device", 0))
			return motion_event
		_:
			return null


static func json_vector2(value) -> Vector2:
	match typeof(value):
		TYPE_VECTOR2:
			return value
		TYPE_ARRAY:
			if value.size() >= 2:
				return Vector2(float(value[0]), float(value[1]))
		TYPE_DICTIONARY:
			if value.has("x") or value.has("y"):
				return Vector2(float(value.get("x", 0.0)), float(value.get("y", 0.0)))
	return Vector2.ZERO
