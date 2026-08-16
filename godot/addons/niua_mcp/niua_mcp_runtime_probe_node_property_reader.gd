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

	var allowlist := _property_allowlist(request)
	var verbose := bool(request.get("verbose", false))
	var properties := []
	var total_considered := 0
	for property in node.get_property_list():
		var name := str(property.get("name", ""))
		if name.is_empty():
			continue
		if not _include_property(property, allowlist, verbose):
			continue
		total_considered += 1
		if properties.size() >= MAX_PROPERTIES_PER_NODE:
			continue

		var value = node.get(name)
		var type_id := int(property.get("type", typeof(value)))
		var entry := {
			"name": name,
			"type": type_string(type_id),
			"value": NiuaMcpRuntimeProbeVariantCodec.variant_to_json(value)
		}
		if verbose:
			entry["typeId"] = type_id
			entry["usage"] = int(property.get("usage", 0))
			entry["hint"] = int(property.get("hint", 0))
			entry["hintString"] = str(property.get("hint_string", ""))
		properties.append(entry)

	if not allowlist.is_empty():
		_append_missing_allowlist_properties(node, allowlist, properties, verbose)
		total_considered = maxi(total_considered, properties.size())

	var data := {
		"requestId": request_id,
		"nodePath": node_path,
		"exists": true,
		"name": node.name,
		"type": node.get_class(),
		"sceneFilePath": node.scene_file_path,
		"propertyMode": "allowlist" if not allowlist.is_empty() else ("verbose" if verbose else "script_variables"),
		"propertyCount": properties.size(),
		"totalPropertyCount": total_considered,
		"properties": properties
	}
	if properties.is_empty() and allowlist.is_empty() and not verbose:
		data["hint"] = "no script variables on this node; pass properties: [\"visible\"] or verbose:true for engine fields"
	return data


static func _property_allowlist(request: Dictionary) -> Dictionary:
	var allow := {}
	var raw = request.get("properties", null)
	if typeof(raw) == TYPE_ARRAY:
		for item in raw:
			var name := str(item).strip_edges()
			if not name.is_empty():
				allow[name] = true
	elif typeof(raw) == TYPE_STRING and not str(raw).strip_edges().is_empty():
		for item in str(raw).split(",", false):
			var name := item.strip_edges()
			if not name.is_empty():
				allow[name] = true
	return allow


static func _include_property(property: Dictionary, allowlist: Dictionary, verbose: bool) -> bool:
	var name := str(property.get("name", ""))
	if not allowlist.is_empty():
		return allowlist.has(name)
	var usage := int(property.get("usage", 0))
	if usage & PROPERTY_USAGE_CATEGORY or usage & PROPERTY_USAGE_GROUP or usage & PROPERTY_USAGE_SUBGROUP:
		return false
	if usage & PROPERTY_USAGE_INTERNAL:
		return false
	if verbose:
		return (usage & PROPERTY_USAGE_EDITOR) != 0 or (usage & PROPERTY_USAGE_SCRIPT_VARIABLE) != 0
	return (usage & PROPERTY_USAGE_SCRIPT_VARIABLE) != 0


static func _append_missing_allowlist_properties(node: Node, allowlist: Dictionary, properties: Array, verbose: bool) -> void:
	var seen := {}
	for entry in properties:
		seen[str(entry.get("name", ""))] = true
	for raw_name in allowlist.keys():
		var name := str(raw_name)
		if name.is_empty() or seen.has(name):
			continue
		if properties.size() >= MAX_PROPERTIES_PER_NODE:
			return
		if not name in node:
			continue
		var value = node.get(name)
		var entry := {
			"name": name,
			"type": type_string(typeof(value)),
			"value": NiuaMcpRuntimeProbeVariantCodec.variant_to_json(value)
		}
		if verbose:
			entry["typeId"] = typeof(value)
		properties.append(entry)
