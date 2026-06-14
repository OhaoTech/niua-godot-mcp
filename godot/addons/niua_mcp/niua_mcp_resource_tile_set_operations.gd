@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpResourceOperationUtils = preload("niua_mcp_resource_operation_utils.gd")
const NiuaMcpTileSetBuilder = preload("niua_mcp_tile_set_builder.gd")


static func create_tile_set_resource(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_res_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	var overwrite := bool(body.get("overwrite", false))
	if (FileAccess.file_exists(path) or ResourceLoader.exists(path)) and not overwrite:
		return NiuaMcpResourceOperationUtils.error("resource already exists: %s" % path)

	var build_result := NiuaMcpTileSetBuilder.build(body)
	if not build_result.get("ok", false):
		return build_result
	var tile_set = build_result.get("resource") as TileSet
	if tile_set == null:
		return NiuaMcpResourceOperationUtils.error("failed to build TileSet resource")
	var resource_name := str(build_result.get("resourceName", ""))
	var source_summaries: Array = build_result.get("sources", [])

	var parent_error := NiuaMcpPathUtils.ensure_parent_directory(path)
	if parent_error != OK:
		return NiuaMcpResourceOperationUtils.error("failed to create parent directory for %s: %s" % [path, parent_error])

	var save_error := ResourceSaver.save(tile_set, path)
	if save_error != OK:
		return NiuaMcpResourceOperationUtils.error("failed to save TileSet resource %s: %s" % [path, save_error])

	var opened := false
	if bool(body.get("open", true)) and editor != null and editor.has_method("edit_resource"):
		editor.edit_resource(tile_set)
		opened = true

	NiuaMcpResourceOperationUtils.refresh(refresh_filesystem)
	return {
		"ok": true,
		"data": {
			"path": path,
			"type": "TileSet",
			"saved": true,
			"opened": opened,
			"overwrote": overwrite,
			"resourceName": resource_name,
			"tileSize": build_result.get("tileSize", {}),
			"physicsLayers": build_result.get("physicsLayers", []),
			"terrainSets": build_result.get("terrainSets", []),
			"sourceCount": int(build_result.get("sourceCount", source_summaries.size())),
			"sources": source_summaries
		}
	}
