@tool
extends RefCounted

const NiuaMcpProjectSettingsUtils = preload("niua_mcp_project_settings_utils.gd")
const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")


static func set_project_setting(body: Dictionary, path_validator: Callable, save_project_settings: Callable) -> Dictionary:
	var name := str(body.get("name", ""))
	if name.is_empty():
		return NiuaMcpProjectSettingsUtils.error("project setting name is required")

	var value = NiuaMcpVariantCodec.json_to_variant(body.get("value"), path_validator)
	ProjectSettings.set_setting(name, value)

	var save_requested := bool(body.get("save", true))
	var save_error := int(save_project_settings.call(save_requested))
	if save_error != OK:
		return NiuaMcpProjectSettingsUtils.error("failed to save project settings: %s" % save_error)

	return {
		"ok": true,
		"data": {
			"name": name,
			"value": NiuaMcpVariantCodec.variant_to_json(ProjectSettings.get_setting(name)),
			"saved": save_requested
		}
	}


static func set_project_setting_metadata(body: Dictionary, path_validator: Callable, save_project_settings: Callable) -> Dictionary:
	var name := str(body.get("name", ""))
	if name.is_empty():
		return NiuaMcpProjectSettingsUtils.error("project setting name is required")

	var updated_metadata := {}
	if body.has("order"):
		var order := int(body.get("order"))
		ProjectSettings.set_order(name, order)
		updated_metadata["order"] = ProjectSettings.get_order(name)

	if body.has("initialValue"):
		var initial_value = NiuaMcpVariantCodec.json_to_variant(body.get("initialValue"), path_validator)
		ProjectSettings.set_initial_value(name, initial_value)
		updated_metadata["initialValue"] = NiuaMcpVariantCodec.variant_to_json(initial_value)

	if body.has("basic"):
		var basic := bool(body.get("basic"))
		ProjectSettings.set_as_basic(name, basic)
		updated_metadata["basic"] = basic

	if body.has("internal"):
		var internal := bool(body.get("internal"))
		ProjectSettings.set_as_internal(name, internal)
		updated_metadata["internal"] = internal

	if body.has("restartIfChanged"):
		var restart_if_changed := bool(body.get("restartIfChanged"))
		ProjectSettings.set_restart_if_changed(name, restart_if_changed)
		updated_metadata["restartIfChanged"] = restart_if_changed

	if updated_metadata.is_empty():
		return NiuaMcpProjectSettingsUtils.error("at least one project setting metadata field is required")

	var save_requested := bool(body.get("save", true))
	var save_error := int(save_project_settings.call(save_requested))
	if save_error != OK:
		return NiuaMcpProjectSettingsUtils.error("failed to save project settings: %s" % save_error)

	var value = null
	if ProjectSettings.has_setting(name):
		value = ProjectSettings.get_setting(name)

	return {
		"ok": true,
		"data": {
			"name": name,
			"value": NiuaMcpVariantCodec.variant_to_json(value),
			"order": ProjectSettings.get_order(name),
			"saved": save_requested,
			"updatedMetadata": updated_metadata
		}
	}
