@tool
extends RefCounted

const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")


static func create_navigation_region_3d(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var root := NiuaMcpSceneNodeContext.edited_scene_root(editor)
	if root == null:
		return NiuaMcpSceneNodeContext.error("no edited scene is open")

	var parent: Node = root
	var parent_path := str(body.get("parentPath", ""))
	if not parent_path.is_empty():
		parent = NiuaMcpSceneNodeContext.resolve_node(editor, parent_path)
		if parent == null:
			return NiuaMcpSceneNodeContext.error("parent node not found: %s" % parent_path, "not_found")

	var region := NavigationRegion3D.new()
	region.name = str(body.get("name", "NavigationRegion3D"))
	region.set("enabled", bool(body.get("enabled", true)))

	var navmesh := NavigationMesh.new()
	_apply_navmesh_settings(navmesh, body)
	region.navigation_mesh = navmesh

	parent.add_child(region)
	region.owner = root

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, region),
			"name": region.name,
			"type": region.get_class(),
			"parentPath": NiuaMcpSceneNodeContext.node_path_for_response(editor, parent),
			"navigationMesh": navmesh_snapshot(navmesh)
		}
	}


static func bake_navigation_mesh_3d(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var region := _resolve_region(editor, str(body.get("regionPath", "")))
	if region == null:
		return NiuaMcpSceneNodeContext.error("NavigationRegion3D not found: %s" % str(body.get("regionPath", "")), "not_found")

	if region.navigation_mesh == null:
		region.navigation_mesh = NavigationMesh.new()

	var on_thread := bool(body.get("onThread", false))
	if region.has_method("bake_navigation_mesh"):
		region.bake_navigation_mesh(on_thread)
	else:
		return NiuaMcpSceneNodeContext.error("NavigationRegion3D does not expose bake_navigation_mesh")

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, region),
			"baked": true,
			"onThread": on_thread,
			"navigationMesh": navmesh_snapshot(region.navigation_mesh)
		}
	}


static func _apply_navmesh_settings(navmesh: NavigationMesh, body: Dictionary) -> void:
	if body.has("cellSize"):
		navmesh.set("cell_size", float(body.get("cellSize")))
	if body.has("cellHeight"):
		navmesh.set("cell_height", float(body.get("cellHeight")))
	if body.has("agentRadius"):
		navmesh.set("agent_radius", float(body.get("agentRadius")))
	if body.has("agentHeight"):
		navmesh.set("agent_height", float(body.get("agentHeight")))
	if body.has("agentMaxClimb"):
		navmesh.set("agent_max_climb", float(body.get("agentMaxClimb")))
	if body.has("agentMaxSlope"):
		navmesh.set("agent_max_slope", float(body.get("agentMaxSlope")))
	if body.has("sourceGeometryMode"):
		navmesh.set("geometry_source_geometry_mode", int(body.get("sourceGeometryMode")))
	if body.has("parsedGeometryType"):
		navmesh.set("parsed_geometry_type", int(body.get("parsedGeometryType")))


static func navmesh_snapshot(navmesh: NavigationMesh) -> Dictionary:
	if navmesh == null:
		return {}
	var vertex_count := 0
	if navmesh.has_method("get_vertices"):
		var vertices = navmesh.get_vertices()
		if vertices != null:
			vertex_count = vertices.size()

	var polygon_count := 0
	if navmesh.has_method("get_polygon_count"):
		polygon_count = int(navmesh.get_polygon_count())

	return {
		"cellSize": navmesh.get("cell_size"),
		"cellHeight": navmesh.get("cell_height"),
		"agentRadius": navmesh.get("agent_radius"),
		"agentHeight": navmesh.get("agent_height"),
		"agentMaxClimb": navmesh.get("agent_max_climb"),
		"agentMaxSlope": navmesh.get("agent_max_slope"),
		"vertexCount": vertex_count,
		"polygonCount": polygon_count
	}


static func _resolve_region(editor: EditorInterface, node_path: String) -> NavigationRegion3D:
	var node := NiuaMcpSceneNodeContext.resolve_node(editor, node_path)
	if node is NavigationRegion3D:
		return node
	return null
