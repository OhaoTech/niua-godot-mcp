@tool
extends RefCounted

const NiuaMcpInputEventCodec = preload("niua_mcp_input_event_codec.gd")
const NiuaMcpProjectSettingsUtils = preload("niua_mcp_project_settings_utils.gd")


static func input_map() -> Dictionary:
	var actions := []
	for action in InputMap.get_actions():
		var action_name := str(action)
		var events := []
		for event in InputMap.action_get_events(action):
			events.append(NiuaMcpInputEventCodec.event_to_json(event))

		actions.append({
			"name": action_name,
			"deadzone": InputMap.action_get_deadzone(action),
			"events": events
		})

	return {
		"ok": true,
		"data": {
			"actions": actions
		}
	}


static func set_input_action(body: Dictionary, save_project_settings: Callable) -> Dictionary:
	var action_name := str(body.get("name", ""))
	if action_name.is_empty():
		return NiuaMcpProjectSettingsUtils.error("input action name is required")

	var deadzone := float(body.get("deadzone", 0.2))
	if not InputMap.has_action(action_name):
		InputMap.add_action(action_name, deadzone)
	else:
		InputMap.action_set_deadzone(action_name, deadzone)

	if bool(body.get("replace", true)):
		InputMap.action_erase_events(action_name)

	var events = body.get("events", [])
	if typeof(events) == TYPE_ARRAY:
		for event_spec in events:
			var event := NiuaMcpInputEventCodec.event_from_json(event_spec)
			if event != null:
				InputMap.action_add_event(action_name, event)

	ProjectSettings.set_setting("input/%s" % action_name, {
		"deadzone": deadzone,
		"events": InputMap.action_get_events(action_name)
	})

	var save_requested := bool(body.get("save", true))
	var save_error := int(save_project_settings.call(save_requested))
	if save_error != OK:
		return NiuaMcpProjectSettingsUtils.error("failed to save input action: %s" % save_error)

	return {
		"ok": true,
		"data": {
			"name": action_name,
			"deadzone": InputMap.action_get_deadzone(action_name),
			"events": NiuaMcpInputEventCodec.events_to_json(InputMap.action_get_events(action_name)),
			"saved": save_requested
		}
	}
