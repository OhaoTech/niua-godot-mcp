@tool
extends RefCounted

const NiuaMcpEditorActionUtils = preload("niua_mcp_editor_action_utils.gd")


static func select_file(editor: EditorInterface, params: Dictionary) -> Dictionary:
	var availability := NiuaMcpEditorActionUtils.require_editor_method(editor, "select_file")
	if not availability.get("ok", false):
		return availability

	var path_result := NiuaMcpEditorActionUtils.action_res_path(params, "path")
	if not path_result.get("ok", false):
		return path_result

	var path := str(path_result.get("path"))
	editor.select_file(path)
	return NiuaMcpEditorActionUtils.action_data({ "path": path })


static func filesystem_scan(editor: EditorInterface) -> Dictionary:
	var filesystem = NiuaMcpEditorActionUtils.editor_resource_filesystem(editor)
	if filesystem == null:
		return NiuaMcpEditorActionUtils.error("Godot editor resource filesystem is unavailable")
	if not filesystem.has_method("scan"):
		return NiuaMcpEditorActionUtils.error("Godot editor resource filesystem does not expose scan")

	filesystem.scan()
	return NiuaMcpEditorActionUtils.action_data({})


static func filesystem_scan_sources(editor: EditorInterface) -> Dictionary:
	var filesystem = NiuaMcpEditorActionUtils.editor_resource_filesystem(editor)
	if filesystem == null:
		return NiuaMcpEditorActionUtils.error("Godot editor resource filesystem is unavailable")
	if not filesystem.has_method("scan_sources"):
		return NiuaMcpEditorActionUtils.error("Godot editor resource filesystem does not expose scan_sources")

	filesystem.scan_sources()
	return NiuaMcpEditorActionUtils.action_data({})


static func filesystem_update_file(editor: EditorInterface, params: Dictionary) -> Dictionary:
	var filesystem = NiuaMcpEditorActionUtils.editor_resource_filesystem(editor)
	if filesystem == null:
		return NiuaMcpEditorActionUtils.error("Godot editor resource filesystem is unavailable")
	if not filesystem.has_method("update_file"):
		return NiuaMcpEditorActionUtils.error("Godot editor resource filesystem does not expose update_file")

	var path_result := NiuaMcpEditorActionUtils.action_res_path(params, "path")
	if not path_result.get("ok", false):
		return path_result

	var path := str(path_result.get("path"))
	filesystem.update_file(path)
	return NiuaMcpEditorActionUtils.action_data({ "path": path })
