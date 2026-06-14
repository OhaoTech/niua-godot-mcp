@tool
extends RefCounted

const NiuaMcpParticlesMaterialOperations = preload("niua_mcp_particles_material_operations.gd")
const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")


static func set_particles_emitting(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var node := NiuaMcpParticlesMaterialOperations.resolve_particles_node(editor, str(body.get("nodePath", "")))
	if node == null:
		return NiuaMcpSceneNodeContext.error("particles node not found: %s" % str(body.get("nodePath", "")), "not_found")

	if body.has("oneShot"):
		node.set("one_shot", bool(body.get("oneShot")))
	if body.has("emitting"):
		node.set("emitting", bool(body.get("emitting")))
	if bool(body.get("restart", false)) and node.has_method("restart"):
		node.restart()

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, node),
			"type": node.get_class(),
			"emitting": node.get("emitting"),
			"oneShot": node.get("one_shot"),
			"restarted": bool(body.get("restart", false))
		}
	}
