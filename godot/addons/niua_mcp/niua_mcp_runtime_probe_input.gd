@tool
extends RefCounted

# Validates and applies runtime input (input-map actions and mouse-look motion)
# inside the running game on behalf of the NIUA runtime probe. Actions must
# already exist in the project input map; an unknown action returns an explicit
# error instead of silently no-oping.

const DEFAULT_STRENGTH := 1.0


static func plan(request: Dictionary) -> Dictionary:
	var request_id := str(request.get("requestId", ""))

	var raw_actions = request.get("actions", [])
	if raw_actions == null:
		raw_actions = []
	if typeof(raw_actions) != TYPE_ARRAY:
		return _error(request_id, "actions must be an array")

	var raw_motion = request.get("mouseMotion", null)
	var has_motion := typeof(raw_motion) == TYPE_DICTIONARY

	if raw_actions.is_empty() and not has_motion:
		return _error(request_id, "send_runtime_input requires at least one action or mouseMotion")

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
			"pressed": bool(raw_action.get("pressed", false)),
			"strength": float(raw_action.get("strength", DEFAULT_STRENGTH))
		})

	var motion = null
	if has_motion:
		motion = {
			"dx": float(raw_motion.get("dx", 0.0)),
			"dy": float(raw_motion.get("dy", 0.0))
		}

	return {
		"ok": true,
		"requestId": request_id,
		"actions": actions,
		"mouseMotion": motion,
		"holdMs": int(request.get("holdMs", 0))
	}


static func apply(input_plan: Dictionary) -> void:
	for action in input_plan.get("actions", []):
		if bool(action.get("pressed", false)):
			Input.action_press(action.get("action", ""), float(action.get("strength", DEFAULT_STRENGTH)))
		else:
			Input.action_release(action.get("action", ""))

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


static func release(action_names: Array) -> void:
	for action_name in action_names:
		Input.action_release(action_name)


static func applied_summary(input_plan: Dictionary, held_ms) -> Dictionary:
	return {
		"actions": input_plan.get("actions", []).duplicate(true),
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
