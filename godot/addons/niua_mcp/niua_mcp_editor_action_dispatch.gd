@tool
extends RefCounted

const NiuaMcpEditorActionFilesystem = preload("niua_mcp_editor_action_filesystem.gd")
const NiuaMcpEditorActionScene = preload("niua_mcp_editor_action_scene.gd")
const NiuaMcpEditorActionUi = preload("niua_mcp_editor_action_ui.gd")
const NiuaMcpEditorActionUtils = preload("niua_mcp_editor_action_utils.gd")


static func dispatch(editor: EditorInterface, action: String, params: Dictionary) -> Dictionary:
	match action:
		"set_distraction_free_mode":
			return NiuaMcpEditorActionUi.set_distraction_free_mode(editor, params)
		"select_file":
			return NiuaMcpEditorActionFilesystem.select_file(editor, params)
		"filesystem_scan":
			return NiuaMcpEditorActionFilesystem.filesystem_scan(editor)
		"filesystem_scan_sources":
			return NiuaMcpEditorActionFilesystem.filesystem_scan_sources(editor)
		"filesystem_update_file":
			return NiuaMcpEditorActionFilesystem.filesystem_update_file(editor, params)
		"reload_scene_from_path":
			return NiuaMcpEditorActionScene.reload_scene_from_path(editor, params)
		"save_scene":
			return NiuaMcpEditorActionScene.save_scene(editor)
		"save_all_scenes":
			return NiuaMcpEditorActionScene.save_all_scenes(editor)
		"mark_scene_as_unsaved":
			return NiuaMcpEditorActionScene.mark_scene_as_unsaved(editor)
		"set_movie_maker_enabled":
			return NiuaMcpEditorActionUi.set_movie_maker_enabled(editor, params)
		_:
			return NiuaMcpEditorActionUtils.error("unsupported editor action: %s" % action)
