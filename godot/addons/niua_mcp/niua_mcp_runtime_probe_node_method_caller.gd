@tool
extends RefCounted

# Validates and invokes a method on a live runtime node on behalf of the NIUA
# runtime probe. The node must exist AND expose the method — both failures
# return explicit errors naming get_runtime_node_properties instead of
# silently no-oping.

const NiuaMcpRuntimeProbeNodeLookup = preload("niua_mcp_runtime_probe_node_lookup.gd")
const NiuaMcpRuntimeProbeVariantCodec = preload("niua_mcp_runtime_probe_variant_codec.gd")


static func call_node_method(probe: Node, request: Dictionary) -> Dictionary:
	var node_path := str(request.get("nodePath", ""))
	var request_id := str(request.get("requestId", ""))
	var method_name := str(request.get("method", ""))

	var node := NiuaMcpRuntimeProbeNodeLookup.find_node(probe, node_path)
	if node == null:
		return {
			"requestId": request_id,
			"nodePath": node_path,
			"method": method_name,
			"exists": false,
			"called": false,
			"error": "node not found (call get_runtime_node_properties to inspect live node paths)"
		}

	if method_name.is_empty():
		return {
			"requestId": request_id,
			"nodePath": node_path,
			"method": method_name,
			"exists": true,
			"called": false,
			"error": "method name is required"
		}

	if not node.has_method(method_name):
		return {
			"requestId": request_id,
			"nodePath": node_path,
			"method": method_name,
			"exists": true,
			"called": false,
			"error": "node has no method: %s (call get_runtime_node_properties on %s to inspect the live node)" % [method_name, node_path]
		}

	var raw_args = request.get("args", [])
	if raw_args == null:
		raw_args = []
	if typeof(raw_args) != TYPE_ARRAY:
		return {
			"requestId": request_id,
			"nodePath": node_path,
			"method": method_name,
			"exists": true,
			"called": false,
			"error": "args must be an array"
		}

	var converted_args := []
	for raw_arg in raw_args:
		converted_args.append(NiuaMcpRuntimeProbeVariantCodec.json_to_variant(raw_arg))

	var result = node.callv(method_name, converted_args)

	return {
		"requestId": request_id,
		"nodePath": node_path,
		"method": method_name,
		"exists": true,
		"called": true,
		"returnValue": _serialize_return(result),
		"returnType": type_string(typeof(result))
	}


# Objects never serialize whole: return the class name plus scene/resource
# path only, so a method that returns a node or resource cannot flood the
# response with a serialized object graph.
static func _serialize_return(value):
	if typeof(value) != TYPE_OBJECT:
		return NiuaMcpRuntimeProbeVariantCodec.variant_to_json(value)
	if value == null:
		return null
	var summary := {
		"type": value.get_class()
	}
	if value is Node:
		summary["path"] = str((value as Node).get_path())
	elif value is Resource:
		summary["resourcePath"] = (value as Resource).resource_path
	return summary
