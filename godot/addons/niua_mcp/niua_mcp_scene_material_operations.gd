@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpSceneGraphContext = preload("niua_mcp_scene_graph_context.gd")
const NiuaMcpSceneGraphUtils = preload("niua_mcp_scene_graph_utils.gd")


static func assign_material_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := assign_material(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneGraphUtils.remember(remember, "Assigned material %s to %s" % [str(data.get("materialPath", "")), str(data.get("nodePath", ""))])
	return response


static func assign_material(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var node := NiuaMcpSceneGraphContext.resolve_node(editor, str(body.get("nodePath", "")))
	if node == null:
		return NiuaMcpSceneGraphUtils.error("node not found: %s" % str(body.get("nodePath", "")), "not_found")

	var validation := NiuaMcpPathUtils.validate_res_path(str(body.get("materialPath", "")))
	if not validation.get("ok", false):
		return validation

	var material_path := str(validation.get("path"))
	if not FileAccess.file_exists(material_path) and not ResourceLoader.exists(material_path):
		return NiuaMcpSceneGraphUtils.error("material not found: %s" % material_path, "not_found")

	var resource := ResourceLoader.load(material_path, "", ResourceLoader.CACHE_MODE_IGNORE)
	if resource == null or not (resource is Material):
		return NiuaMcpSceneGraphUtils.error("resource is not a Material: %s" % material_path)

	var material := resource as Material
	var assignment := "material_override"
	var surface_index := -1
	var response_surface_index = null
	if body.has("surfaceIndex"):
		surface_index = int(body.get("surfaceIndex", -1))
		if surface_index < 0:
			return NiuaMcpSceneGraphUtils.error("surfaceIndex must be zero or greater")
		if not node.has_method("set_surface_override_material"):
			return NiuaMcpSceneGraphUtils.error("node does not support surface material overrides: %s" % NiuaMcpSceneGraphContext.node_path_for_response(editor, node))
		node.call("set_surface_override_material", surface_index, material)
		assignment = "surface_override"
		response_surface_index = surface_index
	elif NiuaMcpSceneGraphUtils.object_has_property(node, "material_override"):
		node.set("material_override", material)
	else:
		return NiuaMcpSceneGraphUtils.error("node does not expose material_override: %s" % NiuaMcpSceneGraphContext.node_path_for_response(editor, node))

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneGraphContext.node_path_for_response(editor, node),
			"materialPath": material_path,
			"assignment": assignment,
			"surfaceIndex": response_surface_index
		}
	}
