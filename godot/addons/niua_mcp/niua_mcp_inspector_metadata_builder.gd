@tool
extends RefCounted

const NiuaMcpInspectorMetadataControl = preload("niua_mcp_inspector_metadata_control.gd")
const NiuaMcpInspectorMetadataFileMode = preload("niua_mcp_inspector_metadata_file_mode.gd")
const NiuaMcpInspectorMetadataHintParser = preload("niua_mcp_inspector_metadata_hint_parser.gd")


static func property_editor_metadata(property: Dictionary, section_kind: String) -> Dictionary:
	var declared_type := int(property.get("type", TYPE_NIL))
	var hint := int(property.get("hint", PROPERTY_HINT_NONE))
	var hint_string := str(property.get("hint_string", ""))
	var usage := int(property.get("usage", 0))
	var metadata := {
		"control": NiuaMcpInspectorMetadataControl.property_editor_control(declared_type, hint, section_kind),
		"declaredType": declared_type,
		"hint": hint,
		"hintString": hint_string,
		"readOnly": (usage & PROPERTY_USAGE_READ_ONLY) != 0
	}

	if section_kind != "property":
		metadata["section"] = section_kind
		return metadata

	match hint:
		PROPERTY_HINT_RANGE:
			metadata["range"] = NiuaMcpInspectorMetadataHintParser.parse_property_range_hint(hint_string)
		PROPERTY_HINT_ENUM, PROPERTY_HINT_FLAGS:
			metadata["options"] = NiuaMcpInspectorMetadataHintParser.parse_property_options_hint(hint_string)
		PROPERTY_HINT_FILE, PROPERTY_HINT_GLOBAL_FILE, PROPERTY_HINT_SAVE_FILE, PROPERTY_HINT_GLOBAL_SAVE_FILE:
			metadata["fileMode"] = NiuaMcpInspectorMetadataFileMode.property_file_mode(hint)
			if not hint_string.is_empty():
				metadata["filters"] = hint_string
		PROPERTY_HINT_DIR, PROPERTY_HINT_GLOBAL_DIR:
			metadata["fileMode"] = NiuaMcpInspectorMetadataFileMode.property_file_mode(hint)
		PROPERTY_HINT_RESOURCE_TYPE:
			if not hint_string.is_empty():
				metadata["resourceType"] = hint_string
		PROPERTY_HINT_NODE_PATH_VALID_TYPES:
			metadata["validNodeTypes"] = NiuaMcpInspectorMetadataHintParser.split_hint_tokens(hint_string)
		PROPERTY_HINT_PLACEHOLDER_TEXT:
			if not hint_string.is_empty():
				metadata["placeholder"] = hint_string

	return metadata
