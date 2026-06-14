@tool
extends RefCounted

const NiuaMcpPropertyMetadata = preload("niua_mcp_property_metadata.gd")
const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")


static func setting_summary(name: String, property: Dictionary) -> Dictionary:
	var value = ProjectSettings.get_setting(name)
	var usage := int(property.get("usage", 0))
	var type_id := int(property.get("type", typeof(value)))
	var segments := _path_segments(name)
	var category := str(segments[0]) if segments.size() > 0 else ""
	var section := _project_setting_section(segments)
	var leaf := str(segments[segments.size() - 1]) if segments.size() > 0 else name
	return {
		"name": name,
		"type": NiuaMcpVariantCodec.variant_type_name(value),
		"value": NiuaMcpVariantCodec.variant_to_json(value),
		"declaredType": type_string(type_id),
		"typeId": type_id,
		"hint": int(property.get("hint", 0)),
		"hintString": str(property.get("hint_string", "")),
		"usage": usage,
		"usageFlags": NiuaMcpPropertyMetadata.usage_flags(usage),
		"isEditorVisible": (usage & PROPERTY_USAGE_EDITOR) != 0,
		"isBasic": (usage & PROPERTY_USAGE_EDITOR_BASIC_SETTING) != 0,
		"isInternal": (usage & PROPERTY_USAGE_INTERNAL) != 0,
		"restartIfChanged": (usage & PROPERTY_USAGE_RESTART_IF_CHANGED) != 0,
		"order": ProjectSettings.get_order(name),
		"pathSegments": segments,
		"category": category,
		"section": section,
		"leaf": leaf
	}


static func _project_setting_section(segments: Array) -> String:
	if segments.size() == 0:
		return ""
	if segments.size() == 1:
		return str(segments[0])
	return "%s/%s" % [str(segments[0]), str(segments[1])]


static func _path_segments(path: String) -> Array:
	var segments := []
	for raw_segment in path.split("/", false):
		var segment := str(raw_segment).strip_edges()
		if not segment.is_empty():
			segments.append(segment)
	return segments
