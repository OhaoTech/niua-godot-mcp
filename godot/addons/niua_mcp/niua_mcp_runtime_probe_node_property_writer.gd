@tool
extends RefCounted

const NiuaMcpRuntimeProbeNodeLookup = preload("niua_mcp_runtime_probe_node_lookup.gd")
const NiuaMcpRuntimeProbeVariantCodec = preload("niua_mcp_runtime_probe_variant_codec.gd")


static func set_node_property(probe: Node, request: Dictionary) -> Dictionary:
	var node_path := str(request.get("nodePath", ""))
	var request_id := str(request.get("requestId", ""))
	var property_name := str(request.get("property", ""))
	var node := NiuaMcpRuntimeProbeNodeLookup.find_node(probe, node_path)
	if node == null:
		return {
			"requestId": request_id,
			"nodePath": node_path,
			"property": property_name,
			"exists": false,
			"set": false,
			"error": "node not found"
		}

	if property_name.is_empty():
		return {
			"requestId": request_id,
			"nodePath": node_path,
			"property": property_name,
			"exists": true,
			"set": false,
			"error": "property name is required"
		}

	if not has_property(node, property_name):
		return {
			"requestId": request_id,
			"nodePath": node_path,
			"property": property_name,
			"exists": true,
			"set": false,
			"error": "property not found"
		}

	var raw_value = request.get("value")
	var declared_type := property_type(node, property_name)

	# A schema-untyped value can arrive as a raw string. Parse JSON-looking strings
	# back to structure and coerce a scalar string to the property's declared type —
	# UNLESS the property is itself a string, where the text must be kept verbatim.
	# Mirrors the editor path (niua_mcp_scene_property_operations.gd).
	var decoded
	if (declared_type == TYPE_STRING or declared_type == TYPE_STRING_NAME) and typeof(raw_value) == TYPE_STRING:
		decoded = raw_value
	else:
		decoded = NiuaMcpRuntimeProbeVariantCodec.json_to_variant(raw_value)
		decoded = NiuaMcpRuntimeProbeVariantCodec.coerce_to_declared_type(decoded, declared_type)

	# For an Object/Resource-typed property, a non-null caller value that failed to
	# resolve to an Object would otherwise be written as null (or silently no-op)
	# and reported as success. Reject it so the failure is visible.
	if declared_type == TYPE_OBJECT and raw_value != null and not (decoded is Object):
		return {
			"requestId": request_id,
			"nodePath": node_path,
			"property": property_name,
			"exists": true,
			"set": false,
			"error": "could not resolve a value for Object/Resource property '%s'; the runtime probe cannot construct Objects — set it in the editor scene with set_node_property instead" % property_name
		}

	var before_value = node.get(property_name)
	node.set(property_name, decoded)
	var after_value = node.get(property_name)
	return {
		"requestId": request_id,
		"nodePath": node_path,
		"property": property_name,
		"exists": true,
		"set": true,
		"beforeValue": NiuaMcpRuntimeProbeVariantCodec.variant_to_json(before_value),
		"value": NiuaMcpRuntimeProbeVariantCodec.variant_to_json(after_value),
		"valueType": type_string(typeof(after_value))
	}


static func has_property(node: Node, property_name: String) -> bool:
	for property in node.get_property_list():
		if str(property.get("name", "")) == property_name:
			return true
	return false


static func property_type(node: Node, property_name: String) -> int:
	for property in node.get_property_list():
		if str(property.get("name", "")) == property_name:
			return int(property.get("type", TYPE_NIL))
	return TYPE_NIL
