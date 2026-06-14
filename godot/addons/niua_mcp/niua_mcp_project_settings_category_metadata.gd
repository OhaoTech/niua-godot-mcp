@tool
extends RefCounted


static func settings_categories(settings: Array) -> Array:
	var categories_by_path := {}
	var category_order := []
	for setting in settings:
		var segments = setting.get("pathSegments", [])
		if typeof(segments) != TYPE_ARRAY or segments.is_empty():
			continue

		var category_path := str(segments[0])
		if not categories_by_path.has(category_path):
			categories_by_path[category_path] = {
				"name": category_path,
				"path": category_path,
				"settingCount": 0,
				"settings": [],
				"sections": [],
				"_sectionsByPath": {},
				"_sectionOrder": []
			}
			category_order.append(category_path)

		var category = categories_by_path[category_path]
		category["settingCount"] = int(category.get("settingCount", 0)) + 1
		category["settings"].append(str(setting.get("name", "")))

		if segments.size() > 1:
			var section_name := str(segments[1])
			var section_path := "%s/%s" % [category_path, section_name]
			var sections_by_path = category.get("_sectionsByPath", {})
			if not sections_by_path.has(section_path):
				sections_by_path[section_path] = {
					"name": section_name,
					"path": section_path,
					"settingCount": 0,
					"settings": []
				}
				category["_sectionOrder"].append(section_path)
			var section = sections_by_path[section_path]
			section["settingCount"] = int(section.get("settingCount", 0)) + 1
			section["settings"].append(str(setting.get("name", "")))

	var categories := []
	for category_path in category_order:
		var category = categories_by_path[category_path]
		var sections := []
		var sections_by_path = category.get("_sectionsByPath", {})
		for section_path in category.get("_sectionOrder", []):
			sections.append(sections_by_path[section_path])
		category["sections"] = sections
		category.erase("_sectionsByPath")
		category.erase("_sectionOrder")
		categories.append(category)
	return categories
