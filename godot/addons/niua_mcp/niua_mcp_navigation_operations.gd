@tool
extends RefCounted

const NiuaMcpNavigationAgentOperations = preload("niua_mcp_navigation_agent_operations.gd")
const NiuaMcpNavigationRegionOperations = preload("niua_mcp_navigation_region_operations.gd")
const NiuaMcpNavigationScriptOperations = preload("niua_mcp_navigation_script_operations.gd")
const NiuaMcpNavigationSideEffects = preload("niua_mcp_navigation_side_effects.gd")


static func create_navigation_region_3d_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpNavigationSideEffects.create_navigation_region_3d_with_side_effects(editor, body, remember)


static func bake_navigation_mesh_3d_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpNavigationSideEffects.bake_navigation_mesh_3d_with_side_effects(editor, body, remember)


static func create_navigation_agent_3d_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpNavigationSideEffects.create_navigation_agent_3d_with_side_effects(editor, body, remember)


static func create_navigation_target_follow_script_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpNavigationSideEffects.create_navigation_target_follow_script_with_side_effects(editor, body, refresh_filesystem, remember)


static func create_navigation_region_3d(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpNavigationRegionOperations.create_navigation_region_3d(editor, body)


static func bake_navigation_mesh_3d(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpNavigationRegionOperations.bake_navigation_mesh_3d(editor, body)


static func create_navigation_agent_3d(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpNavigationAgentOperations.create_navigation_agent_3d(editor, body)


static func create_navigation_target_follow_script(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	return NiuaMcpNavigationScriptOperations.create_navigation_target_follow_script(editor, body, refresh_filesystem)
