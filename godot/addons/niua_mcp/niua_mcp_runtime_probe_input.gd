@tool
extends RefCounted

# Validates and applies runtime input (input-map actions, raw key events,
# mouse buttons, and mouse-look motion) inside the running game on behalf of
# the NIUA runtime probe. Actions must already exist in the project input map;
# an unknown action returns an explicit error instead of silently no-oping.
# Raw keys and mouse buttons go through Input.parse_input_event, so they reach
# both _input handlers and the Input singleton state (is_physical_key_pressed),
# which games use for restart keys, menus, and debug shortcuts that never
# appear in the input map.

const DEFAULT_STRENGTH := 1.0

const MOUSE_BUTTON_NAMES := {
	"left": MOUSE_BUTTON_LEFT,
	"right": MOUSE_BUTTON_RIGHT,
	"middle": MOUSE_BUTTON_MIDDLE,
	"wheel_up": MOUSE_BUTTON_WHEEL_UP,
	"wheel_down": MOUSE_BUTTON_WHEEL_DOWN
}


static func plan(request: Dictionary) -> Dictionary:
	var request_id := str(request.get("requestId", ""))

	var raw_actions = request.get("actions", [])
	if raw_actions == null:
		raw_actions = []
	if typeof(raw_actions) != TYPE_ARRAY:
		return _error(request_id, "actions must be an array")

	var raw_keys = request.get("keys", [])
	if raw_keys == null:
		raw_keys = []
	if typeof(raw_keys) != TYPE_ARRAY:
		return _error(request_id, "keys must be an array")

	var raw_buttons = request.get("mouseButtons", [])
	if raw_buttons == null:
		raw_buttons = []
	if typeof(raw_buttons) != TYPE_ARRAY:
		return _error(request_id, "mouseButtons must be an array")

	var raw_motion = request.get("mouseMotion", null)
	var has_motion := typeof(raw_motion) == TYPE_DICTIONARY

	if raw_actions.is_empty() and raw_keys.is_empty() and raw_buttons.is_empty() and not has_motion:
		return _error(request_id, "send_runtime_input requires at least one action, key, mouseButton, or mouseMotion")

	var actions := []
	for raw_action in raw_actions:
		if typeof(raw_action) != TYPE_DICTIONARY:
			return _error(request_id, "each action must be an object with action and pressed fields")

		var action_name := str(raw_action.get("action", ""))
		if action_name.is_empty():
			return _error(request_id, "each action requires a non-empty action name")

		if not InputMap.has_action(action_name):
			return _error(request_id, "unknown input action: %s" % action_name, "unknown_action")

		actions.append({
			"action": action_name,
			"pressed": raw_action.get("pressed", false) == true,
			"strength": _float_or(raw_action.get("strength"), DEFAULT_STRENGTH)
		})

	var keys := []
	for raw_key in raw_keys:
		if typeof(raw_key) != TYPE_DICTIONARY:
			return _error(request_id, "each key must be an object with keycode or physicalKeycode and pressed")
		var keycode := _int_or(raw_key.get("keycode"), 0)
		var physical_keycode := _int_or(raw_key.get("physicalKeycode"), 0)
		if keycode <= 0 and physical_keycode <= 0:
			return _error(request_id, "each key requires a positive keycode or physicalKeycode")
		keys.append({
			"keycode": keycode,
			"physicalKeycode": physical_keycode,
			"pressed": raw_key.get("pressed", false) == true
		})

	var mouse_buttons := []
	for raw_button in raw_buttons:
		if typeof(raw_button) != TYPE_DICTIONARY:
			return _error(request_id, "each mouseButton must be an object with button and pressed")
		var button_name := str(raw_button.get("button", ""))
		if not MOUSE_BUTTON_NAMES.has(button_name):
			return _error(
				request_id,
				"unknown mouse button: %s (expected one of %s)" % [button_name, ", ".join(MOUSE_BUTTON_NAMES.keys())],
				"unknown_button"
			)
		var button := {
			"button": button_name,
			"buttonIndex": int(MOUSE_BUTTON_NAMES[button_name]),
			"pressed": raw_button.get("pressed", false) == true
		}
		var raw_position = raw_button.get("position", null)
		if typeof(raw_position) == TYPE_DICTIONARY:
			button["position"] = {
				"x": _float_or(raw_position.get("x"), 0.0),
				"y": _float_or(raw_position.get("y"), 0.0)
			}
		mouse_buttons.append(button)

	var motion = null
	if has_motion:
		motion = {
			"dx": _float_or(raw_motion.get("dx"), 0.0),
			"dy": _float_or(raw_motion.get("dy"), 0.0)
		}

	return {
		"ok": true,
		"requestId": request_id,
		"actions": actions,
		"keys": keys,
		"mouseButtons": mouse_buttons,
		"mouseMotion": motion,
		"holdMs": _int_or(request.get("holdMs"), 0)
	}


# JSON-borne optional fields arrive as explicit nulls, so Dictionary.get
# defaults do not apply and bare int()/float() casts crash the probe.
static func _int_or(value, fallback: int) -> int:
	if value is int:
		return value
	if value is float:
		return int(value)
	return fallback


static func _float_or(value, fallback: float) -> float:
	if value is float:
		return value
	if value is int:
		return float(value)
	return fallback


static func apply(input_plan: Dictionary) -> void:
	for action in input_plan.get("actions", []):
		if bool(action.get("pressed", false)):
			Input.action_press(action.get("action", ""), float(action.get("strength", DEFAULT_STRENGTH)))
		else:
			Input.action_release(action.get("action", ""))

	for key in input_plan.get("keys", []):
		Input.parse_input_event(_key_event(key, bool(key.get("pressed", false))))

	for button in input_plan.get("mouseButtons", []):
		var event := InputEventMouseButton.new()
		event.button_index = int(button.get("buttonIndex", MOUSE_BUTTON_LEFT)) as MouseButton
		event.pressed = bool(button.get("pressed", false))
		var button_position = button.get("position", null)
		if button_position != null:
			event.position = Vector2(float(button_position.get("x", 0.0)), float(button_position.get("y", 0.0)))
			event.global_position = event.position
		Input.parse_input_event(event)

	var motion = input_plan.get("mouseMotion", null)
	if motion != null:
		var event := InputEventMouseMotion.new()
		event.relative = Vector2(float(motion.get("dx", 0.0)), float(motion.get("dy", 0.0)))
		Input.parse_input_event(event)


static func held_actions(input_plan: Dictionary) -> Array:
	var held := []
	for action in input_plan.get("actions", []):
		if bool(action.get("pressed", false)):
			held.append(action.get("action", ""))
	return held


static func held_keys(input_plan: Dictionary) -> Array:
	var held := []
	for key in input_plan.get("keys", []):
		if bool(key.get("pressed", false)):
			held.append(key)
	return held


static func release(action_names: Array) -> void:
	for action_name in action_names:
		Input.action_release(action_name)


static func release_keys(keys: Array) -> void:
	for key in keys:
		Input.parse_input_event(_key_event(key, false))


static func _key_event(key: Dictionary, pressed: bool) -> InputEventKey:
	var event := InputEventKey.new()
	var keycode := int(key.get("keycode", 0))
	var physical_keycode := int(key.get("physicalKeycode", 0))
	if keycode > 0:
		event.keycode = keycode as Key
	if physical_keycode > 0:
		event.physical_keycode = physical_keycode as Key
	event.pressed = pressed
	return event


static func applied_summary(input_plan: Dictionary, held_ms) -> Dictionary:
	return {
		"actions": input_plan.get("actions", []).duplicate(true),
		"keys": input_plan.get("keys", []).duplicate(true),
		"mouseButtons": input_plan.get("mouseButtons", []).duplicate(true),
		"mouseMotion": input_plan.get("mouseMotion", null),
		"heldMs": held_ms
	}


static func _error(request_id: String, message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"requestId": request_id,
		"error": message,
		"errorCode": code,
		"applied": null
	}
