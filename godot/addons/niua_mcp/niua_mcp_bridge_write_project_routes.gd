@tool
extends RefCounted

const NiuaMcpExportOperations = preload("niua_mcp_export_operations.gd")
const NiuaMcpProjectSettingsOperations = preload("niua_mcp_project_settings_operations.gd")

const HANDLERS := {
	"_set_project_setting": true,
	"_set_project_setting_metadata": true,
	"_set_input_action": true,
	"_upsert_export_preset": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _set_project_setting(body: Dictionary) -> Dictionary:
	return NiuaMcpProjectSettingsOperations.set_project_setting_with_side_effects(
		body,
		Callable(_context, "validate_res_path"),
		Callable(_context, "save_project_settings_if_requested"),
		Callable(_context, "remember")
	)


func _set_project_setting_metadata(body: Dictionary) -> Dictionary:
	return NiuaMcpProjectSettingsOperations.set_project_setting_metadata_with_side_effects(
		body,
		Callable(_context, "validate_res_path"),
		Callable(_context, "save_project_settings_if_requested"),
		Callable(_context, "remember")
	)


func _set_input_action(body: Dictionary) -> Dictionary:
	return NiuaMcpProjectSettingsOperations.set_input_action_with_side_effects(
		body,
		Callable(_context, "save_project_settings_if_requested"),
		Callable(_context, "remember")
	)


func _upsert_export_preset(body: Dictionary) -> Dictionary:
	return NiuaMcpExportOperations.upsert_export_preset(body)
