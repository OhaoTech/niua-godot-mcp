@tool
extends RefCounted

const NiuaMcpInputMapOperations = preload("niua_mcp_input_map_operations.gd")
const NiuaMcpProjectSettingMutationOperations = preload("niua_mcp_project_setting_mutation_operations.gd")
const NiuaMcpProjectSettingsSideEffects = preload("niua_mcp_project_settings_side_effects.gd")
const NiuaMcpProjectSettingsStateOperations = preload("niua_mcp_project_settings_state_operations.gd")
const NiuaMcpProjectSettingsUtils = preload("niua_mcp_project_settings_utils.gd")


static func set_project_setting_with_side_effects(body: Dictionary, path_validator: Callable, save_project_settings: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpProjectSettingsSideEffects.set_project_setting_with_side_effects(body, path_validator, save_project_settings, remember)


static func set_project_setting_metadata_with_side_effects(body: Dictionary, path_validator: Callable, save_project_settings: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpProjectSettingsSideEffects.set_project_setting_metadata_with_side_effects(body, path_validator, save_project_settings, remember)


static func set_input_action_with_side_effects(body: Dictionary, save_project_settings: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpProjectSettingsSideEffects.set_input_action_with_side_effects(body, save_project_settings, remember)


static func project_settings(query: Dictionary) -> Dictionary:
	return NiuaMcpProjectSettingsStateOperations.project_settings(query)


static func set_project_setting(body: Dictionary, path_validator: Callable, save_project_settings: Callable) -> Dictionary:
	return NiuaMcpProjectSettingMutationOperations.set_project_setting(body, path_validator, save_project_settings)


static func set_project_setting_metadata(body: Dictionary, path_validator: Callable, save_project_settings: Callable) -> Dictionary:
	return NiuaMcpProjectSettingMutationOperations.set_project_setting_metadata(body, path_validator, save_project_settings)


static func input_map() -> Dictionary:
	return NiuaMcpInputMapOperations.input_map()


static func set_input_action(body: Dictionary, save_project_settings: Callable) -> Dictionary:
	return NiuaMcpInputMapOperations.set_input_action(body, save_project_settings)
