@tool
extends RefCounted

const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")


static func create_navigation_agent_3d(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var root := NiuaMcpSceneNodeContext.edited_scene_root(editor)
	if root == null:
		return NiuaMcpSceneNodeContext.error("no edited scene is open")

	var parent_path := str(body.get("parentPath", ""))
	var parent := NiuaMcpSceneNodeContext.resolve_node(editor, parent_path)
	if parent == null:
		return NiuaMcpSceneNodeContext.error("parent node not found: %s" % parent_path, "not_found")
	if not (parent is Node3D):
		return NiuaMcpSceneNodeContext.error("parent node is not a Node3D: %s" % parent_path)

	var agent := NavigationAgent3D.new()
	agent.name = str(body.get("name", "NavigationAgent3D"))
	_apply_agent_settings(agent, body)

	parent.add_child(agent)
	agent.owner = root

	return {
		"ok": true,
		"data": agent_snapshot(editor, agent, parent)
	}


static func agent_snapshot(editor: EditorInterface, agent: NavigationAgent3D, parent: Node) -> Dictionary:
	return {
		"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, agent),
		"name": agent.name,
		"type": agent.get_class(),
		"parentPath": NiuaMcpSceneNodeContext.node_path_for_response(editor, parent),
		"radius": agent.get("radius"),
		"height": agent.get("height"),
		"pathDesiredDistance": agent.get("path_desired_distance"),
		"targetDesiredDistance": agent.get("target_desired_distance"),
		"pathMaxDistance": agent.get("path_max_distance"),
		"maxSpeed": agent.get("max_speed"),
		"targetPosition": _vector3_to_json(agent.get("target_position"))
	}


static func _apply_agent_settings(agent: NavigationAgent3D, body: Dictionary) -> void:
	if body.has("radius"):
		agent.set("radius", float(body.get("radius")))
	if body.has("height"):
		agent.set("height", float(body.get("height")))
	if body.has("pathDesiredDistance"):
		agent.set("path_desired_distance", float(body.get("pathDesiredDistance")))
	if body.has("targetDesiredDistance"):
		agent.set("target_desired_distance", float(body.get("targetDesiredDistance")))
	if body.has("pathMaxDistance"):
		agent.set("path_max_distance", float(body.get("pathMaxDistance")))
	if body.has("maxSpeed"):
		agent.set("max_speed", float(body.get("maxSpeed")))
	if body.has("targetPosition"):
		agent.set("target_position", _vector3_from_json(body.get("targetPosition"), Vector3.ZERO))


static func _vector3_from_json(value, fallback: Vector3) -> Vector3:
	if value is Vector3:
		return value
	if typeof(value) != TYPE_DICTIONARY:
		return fallback
	return Vector3(float(value.get("x", fallback.x)), float(value.get("y", fallback.y)), float(value.get("z", fallback.z)))


static func _vector3_to_json(value) -> Dictionary:
	if not (value is Vector3):
		return {
			"type": "Vector3",
			"x": 0.0,
			"y": 0.0,
			"z": 0.0
		}
	return {
		"type": "Vector3",
		"x": value.x,
		"y": value.y,
		"z": value.z
	}
