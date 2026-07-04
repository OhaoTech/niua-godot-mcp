@tool
extends RefCounted

const NiuaMcpScriptAnalysisOperations = preload("niua_mcp_script_analysis_operations.gd")
const NiuaMcpScriptEditOperations = preload("niua_mcp_script_edit_operations.gd")
const NiuaMcpScriptFileBasicOperations = preload("niua_mcp_script_file_basic_operations.gd")
const NiuaMcpScriptFileSideEffects = preload("niua_mcp_script_file_side_effects.gd")
const NiuaMcpScriptReplaceOperations = preload("niua_mcp_script_replace_operations.gd")
const NiuaMcpScriptSearchOperations = preload("niua_mcp_script_search_operations.gd")


static func write_script_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpScriptFileSideEffects.write_script_with_side_effects(body, refresh_filesystem, remember)


static func edit_script_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpScriptFileSideEffects.edit_script_with_side_effects(body, refresh_filesystem, remember)


static func replace_in_scripts_with_side_effects(body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpScriptFileSideEffects.replace_in_scripts_with_side_effects(body, refresh_filesystem, remember)


static func read_script(query: Dictionary) -> Dictionary:
	return NiuaMcpScriptFileBasicOperations.read_script(query)


static func write_script(body: Dictionary) -> Dictionary:
	return NiuaMcpScriptFileBasicOperations.write_script(body)


static func edit_script(body: Dictionary) -> Dictionary:
	return NiuaMcpScriptEditOperations.edit_script(body)


static func search_in_scripts(query: Dictionary) -> Dictionary:
	return NiuaMcpScriptSearchOperations.search_in_scripts(query)


static func replace_in_scripts(body: Dictionary) -> Dictionary:
	return NiuaMcpScriptReplaceOperations.replace_in_scripts(body)


static func validate_script(query: Dictionary) -> Dictionary:
	return NiuaMcpScriptAnalysisOperations.validate_script(query)


static func script_symbols(query: Dictionary) -> Dictionary:
	return NiuaMcpScriptAnalysisOperations.script_symbols(query)


static func resource_summary(script) -> Dictionary:
	return NiuaMcpScriptAnalysisOperations.resource_summary(script)
