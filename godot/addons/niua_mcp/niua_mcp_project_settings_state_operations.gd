@tool
extends RefCounted

const NiuaMcpProjectSettingsMetadata = preload("niua_mcp_project_settings_metadata.gd")


static func project_settings(query: Dictionary) -> Dictionary:
	var prefix := str(query.get("prefix", ""))
	var search_text := str(query.get("query", query.get("search", ""))).strip_edges().to_lower()
	var editor_visible_filter := NiuaMcpProjectSettingsMetadata.optional_query_bool(query, "editorVisible")
	var basic_filter := NiuaMcpProjectSettingsMetadata.optional_query_bool(query, "basic")
	var internal_filter := NiuaMcpProjectSettingsMetadata.optional_query_bool(query, "internal")
	var restart_filter := NiuaMcpProjectSettingsMetadata.optional_query_bool(query, "restartIfChanged")
	var settings := []

	for property in ProjectSettings.get_property_list():
		var name := str(property.get("name", ""))
		if name.is_empty():
			continue
		if not prefix.is_empty() and not name.begins_with(prefix):
			continue

		var setting := NiuaMcpProjectSettingsMetadata.setting_summary(name, property)
		if not NiuaMcpProjectSettingsMetadata.setting_matches_filters(setting, search_text, editor_visible_filter, basic_filter, internal_filter, restart_filter):
			continue

		settings.append(setting)

	return {
		"ok": true,
		"data": {
			"prefix": prefix,
			"query": search_text,
			"filters": {
				"editorVisible": NiuaMcpProjectSettingsMetadata.optional_filter_value(editor_visible_filter),
				"basic": NiuaMcpProjectSettingsMetadata.optional_filter_value(basic_filter),
				"internal": NiuaMcpProjectSettingsMetadata.optional_filter_value(internal_filter),
				"restartIfChanged": NiuaMcpProjectSettingsMetadata.optional_filter_value(restart_filter)
			},
			"settingCount": settings.size(),
			"settings": settings,
			"categories": NiuaMcpProjectSettingsMetadata.settings_categories(settings)
		}
	}
