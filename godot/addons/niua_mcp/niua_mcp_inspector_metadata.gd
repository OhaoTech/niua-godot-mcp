@tool
extends RefCounted

const NiuaMcpInspectorMetadataBuilder = preload("niua_mcp_inspector_metadata_builder.gd")
const NiuaMcpInspectorMetadataControl = preload("niua_mcp_inspector_metadata_control.gd")
const NiuaMcpInspectorMetadataFileMode = preload("niua_mcp_inspector_metadata_file_mode.gd")
const NiuaMcpInspectorMetadataHintParser = preload("niua_mcp_inspector_metadata_hint_parser.gd")


static func property_editor_metadata(property: Dictionary, section_kind: String) -> Dictionary:
	return NiuaMcpInspectorMetadataBuilder.property_editor_metadata(property, section_kind)


static func property_editor_control(declared_type: int, hint: int, section_kind: String) -> String:
	return NiuaMcpInspectorMetadataControl.property_editor_control(declared_type, hint, section_kind)


static func parse_property_range_hint(hint_string: String) -> Dictionary:
	return NiuaMcpInspectorMetadataHintParser.parse_property_range_hint(hint_string)


static func parse_property_options_hint(hint_string: String) -> Array:
	return NiuaMcpInspectorMetadataHintParser.parse_property_options_hint(hint_string)


static func property_file_mode(hint: int) -> String:
	return NiuaMcpInspectorMetadataFileMode.property_file_mode(hint)


static func split_hint_tokens(hint_string: String) -> Array:
	return NiuaMcpInspectorMetadataHintParser.split_hint_tokens(hint_string)
