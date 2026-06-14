@tool
extends RefCounted


static func preset_summaries(sections: Dictionary) -> Array:
	var indexes := []
	for section_name in sections.keys():
		var name := str(section_name)
		if not name.begins_with("preset."):
			continue

		var suffix := name.trim_prefix("preset.")
		if suffix.is_valid_int():
			var index := int(suffix)
			if not indexes.has(index):
				indexes.append(index)

	indexes.sort()

	var presets := []
	for index in indexes:
		var section_name := "preset.%d" % index
		var values = sections.get(section_name, {})
		var options = sections.get("%s.options" % section_name, {})
		if typeof(values) == TYPE_DICTIONARY:
			presets.append(preset_summary(index, values, options if typeof(options) == TYPE_DICTIONARY else {}))

	return presets


static func find_preset_index(config: ConfigFile, name: String, platform: String) -> int:
	for section_name in config.get_sections():
		var section := str(section_name)
		if not section.begins_with("preset.") or section.ends_with(".options"):
			continue

		var current_name := str(config.get_value(section, "name", ""))
		var current_platform := str(config.get_value(section, "platform", ""))
		if current_name != name or current_platform != platform:
			continue

		var suffix := section.trim_prefix("preset.")
		if suffix.is_valid_int():
			return int(suffix)

	return -1


static func next_preset_index(config: ConfigFile) -> int:
	var next_index := 0
	for section_name in config.get_sections():
		var section := str(section_name)
		if not section.begins_with("preset.") or section.ends_with(".options"):
			continue

		var suffix := section.trim_prefix("preset.")
		if suffix.is_valid_int():
			next_index = max(next_index, int(suffix) + 1)

	return next_index


static func preset_summary(index: int, values: Dictionary, options: Dictionary) -> Dictionary:
	return {
		"index": index,
		"name": str(values.get("name", "")),
		"platform": str(values.get("platform", "")),
		"runnable": bool(values.get("runnable", false)),
		"exportPath": str(values.get("export_path", "")),
		"exportFilter": str(values.get("export_filter", "")),
		"includeFilter": str(values.get("include_filter", "")),
		"excludeFilter": str(values.get("exclude_filter", "")),
		"customFeatures": str(values.get("custom_features", "")),
		"options": options
	}
