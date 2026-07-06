@tool
extends RefCounted

const NiuaMcpRuntimeProbeNodeLookup = preload("niua_mcp_runtime_probe_node_lookup.gd")
const NiuaMcpRuntimeProbeProtocol = preload("niua_mcp_runtime_probe_protocol.gd")

const MAX_CHILDREN_PER_NODE := NiuaMcpRuntimeProbeProtocol.MAX_CHILDREN_PER_NODE
const MAX_TREE_DEPTH := NiuaMcpRuntimeProbeProtocol.MAX_TREE_DEPTH


static func runtime_state(probe: Node, kind: String, max_depth: int = 0, path_filter: String = "", request_id: String = "") -> Dictionary:
	var tree := probe.get_tree()
	var root := tree.root if tree != null else null
	var current_scene := tree.current_scene if tree != null else null
	var current_scene_path := current_scene.scene_file_path if current_scene != null else ""

	# Token diet: pathFilter serializes only the subtree rooted at a live node
	# path, mirroring the editor-side get_scene_tree pathFilter. An unknown
	# path fails loudly instead of returning the full tree.
	var subtree_root: Node = root
	if root != null and not path_filter.is_empty():
		subtree_root = NiuaMcpRuntimeProbeNodeLookup.find_node(probe, path_filter)
		if subtree_root == null:
			return {
				"kind": kind,
				"requestId": request_id,
				"timeMsec": Time.get_ticks_msec(),
				"currentScene": current_scene_path,
				"error": "pathFilter node not found: %s (call get_runtime_node_properties to inspect live node paths)" % path_filter
			}

	# requestId correlates a requested snapshot with its response so the editor
	# store can tell "the snapshot you asked for" from whatever state was
	# already cached (the boot-time ready state has no requestId).
	return {
		"kind": kind,
		"requestId": request_id,
		"timeMsec": Time.get_ticks_msec(),
		"currentScene": current_scene_path,
		"root": serialize_node(subtree_root, 0, max_depth)
	}


static func serialize_node(node: Node, depth: int, max_depth: int = 0) -> Dictionary:
	# max_depth 0 = unlimited (still bounded by MAX_TREE_DEPTH). When children
	# are elided, "childrenTruncated" carries the child count, mirroring the
	# editor-side scene-tree serializer, so large runtime trees can be read
	# shallowly without paying for the whole tree (token diet).
	if node == null:
		return {}

	var depth_limit := MAX_TREE_DEPTH
	if max_depth > 0:
		depth_limit = mini(max_depth, MAX_TREE_DEPTH)

	var children := []
	var total_children := 0
	for child in node.get_children():
		total_children += 1
		if depth < depth_limit and children.size() < MAX_CHILDREN_PER_NODE:
			children.append(serialize_node(child, depth + 1, max_depth))

	var node_path := str(node.get_path()) if node.is_inside_tree() else ""

	var result := {
		"name": node.name,
		"path": node_path,
		"type": node.get_class(),
		"sceneFilePath": node.scene_file_path,
		"childCount": total_children,
		"children": children
	}
	if total_children > children.size():
		result["childrenTruncated"] = total_children
	return result
