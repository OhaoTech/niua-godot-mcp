@tool
extends RefCounted

const NiuaMcpRuntimeProbeNodeLookup = preload("niua_mcp_runtime_probe_node_lookup.gd")
const NiuaMcpRuntimeProbeProtocol = preload("niua_mcp_runtime_probe_protocol.gd")
const NiuaMcpRuntimeProbeVariantCodec = preload("niua_mcp_runtime_probe_variant_codec.gd")

const MAX_PROPERTIES_PER_NODE := NiuaMcpRuntimeProbeProtocol.MAX_PROPERTIES_PER_NODE


static func node_properties(probe: Node, request: Dictionary) -> Dictionary:
	var node_path := str(request.get("nodePath", ""))
	var request_id := str(request.get("requestId", ""))
	var node := NiuaMcpRuntimeProbeNodeLookup.find_node(probe, node_path)
	if node == null:
		return {
			"requestId": request_id,
			"nodePath": node_path,
			"exists": false,
			"error": "node not found"
		}

	var properties := []
	for property in node.get_property_list():
		if properties.size() >= MAX_PROPERTIES_PER_NODE:
			break

		var name := str(property.get("name", ""))
		if name.is_empty():
			continue

		var value = node.get(name)
		var type_id := int(property.get("type", typeof(value)))
		properties.append({
			"name": name,
			"type": type_string(type_id),
			"typeId": type_id,
			"usage": int(property.get("usage", 0)),
			"hint": int(property.get("hint", 0)),
			"hintString": str(property.get("hint_string", "")),
			"value": NiuaMcpRuntimeProbeVariantCodec.variant_to_json(value)
		})

	return {
		"requestId": request_id,
		"nodePath": node_path,
		"exists": true,
		"name": node.name,
		"type": node.get_class(),
		"sceneFilePath": node.scene_file_path,
		"propertyCount": properties.size(),
		"properties": properties
	}
