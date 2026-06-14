@tool
extends RefCounted

const NiuaMcpSceneTabControl = preload("niua_mcp_scene_tab_control.gd")
const NiuaMcpSceneTabUndoRedo = preload("niua_mcp_scene_tab_undo_redo.gd")
const NiuaMcpSceneTabUtils = preload("niua_mcp_scene_tab_utils.gd")


static func open_scene_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneTabControl.open_scene(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneTabUtils.remember(remember, "Opened scene %s" % str(data.get("path", "")))
	return response


static func switch_scene_tab_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneTabControl.switch_scene_tab(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneTabUtils.remember(remember, "Switched scene tab %s" % str(data.get("path", "")))
	return response


static func close_scene_tab_with_side_effects(editor: EditorInterface, body: Dictionary, save_current_scene: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneTabControl.close_scene_tab(editor, body, save_current_scene)
	if bool(response.get("ok", false)):
		NiuaMcpSceneTabUtils.remember(remember, "Closed current scene tab")
	return response


static func mark_scene_unsaved_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneTabControl.mark_scene_unsaved(editor, body)
	if bool(response.get("ok", false)):
		NiuaMcpSceneTabUtils.remember(remember, "Marked current scene tab as unsaved")
	return response


static func undo_editor_action_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneTabUndoRedo.undo_editor_action(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneTabUtils.remember(remember, "Applied editor undo history=%d applied=%s" % [int(data.get("historyId", -1)), str(data.get("applied", false))])
	return response


static func redo_editor_action_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneTabUndoRedo.redo_editor_action(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneTabUtils.remember(remember, "Applied editor redo history=%d applied=%s" % [int(data.get("historyId", -1)), str(data.get("applied", false))])
	return response
