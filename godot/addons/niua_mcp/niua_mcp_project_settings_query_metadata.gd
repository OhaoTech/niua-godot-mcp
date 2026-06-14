@tool
extends RefCounted


static func optional_query_bool(query: Dictionary, key: String) -> Dictionary:
	if not query.has(key):
		return {
			"has": false,
			"value": false
		}

	var raw_value = query.get(key)
	if typeof(raw_value) == TYPE_BOOL:
		return {
			"has": true,
			"value": raw_value
		}

	var text := str(raw_value).strip_edges().to_lower()
	return {
		"has": true,
		"value": text == "true" or text == "1" or text == "yes" or text == "on"
	}


static func optional_filter_value(filter: Dictionary):
	if not bool(filter.get("has", false)):
		return null
	return bool(filter.get("value", false))


static func setting_matches_filters(setting: Dictionary, search_text: String, editor_visible_filter: Dictionary, basic_filter: Dictionary, internal_filter: Dictionary, restart_filter: Dictionary) -> bool:
	if not search_text.is_empty() and not _project_setting_matches_query(setting, search_text):
		return false
	if _bool_filter_mismatch(bool(setting.get("isEditorVisible", false)), editor_visible_filter):
		return false
	if _bool_filter_mismatch(bool(setting.get("isBasic", false)), basic_filter):
		return false
	if _bool_filter_mismatch(bool(setting.get("isInternal", false)), internal_filter):
		return false
	if _bool_filter_mismatch(bool(setting.get("restartIfChanged", false)), restart_filter):
		return false
	return true


static func _project_setting_matches_query(setting: Dictionary, search_text: String) -> bool:
	var fields := [
		str(setting.get("name", "")),
		str(setting.get("category", "")),
		str(setting.get("section", "")),
		str(setting.get("leaf", "")),
		str(setting.get("type", "")),
		str(setting.get("declaredType", "")),
		str(setting.get("hintString", "")),
		JSON.stringify(setting.get("value", ""))
	]
	for field in fields:
		if field.to_lower().find(search_text) != -1:
			return true
	return false


static func _bool_filter_mismatch(actual: bool, filter: Dictionary) -> bool:
	return bool(filter.get("has", false)) and actual != bool(filter.get("value", false))
