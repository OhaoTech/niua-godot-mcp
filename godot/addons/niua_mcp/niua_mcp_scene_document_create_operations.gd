@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpSceneDocumentUtils = preload("niua_mcp_scene_document_utils.gd")


static func create_scene(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	if editor == null:
		return NiuaMcpSceneDocumentUtils.error("Godot editor interface is unavailable")

	var validation := NiuaMcpPathUtils.validate_scene_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var scene_path := str(validation.get("path"))
	var overwrite := bool(body.get("overwrite", false))
	if (FileAccess.file_exists(scene_path) or ResourceLoader.exists(scene_path)) and not overwrite:
		return NiuaMcpSceneDocumentUtils.error("scene already exists: %s" % scene_path)

	var root_type := str(body.get("rootType", "Node3D")).strip_edges()
	if root_type.is_empty():
		root_type = "Node3D"
	if not ClassDB.class_exists(root_type):
		return NiuaMcpSceneDocumentUtils.error("unknown Godot class: %s" % root_type)

	var instance: Object = ClassDB.instantiate(root_type)
	if not (instance is Node):
		if instance != null and instance is Object:
			instance.free()
		return NiuaMcpSceneDocumentUtils.error("Godot class is not a Node: %s" % root_type)

	var root := instance as Node
	var root_name := str(body.get("rootName", "")).strip_edges()
	if root_name.is_empty():
		root_name = root_type
	root.name = root_name

	var parent_error := NiuaMcpPathUtils.ensure_parent_directory(scene_path)
	if parent_error != OK:
		root.free()
		return NiuaMcpSceneDocumentUtils.error("failed to create parent directory for %s: %s" % [scene_path, parent_error])

	var packed := PackedScene.new()
	var pack_error := packed.pack(root)
	if pack_error != OK:
		root.free()
		return NiuaMcpSceneDocumentUtils.error("failed to pack scene: %s" % pack_error)

	var save_error := ResourceSaver.save(packed, scene_path)
	if save_error != OK:
		root.free()
		return NiuaMcpSceneDocumentUtils.error("failed to save scene %s: %s" % [scene_path, save_error])

	if refresh_filesystem.is_valid():
		refresh_filesystem.call()

	var opened := false
	if bool(body.get("open", true)) and editor.has_method("open_scene_from_path"):
		editor.open_scene_from_path(scene_path)
		opened = true

	root.free()

	return {
		"ok": true,
		"data": {
			"path": scene_path,
			"rootType": root_type,
			"rootName": root_name,
			"opened": opened,
			"saved": true,
			"overwrote": overwrite
		}
	}
