@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpResourceBuilder = preload("niua_mcp_resource_builder.gd")
const NiuaMcpResourceOperationUtils = preload("niua_mcp_resource_operation_utils.gd")


static func open_resource(editor: EditorInterface, body: Dictionary, open_scene: Callable) -> Dictionary:
	if editor == null:
		return NiuaMcpResourceOperationUtils.error("Godot editor interface is unavailable")

	var validation := NiuaMcpPathUtils.validate_res_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	if path.ends_with(".tscn") or path.ends_with(".scn"):
		if not open_scene.is_valid():
			return NiuaMcpResourceOperationUtils.error("open scene callback is unavailable")
		var scene_result = open_scene.call({ "path": path })
		if typeof(scene_result) != TYPE_DICTIONARY:
			return NiuaMcpResourceOperationUtils.error("open scene callback did not return a response")
		return scene_result

	var resource := ResourceLoader.load(path)
	if resource == null:
		return NiuaMcpResourceOperationUtils.error("resource not found or not loadable: %s" % path, "not_found")

	editor.edit_resource(resource)
	return {
		"ok": true,
		"data": {
			"path": path,
			"type": resource.get_class()
		}
	}


static func create_resource(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_res_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	var overwrite := bool(body.get("overwrite", false))
	if (FileAccess.file_exists(path) or ResourceLoader.exists(path)) and not overwrite:
		return NiuaMcpResourceOperationUtils.error("resource already exists: %s" % path)

	var build_result := NiuaMcpResourceBuilder.build(body)
	if not build_result.get("ok", false):
		return build_result
	var resource = build_result.get("resource") as Resource
	if resource == null:
		return NiuaMcpResourceOperationUtils.error("failed to build resource")

	var parent_error := NiuaMcpPathUtils.ensure_parent_directory(path)
	if parent_error != OK:
		return NiuaMcpResourceOperationUtils.error("failed to create parent directory for %s: %s" % [path, parent_error])

	var save_error := ResourceSaver.save(resource, path)
	if save_error != OK:
		return NiuaMcpResourceOperationUtils.error("failed to save resource %s: %s" % [path, save_error])

	var opened := false
	if bool(body.get("open", true)) and editor != null and editor.has_method("edit_resource"):
		editor.edit_resource(resource)
		opened = true

	NiuaMcpResourceOperationUtils.refresh(refresh_filesystem)
	return {
		"ok": true,
		"data": {
			"path": path,
			"type": resource.get_class(),
			"saved": true,
			"opened": opened,
			"overwrote": overwrite,
			"properties": build_result.get("properties", {})
		}
	}


static func save_resource(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_res_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	if not FileAccess.file_exists(path) and not ResourceLoader.exists(path):
		return NiuaMcpResourceOperationUtils.error("resource not found: %s" % path, "not_found")

	var resource := ResourceLoader.load(path, "", ResourceLoader.CACHE_MODE_IGNORE)
	if resource == null:
		return NiuaMcpResourceOperationUtils.error("resource not loadable: %s" % path, "not_found")

	var properties_result := NiuaMcpResourceBuilder.apply_properties(resource, body.get("properties", null))
	if not properties_result.get("ok", false):
		return properties_result

	var save_error := ResourceSaver.save(resource, path)
	if save_error != OK:
		return NiuaMcpResourceOperationUtils.error("failed to save resource %s: %s" % [path, save_error])

	var opened := false
	if bool(body.get("open", false)) and editor != null and editor.has_method("edit_resource"):
		editor.edit_resource(resource)
		opened = true

	NiuaMcpResourceOperationUtils.refresh(refresh_filesystem)
	return {
		"ok": true,
		"data": {
			"path": path,
			"type": resource.get_class(),
			"saved": true,
			"opened": opened,
			"properties": properties_result.get("properties", {})
		}
	}
