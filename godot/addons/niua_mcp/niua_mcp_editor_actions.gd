@tool
extends RefCounted

const NiuaMcpEditorActionCatalog = preload("niua_mcp_editor_action_catalog.gd")
const NiuaMcpEditorActionDispatch = preload("niua_mcp_editor_action_dispatch.gd")
const NiuaMcpEditorActionUtils = preload("niua_mcp_editor_action_utils.gd")


static func invoke_with_side_effects(editor: EditorInterface, action: String, raw_params, remember: Callable) -> Dictionary:
	var response := invoke(editor, action, raw_params)
	if bool(response.get("ok", false)):
		NiuaMcpEditorActionUtils.remember(remember, "Invoked editor action %s" % action)
	return response


static func invoke(editor: EditorInterface, action: String, raw_params) -> Dictionary:
	if typeof(raw_params) != TYPE_DICTIONARY:
		return NiuaMcpEditorActionUtils.error("editor action params must be an object")
	var params: Dictionary = raw_params
	if not NiuaMcpEditorActionCatalog.has_action(action):
		return NiuaMcpEditorActionUtils.error("unsupported editor action: %s" % action)

	var result := NiuaMcpEditorActionDispatch.dispatch(editor, action, params)
	if not result.get("ok", false):
		return result

	var raw_data = result.get("data", {})
	var data: Dictionary = {}
	if typeof(raw_data) == TYPE_DICTIONARY:
		data = raw_data
	data["action"] = action
	data["invoked"] = true
	data["allowedActions"] = allowed_actions()
	return {
		"ok": true,
		"data": data
	}


static func allowed_actions() -> Array:
	return NiuaMcpEditorActionCatalog.allowed_actions()
