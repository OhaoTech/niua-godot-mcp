@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpSceneTabState = preload("niua_mcp_scene_tab_state.gd")
const NiuaMcpSceneTabUtils = preload("niua_mcp_scene_tab_utils.gd")


static func open_scene(editor: EditorInterface, body: Dictionary) -> Dictionary:
	if editor == null:
		return NiuaMcpSceneTabUtils.error("Godot editor interface is unavailable")
	if not editor.has_method("open_scene_from_path"):
		return NiuaMcpSceneTabUtils.error("Godot editor does not expose open_scene_from_path")

	var validation := NiuaMcpPathUtils.validate_scene_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var scene_path := str(validation.get("path"))
	if not ResourceLoader.exists(scene_path):
		return NiuaMcpSceneTabUtils.error("scene not found: %s" % scene_path, "not_found")

	editor.open_scene_from_path(scene_path)
	return {
		"ok": true,
		"data": {
			"path": scene_path
		}
	}


static func switch_scene_tab(editor: EditorInterface, body: Dictionary) -> Dictionary:
	if editor == null:
		return NiuaMcpSceneTabUtils.error("Godot editor interface is unavailable")
	if not editor.has_method("open_scene_from_path"):
		return NiuaMcpSceneTabUtils.error("Godot editor does not expose open_scene_from_path")

	var validation := NiuaMcpPathUtils.validate_scene_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var scene_path := str(validation.get("path"))
	if not ResourceLoader.exists(scene_path):
		return NiuaMcpSceneTabUtils.error("scene not found: %s" % scene_path, "not_found")

	editor.open_scene_from_path(scene_path)
	var state := NiuaMcpSceneTabState.scene_tab_state(editor, { "path": scene_path })
	if not bool(state.get("ok", false)):
		return state
	var data: Dictionary = state.get("data", {})
	var current_scene := str(data.get("currentScene", ""))
	if current_scene != scene_path:
		return NiuaMcpSceneTabUtils.error(
			"scene tab did not activate: requested %s but current scene is %s" % [scene_path, current_scene],
			"not_found"
		)
	return state


static func close_scene_tab(editor: EditorInterface, body: Dictionary, save_current_scene: Callable) -> Dictionary:
	if editor == null:
		return NiuaMcpSceneTabUtils.error("Godot editor interface is unavailable")
	if not editor.has_method("close_scene"):
		return NiuaMcpSceneTabUtils.error("Godot editor does not expose close_scene")

	var requested_path := str(body.get("path", "")).strip_edges()
	if not requested_path.is_empty():
		var switch_result := switch_scene_tab(editor, { "path": requested_path })
		if not switch_result.get("ok", false):
			return switch_result

	if bool(body.get("saveBeforeClose", false)):
		if not save_current_scene.is_valid():
			return NiuaMcpSceneTabUtils.error("save current scene callback is unavailable")
		var save_result = save_current_scene.call({})
		if typeof(save_result) == TYPE_DICTIONARY and not save_result.get("ok", false):
			return save_result

	var close_error: int = editor.close_scene()
	if close_error != OK:
		return NiuaMcpSceneTabUtils.error("failed to close current scene: %s" % close_error)

	return NiuaMcpSceneTabState.scene_tab_state(editor, { "closed": requested_path if not requested_path.is_empty() else true })


static func mark_scene_unsaved(editor: EditorInterface, body: Dictionary) -> Dictionary:
	if editor == null:
		return NiuaMcpSceneTabUtils.error("Godot editor interface is unavailable")
	if not editor.has_method("mark_scene_as_unsaved"):
		return NiuaMcpSceneTabUtils.error("Godot editor does not expose mark_scene_as_unsaved")

	var requested_path := str(body.get("path", "")).strip_edges()
	if not requested_path.is_empty():
		var switch_result := switch_scene_tab(editor, { "path": requested_path })
		if not switch_result.get("ok", false):
			return switch_result

	editor.mark_scene_as_unsaved()
	return NiuaMcpSceneTabState.scene_tab_state(editor, { "markedUnsaved": requested_path if not requested_path.is_empty() else true })
