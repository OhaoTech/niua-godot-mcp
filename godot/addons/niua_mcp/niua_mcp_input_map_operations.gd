@tool
extends RefCounted

const NiuaMcpInputEventCodec = preload("niua_mcp_input_event_codec.gd")
const NiuaMcpProjectSettingsUtils = preload("niua_mcp_project_settings_utils.gd")


static func input_map() -> Dictionary:
	# The project's input actions live in ProjectSettings ("input/<name>") —
	# the same source set_input_action writes and the running game loads at
	# startup. The editor process's InputMap singleton holds editor shortcuts
	# (ui_*, spatial_editor/*), never the game's actions, so reading it both
	# violated read-your-writes and dumped ~90 actions of editor chrome.
	var actions := []
	for property in ProjectSettings.get_property_list():
		var property_name := str(property.get("name", ""))
		if not property_name.begins_with("input/"):
			continue
		var setting = ProjectSettings.get_setting(property_name)
		if typeof(setting) != TYPE_DICTIONARY:
			continue
		# Built-in ui_* defaults are registered as project settings too; only a
		# value that differs from its registered default is the project's own.
		# var_to_str compares serialized content, not InputEvent object identity.
		if var_to_str(setting) == var_to_str(ProjectSettings.property_get_revert(property_name)):
			continue
		var events := []
		var raw_events = setting.get("events", [])
		if typeof(raw_events) == TYPE_ARRAY:
			for event in raw_events:
				if event is InputEvent:
					events.append(NiuaMcpInputEventCodec.event_to_json(event))
		actions.append({
			"name": property_name.substr(6),
			"deadzone": float(setting.get("deadzone", 0.2)),
			"events": events
		})

	actions.sort_custom(func(a, b): return str(a.name) < str(b.name))

	return {
		"ok": true,
		"data": {
			"actions": actions,
			"source": "project_settings"
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
