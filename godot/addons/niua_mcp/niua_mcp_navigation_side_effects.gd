@tool
extends RefCounted

const NiuaMcpNavigationAgentOperations = preload("niua_mcp_navigation_agent_operations.gd")
const NiuaMcpNavigationRegionOperations = preload("niua_mcp_navigation_region_operations.gd")
const NiuaMcpNavigationScriptOperations = preload("niua_mcp_navigation_script_operations.gd")
const NiuaMcpSceneGraphUtils = preload("niua_mcp_scene_graph_utils.gd")


static func create_navigation_region_3d_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpNavigationRegionOperations.create_navigation_region_3d(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneGraphUtils.remember(remember, "Created NavigationRegion3D %s" % str(data.get("nodePath", "")))
	return response


static func bake_navigation_mesh_3d_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpNavigationRegionOperations.bake_navigation_mesh_3d(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneGraphUtils.remember(remember, "Baked NavigationMesh %s" % str(data.get("nodePath", "")))
	return response


static func create_navigation_agent_3d_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpNavigationAgentOperations.create_navigation_agent_3d(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneGraphUtils.remember(remember, "Created NavigationAgent3D %s" % str(data.get("nodePath", "")))
	return response


static func create_navigation_target_follow_script_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpNavigationScriptOperations.create_navigation_target_follow_script(editor, body, refresh_filesystem)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneGraphUtils.remember(remember, "Created navigation target-follow script %s" % str(data.get("scriptPath", "")))
	return response
