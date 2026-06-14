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

	var before_value = node.get(property_name)
	node.set(property_name, NiuaMcpRuntimeProbeVariantCodec.json_to_variant(request.get("value")))
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
