@tool
extends RefCounted

const NiuaMcpEditorSelectionNodeOperations = preload("niua_mcp_editor_selection_node_operations.gd")
const NiuaMcpEditorSelectionResourceOperations = preload("niua_mcp_editor_selection_resource_operations.gd")
const NiuaMcpEditorSelectionUtils = preload("niua_mcp_editor_selection_utils.gd")


static func set_selection_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := set_selection(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpEditorSelectionUtils.remember(remember, "Set editor selection to %d node(s)" % int(data.get("selectedCount", 0)))
	return response


static func focus_node_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := focus_node(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpEditorSelectionUtils.remember(remember, "Focused node %s" % str(data.get("nodePath", "")))
	return response


static func focus_resource_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := focus_resource(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpEditorSelectionUtils.remember(remember, "Focused resource %s" % str(data.get("path", "")))
	return response


static func selection(editor: EditorInterface) -> Dictionary:
	return NiuaMcpEditorSelectionNodeOperations.selection(editor)


static func set_selection(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpEditorSelectionNodeOperations.set_selection(editor, body)


static func focus_node(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpEditorSelectionNodeOperations.focus_node(editor, body)


static func focus_resource(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpEditorSelectionResourceOperations.focus_resource(editor, body)
