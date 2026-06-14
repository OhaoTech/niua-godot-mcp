@tool
extends RefCounted

const NiuaMcpEditorActionUtils = preload("niua_mcp_editor_action_utils.gd")


static func reload_scene_from_path(editor: EditorInterface, params: Dictionary) -> Dictionary:
	var availability := NiuaMcpEditorActionUtils.require_editor_method(editor, "reload_scene_from_path")
	if not availability.get("ok", false):
		return availability

	var path_result := NiuaMcpEditorActionUtils.action_scene_path(params, "path")
	if not path_result.get("ok", false):
		return path_result

	var path := str(path_result.get("path"))
	editor.reload_scene_from_path(path)
	return NiuaMcpEditorActionUtils.action_data({ "path": path })


static func save_scene(editor: EditorInterface) -> Dictionary:
	var availability := NiuaMcpEditorActionUtils.require_editor_method(editor, "save_scene")
	if not availability.get("ok", false):
		return availability

	# editor.save_scene() pops a modal "Save As" EditorFileDialog for an
	# untitled scene, which an agent cannot dismiss. Refuse with an
	# actionable error instead; use save_scene_as with a res:// path.
	var root := editor.get_edited_scene_root()
	if root == null:
		return NiuaMcpEditorActionUtils.error("no edited scene is open")
	if str(root.scene_file_path).is_empty():
		return NiuaMcpEditorActionUtils.error("current scene has never been saved; use save_scene_as with a res:// path")

	var save_error := editor.save_scene()
	if save_error != OK:
		return NiuaMcpEditorActionUtils.error("failed to save scene: %s" % save_error)
	return NiuaMcpEditorActionUtils.action_data({})


static func save_all_scenes(editor: EditorInterface) -> Dictionary:
	var availability := NiuaMcpEditorActionUtils.require_editor_method(editor, "save_all_scenes")
	if not availability.get("ok", false):
		return availability

	editor.save_all_scenes()
	return NiuaMcpEditorActionUtils.action_data({})


static func mark_scene_as_unsaved(editor: EditorInterface) -> Dictionary:
	var availability := NiuaMcpEditorActionUtils.require_editor_method(editor, "mark_scene_as_unsaved")
	if not availability.get("ok", false):
		return availability

	editor.mark_scene_as_unsaved()
	return NiuaMcpEditorActionUtils.action_data({})
