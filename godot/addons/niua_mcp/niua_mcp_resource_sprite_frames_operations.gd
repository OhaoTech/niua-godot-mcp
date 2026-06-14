@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpResourceOperationUtils = preload("niua_mcp_resource_operation_utils.gd")
const NiuaMcpSpriteFramesBuilder = preload("niua_mcp_sprite_frames_builder.gd")


static func create_sprite_frames_resource(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_res_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	var overwrite := bool(body.get("overwrite", false))
	if (FileAccess.file_exists(path) or ResourceLoader.exists(path)) and not overwrite:
		return NiuaMcpResourceOperationUtils.error("resource already exists: %s" % path)

	var build_result := NiuaMcpSpriteFramesBuilder.build(body)
	if not build_result.get("ok", false):
		return build_result
	var sprite_frames = build_result.get("resource") as SpriteFrames
	if sprite_frames == null:
		return NiuaMcpResourceOperationUtils.error("failed to build SpriteFrames resource")
	var resource_name := str(build_result.get("resourceName", ""))
	var animation_summaries: Array = build_result.get("animations", [])

	var parent_error := NiuaMcpPathUtils.ensure_parent_directory(path)
	if parent_error != OK:
		return NiuaMcpResourceOperationUtils.error("failed to create parent directory for %s: %s" % [path, parent_error])

	var save_error := ResourceSaver.save(sprite_frames, path)
	if save_error != OK:
		return NiuaMcpResourceOperationUtils.error("failed to save SpriteFrames resource %s: %s" % [path, save_error])

	var opened := false
	if bool(body.get("open", true)) and editor != null and editor.has_method("edit_resource"):
		editor.edit_resource(sprite_frames)
		opened = true

	NiuaMcpResourceOperationUtils.refresh(refresh_filesystem)
	return {
		"ok": true,
		"data": {
			"path": path,
			"type": "SpriteFrames",
			"saved": true,
			"opened": opened,
			"overwrote": overwrite,
			"resourceName": resource_name,
			"animations": animation_summaries
		}
	}
