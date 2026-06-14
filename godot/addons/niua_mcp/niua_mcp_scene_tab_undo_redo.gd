@tool
extends RefCounted

const NiuaMcpSceneTabState = preload("niua_mcp_scene_tab_state.gd")
const NiuaMcpSceneTabUtils = preload("niua_mcp_scene_tab_utils.gd")


static func undo_editor_action(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return _apply_editor_undo_redo(editor, body, "undo")


static func redo_editor_action(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return _apply_editor_undo_redo(editor, body, "redo")


static func _apply_editor_undo_redo(editor: EditorInterface, body: Dictionary, direction: String) -> Dictionary:
	var resolved := _resolve_editor_undo_redo(editor, body)
	if not resolved.get("ok", false):
		return resolved

	var undo_redo := resolved.get("undoRedo") as UndoRedo
	var before := _undo_redo_state(undo_redo)
	var can_apply := false
	var applied := false
	if direction == "undo":
		can_apply = undo_redo.has_undo()
		if can_apply:
			applied = undo_redo.undo()
	elif direction == "redo":
		can_apply = undo_redo.has_redo()
		if can_apply:
			applied = undo_redo.redo()
	else:
		return NiuaMcpSceneTabUtils.error("unsupported undo/redo direction: %s" % direction)

	var after := _undo_redo_state(undo_redo)
	return {
		"ok": true,
		"data": {
			"action": direction,
			"applied": applied,
			"noOpReason": "" if can_apply else "empty_history",
			"historyId": int(resolved.get("historyId", -1)),
			"scenePath": str(resolved.get("scenePath", "")),
			"rootPath": str(resolved.get("rootPath", "")),
			"before": before,
			"after": after
		}
	}


static func _resolve_editor_undo_redo(editor: EditorInterface, body: Dictionary) -> Dictionary:
	if editor == null:
		return NiuaMcpSceneTabUtils.error("Godot editor interface is unavailable")
	if not editor.has_method("get_editor_undo_redo"):
		return NiuaMcpSceneTabUtils.error("Godot editor does not expose get_editor_undo_redo")

	var manager = editor.get_editor_undo_redo()
	if manager == null:
		return NiuaMcpSceneTabUtils.error("Godot editor undo manager is unavailable", "not_found")

	var root := NiuaMcpSceneTabState.edited_scene_root(editor)
	var history_id := int(body.get("historyId", -1))
	if history_id < 0:
		if root == null:
			return NiuaMcpSceneTabUtils.error("no edited scene root is available for undo/redo", "not_found")
		history_id = int(manager.get_object_history_id(root))

	var undo_redo = manager.get_history_undo_redo(history_id)
	if undo_redo == null:
		return NiuaMcpSceneTabUtils.error("undo history unavailable: %d" % history_id, "not_found")

	return {
		"ok": true,
		"undoRedo": undo_redo,
		"historyId": history_id,
		"scenePath": NiuaMcpSceneTabState.current_scene_path(editor),
		"rootPath": str(root.get_path()) if root != null else ""
	}


static func _undo_redo_state(undo_redo: UndoRedo) -> Dictionary:
	return {
		"historyVersion": undo_redo.get_version(),
		"historyCount": undo_redo.get_history_count(),
		"currentAction": undo_redo.get_current_action(),
		"currentActionName": undo_redo.get_current_action_name(),
		"hasUndo": undo_redo.has_undo(),
		"hasRedo": undo_redo.has_redo()
	}
