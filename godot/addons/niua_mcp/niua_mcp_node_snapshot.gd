@tool
extends RefCounted


static func selection_item(node: Node, root: Node, selected_index: int = -1) -> Dictionary:
	var parent := node.get_parent()
	var owner := node.owner
	return {
		"name": node.name,
		"path": node_path_for_response(node, root),
		"type": node.get_class(),
		"sceneFilePath": node.scene_file_path,
		"selectedIndex": selected_index,
		"parentPath": node_path_for_response(parent, root) if parent != null else "",
		"siblingIndex": node.get_index(),
		"childCount": node.get_child_count(),
		"ownerPath": node_path_for_response(owner, root) if owner != null else "",
		"ownerSceneFilePath": owner.scene_file_path if owner != null else "",
		"groups": node_groups(node),
		"metadataKeys": node_metadata_keys(node),
		"uniqueNameInOwner": node.unique_name_in_owner
	}


static func node_groups(node: Node) -> Array:
	var groups := []
	for raw_group in node.get_groups():
		groups.append(str(raw_group))
	groups.sort()
	return groups


static func node_metadata_keys(node: Node) -> Array:
	var keys := []
	for raw_key in node.get_meta_list():
		keys.append(str(raw_key))
	keys.sort()
	return keys


static func node_path_for_response(node: Node, root: Node) -> String:
	if node == null or root == null or node == root:
		return ""
	return str(root.get_path_to(node))


static func serialize_node(node: Node, root: Node, max_depth: int = 0, depth: int = 0) -> Dictionary:
	# max_depth 0 = unlimited. At the limit children are elided and
	# "childrenTruncated" carries the count, so large scenes can be read
	# shallowly without paying for the whole tree (token diet).
	var result := {
		"name": node.name,
		"path": node_path_for_response(node, root),
		"type": node.get_class(),
		"sceneFilePath": node.scene_file_path
	}

	if max_depth > 0 and depth >= max_depth:
		result["children"] = []
		if node.get_child_count() > 0:
			result["childrenTruncated"] = node.get_child_count()
		return result

	var children := []
	for child in node.get_children():
		children.append(serialize_node(child, root, max_depth, depth + 1))
	result["children"] = children
	return result


static func sibling_order(parent: Node) -> Array:
	var order := []
	for child in parent.get_children():
		order.append(child.name)
	return order
