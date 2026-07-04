@tool
extends RefCounted

const NiuaMcpSceneGraphContext = preload("niua_mcp_scene_graph_context.gd")
const NiuaMcpSceneGraphUtils = preload("niua_mcp_scene_graph_utils.gd")
const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")


static func set_node_property_with_side_effects(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable) -> Dictionary:
	var response := set_node_property(editor, body, path_validator)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneGraphUtils.remember(remember, "Set %s on %s" % [str(data.get("property", "")), str(data.get("nodePath", ""))])
	return response


static func set_node_property(editor: EditorInterface, body: Dictionary, path_validator: Callable) -> Dictionary:
	var node := NiuaMcpSceneGraphContext.resolve_node(editor, str(body.get("nodePath", "")))
	if node == null:
		return NiuaMcpSceneGraphUtils.error("node not found: %s (call get_scene_tree to list valid node paths)" % str(body.get("nodePath", "")), "not_found")

	var property_name := str(body.get("property", ""))
	if property_name.is_empty():
		return NiuaMcpSceneGraphUtils.error("property name is required")

	# Object.set() silently no-ops on an unknown property, so a typo or wrong
	# casing would otherwise return ok:true having changed nothing. Reject it.
	if not NiuaMcpSceneGraphUtils.object_has_property(node, property_name):
		return NiuaMcpSceneGraphUtils.error("node has no property '%s': %s (call get_inspector_properties on this node to list valid properties)" % [property_name, str(body.get("nodePath", ""))], "unknown_property")

	var raw_value = body.get("value")
	var declared_type := NiuaMcpSceneGraphUtils.property_type(node, property_name)

	# A schema-untyped value can arrive as a raw string. Parse JSON-looking strings
	# back to structure and coerce a scalar string to the property's declared type —
	# UNLESS the property is itself a string, where the text must be kept verbatim.
	var decoded
	if (declared_type == TYPE_STRING or declared_type == TYPE_STRING_NAME) and typeof(raw_value) == TYPE_STRING:
		decoded = raw_value
	else:
		decoded = NiuaMcpVariantCodec.json_to_variant(raw_value, path_validator)
		decoded = NiuaMcpVariantCodec.coerce_to_declared_type(decoded, declared_type)

	# For an Object/Resource-typed property, a non-null caller value that failed to
	# resolve to an Object (unresolved res:// path, unknown type) would otherwise be
	# written as null and reported as success. Reject it so the failure is visible.
	if declared_type == TYPE_OBJECT and raw_value != null and not (decoded is Object):
		return NiuaMcpSceneGraphUtils.error("could not resolve a value for Object/Resource property '%s'; check the res:// path with list_filesystem or create it with create_resource first" % property_name, "invalid_value")

	node.set(property_name, decoded)

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneGraphContext.node_path_for_response(editor, node),
			"property": property_name,
			"value": NiuaMcpVariantCodec.variant_to_json(node.get(property_name))
		}
	}
