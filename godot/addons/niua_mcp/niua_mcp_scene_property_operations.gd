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
		return NiuaMcpSceneGraphUtils.error("node not found: %s" % str(body.get("nodePath", "")), "not_found")

	var property_name := str(body.get("property", ""))
	if property_name.is_empty():
		return NiuaMcpSceneGraphUtils.error("property name is required")

	node.set(property_name, NiuaMcpVariantCodec.json_to_variant(body.get("value"), path_validator))

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneGraphContext.node_path_for_response(editor, node),
			"property": property_name,
			"value": NiuaMcpVariantCodec.variant_to_json(node.get(property_name))
		}
	}
