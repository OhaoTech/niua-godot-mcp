@tool
extends RefCounted

const NiuaMcpInputMapOperations = preload("niua_mcp_input_map_operations.gd")
const NiuaMcpProjectSettingMutationOperations = preload("niua_mcp_project_setting_mutation_operations.gd")
const NiuaMcpProjectSettingsUtils = preload("niua_mcp_project_settings_utils.gd")


static func set_project_setting_with_side_effects(body: Dictionary, path_validator: Callable, save_project_settings: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpProjectSettingMutationOperations.set_project_setting(body, path_validator, save_project_settings)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpProjectSettingsUtils.remember(remember, "Set project setting %s" % str(data.get("name", "")))
	return response


static func set_project_setting_metadata_with_side_effects(body: Dictionary, path_validator: Callable, save_project_settings: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpProjectSettingMutationOperations.set_project_setting_metadata(body, path_validator, save_project_settings)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpProjectSettingsUtils.remember(remember, "Set project setting metadata %s" % str(data.get("name", "")))
	return response


static func set_input_action_with_side_effects(body: Dictionary, save_project_settings: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpInputMapOperations.set_input_action(body, save_project_settings)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpProjectSettingsUtils.remember(remember, "Set input action %s" % str(data.get("name", "")))
	return response
