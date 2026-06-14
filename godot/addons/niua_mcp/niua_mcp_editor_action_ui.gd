@tool
extends RefCounted

const NiuaMcpEditorActionUtils = preload("niua_mcp_editor_action_utils.gd")


static func set_distraction_free_mode(editor: EditorInterface, params: Dictionary) -> Dictionary:
	var availability := NiuaMcpEditorActionUtils.require_editor_method(editor, "set_distraction_free_mode")
	if not availability.get("ok", false):
		return availability

	var enter := bool(params.get("enter", true))
	editor.set_distraction_free_mode(enter)
	return NiuaMcpEditorActionUtils.action_data({ "enter": enter })


static func set_movie_maker_enabled(editor: EditorInterface, params: Dictionary) -> Dictionary:
	var availability := NiuaMcpEditorActionUtils.require_editor_method(editor, "set_movie_maker_enabled")
	if not availability.get("ok", false):
		return availability

	var enabled := bool(params.get("enabled", true))
	editor.set_movie_maker_enabled(enabled)
	return NiuaMcpEditorActionUtils.action_data({ "enabled": enabled })
