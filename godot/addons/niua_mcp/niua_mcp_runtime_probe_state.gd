@tool
extends RefCounted

const NiuaMcpRuntimeProbeProtocol = preload("niua_mcp_runtime_probe_protocol.gd")

const MAX_CHILDREN_PER_NODE := NiuaMcpRuntimeProbeProtocol.MAX_CHILDREN_PER_NODE
const MAX_TREE_DEPTH := NiuaMcpRuntimeProbeProtocol.MAX_TREE_DEPTH


static func runtime_state(probe: Node, kind: String) -> Dictionary:
	var tree := probe.get_tree()
	var root := tree.root if tree != null else null
	var current_scene := tree.current_scene if tree != null else null
	return {
		"kind": kind,
		"timeMsec": Time.get_ticks_msec(),
		"currentScene": current_scene.scene_file_path if current_scene != null else "",
		"root": serialize_node(root, 0)
	}


static func serialize_node(node: Node, depth: int) -> Dictionary:
	if node == null:
		return {}

	var children := []
	var total_children := 0
	for child in node.get_children():
		total_children += 1
		if depth < MAX_TREE_DEPTH and children.size() < MAX_CHILDREN_PER_NODE:
			children.append(serialize_node(child, depth + 1))

	var node_path := str(node.get_path()) if node.is_inside_tree() else ""

	return {
		"name": node.name,
		"path": node_path,
		"type": node.get_class(),
		"sceneFilePath": node.scene_file_path,
		"childCount": total_children,
		"children": children
	}
