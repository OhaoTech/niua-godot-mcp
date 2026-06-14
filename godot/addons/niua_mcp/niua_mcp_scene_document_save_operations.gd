@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpSceneDocumentUtils = preload("niua_mcp_scene_document_utils.gd")


static func save_current_scene(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var root := NiuaMcpSceneDocumentUtils.edited_scene_root(editor)
	if root == null:
		return NiuaMcpSceneDocumentUtils.error("no edited scene is open")

	var scene_path := str(body.get("path", root.scene_file_path))
	if scene_path.is_empty():
		return NiuaMcpSceneDocumentUtils.error("current scene has no file path")
	if not scene_path.begins_with("res://"):
		return NiuaMcpSceneDocumentUtils.error("scene save path must be under res://")

	var packed := PackedScene.new()
	var pack_error := packed.pack(root)
	if pack_error != OK:
		return NiuaMcpSceneDocumentUtils.error("failed to pack scene: %s" % pack_error)

	var save_error := ResourceSaver.save(packed, scene_path)
	if save_error != OK:
		return NiuaMcpSceneDocumentUtils.error("failed to save scene %s: %s" % [scene_path, save_error])

	return {
		"ok": true,
		"data": {
			"path": scene_path
		}
	}


static func save_scene_as(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_scene_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var scene_path := str(validation.get("path"))
	var parent_error := NiuaMcpPathUtils.ensure_parent_directory(scene_path)
	if parent_error != OK:
		return NiuaMcpSceneDocumentUtils.error("failed to create parent directory for %s: %s" % [scene_path, parent_error])

	var save_result := save_current_scene(editor, { "path": scene_path })
	if not save_result.get("ok", false):
		return save_result

	if refresh_filesystem.is_valid():
		refresh_filesystem.call()
	return save_result
