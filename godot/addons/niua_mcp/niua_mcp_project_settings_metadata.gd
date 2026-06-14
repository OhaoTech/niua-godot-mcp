@tool
extends RefCounted

const NiuaMcpProjectSettingsQueryMetadata = preload("niua_mcp_project_settings_query_metadata.gd")
const NiuaMcpProjectSettingsSummaryMetadata = preload("niua_mcp_project_settings_summary_metadata.gd")
const NiuaMcpProjectSettingsCategoryMetadata = preload("niua_mcp_project_settings_category_metadata.gd")


static func optional_query_bool(query: Dictionary, key: String) -> Dictionary:
	return NiuaMcpProjectSettingsQueryMetadata.optional_query_bool(query, key)


static func optional_filter_value(filter: Dictionary):
	return NiuaMcpProjectSettingsQueryMetadata.optional_filter_value(filter)


static func setting_summary(name: String, property: Dictionary) -> Dictionary:
	return NiuaMcpProjectSettingsSummaryMetadata.setting_summary(name, property)


static func setting_matches_filters(setting: Dictionary, search_text: String, editor_visible_filter: Dictionary, basic_filter: Dictionary, internal_filter: Dictionary, restart_filter: Dictionary) -> bool:
	return NiuaMcpProjectSettingsQueryMetadata.setting_matches_filters(
		setting,
		search_text,
		editor_visible_filter,
		basic_filter,
		internal_filter,
		restart_filter
	)


static func settings_categories(settings: Array) -> Array:
	return NiuaMcpProjectSettingsCategoryMetadata.settings_categories(settings)
