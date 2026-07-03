@tool
extends RefCounted

const NiuaMcpInspectorMetadata = preload("niua_mcp_inspector_metadata.gd")
const NiuaMcpPropertyMetadata = preload("niua_mcp_property_metadata.gd")
const NiuaMcpSceneGraphContext = preload("niua_mcp_scene_graph_context.gd")
const NiuaMcpSceneGraphUtils = preload("niua_mcp_scene_graph_utils.gd")
const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")


static func inspector_properties(editor: EditorInterface, query: Dictionary) -> Dictionary:
	var node := NiuaMcpSceneGraphContext.node_for_inspector(editor, str(query.get("nodePath", "")))
	if node == null:
		return NiuaMcpSceneGraphUtils.error("inspector node not found", "not_found")

	# Token diet: compact name/type/value entries by default; verbose=true restores
	# the full editor metadata. A "properties" CSV allowlist narrows to named props.
	var verbose := str(query.get("verbose", "false")).to_lower() == "true"
	var allowlist := PackedStringArray()
	var raw_allowlist := str(query.get("properties", ""))
	if not raw_allowlist.is_empty():
		for raw_name in raw_allowlist.split(",", false):
			allowlist.append(raw_name.strip_edges())

	var properties := []
	for property in node.get_property_list():
		var usage := int(property.get("usage", 0))
		var is_editor_visible := (usage & PROPERTY_USAGE_EDITOR) != 0
		var is_category := (usage & PROPERTY_USAGE_CATEGORY) != 0
		var is_group := (usage & PROPERTY_USAGE_GROUP) != 0
		var is_subgroup := (usage & PROPERTY_USAGE_SUBGROUP) != 0
		if not is_editor_visible and not is_category and not is_group and not is_subgroup:
			continue

		var property_name := str(property.get("name", ""))
		if property_name.is_empty():
			continue
		if not allowlist.is_empty() and not allowlist.has(property_name):
			continue

		var section_kind := "property"
		if is_category:
			section_kind = "category"
		elif is_group:
			section_kind = "group"
		elif is_subgroup:
			section_kind = "subgroup"

		var is_section := section_kind != "property"
		if is_section and not verbose:
			continue

		var value = null
		var value_type := "Nil"
		var can_revert := false
		var revert_value = null
		if not is_section:
			value = node.get(property_name)
			value_type = NiuaMcpVariantCodec.variant_type_name(value)
			can_revert = node.property_can_revert(property_name)
			if can_revert:
				revert_value = NiuaMcpVariantCodec.variant_to_json(node.property_get_revert(property_name))

		if not verbose:
			properties.append({
				"name": property_name,
				"type": value_type,
				"value": NiuaMcpVariantCodec.variant_to_json(value)
			})
			continue

		properties.append({
			"name": property_name,
			"type": value_type,
			"value": NiuaMcpVariantCodec.variant_to_json(value),
			"declaredType": int(property.get("type", TYPE_NIL)),
			"hint": int(property.get("hint", 0)),
			"hintString": str(property.get("hint_string", "")),
			"usage": usage,
			"usageFlags": NiuaMcpPropertyMetadata.usage_flags(usage),
			"sectionKind": section_kind,
			"isEditorVisible": is_editor_visible,
			"isCategory": is_category,
			"isGroup": is_group,
			"isSubgroup": is_subgroup,
			"isReadOnly": (usage & PROPERTY_USAGE_READ_ONLY) != 0,
			"editor": NiuaMcpInspectorMetadata.property_editor_metadata(property, section_kind),
			"canRevert": can_revert,
			"revertValue": revert_value
		})

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneGraphContext.node_path_for_response(editor, node),
			"type": node.get_class(),
			"verbose": verbose,
			"properties": properties
		}
	}
