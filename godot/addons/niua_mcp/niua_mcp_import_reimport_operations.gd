@tool
extends RefCounted

const NiuaMcpImportUtils = preload("niua_mcp_import_utils.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")


static func reimport_assets(body: Dictionary, resource_filesystem, refresh_filesystem: Callable) -> Dictionary:
	var raw_paths = body.get("paths", [])
	if typeof(raw_paths) != TYPE_ARRAY:
		return NiuaMcpImportUtils.error("paths must be an array")
	if raw_paths.size() == 0:
		return NiuaMcpImportUtils.error("paths must include at least one asset")

	var accepted_paths := []
	var packed_paths := PackedStringArray()
	for raw_path in raw_paths:
		var validation := NiuaMcpPathUtils.validate_res_path(str(raw_path))
		if not validation.get("ok", false):
			return validation

		var path := str(validation.get("path"))
		if path.ends_with(".import"):
			path = path.trim_suffix(".import")
		accepted_paths.append(path)
		packed_paths.append(path)

	var reimported := false
	var scanned := false
	var registered_paths := []
	if resource_filesystem != null:
		# reimport_files() silently skips files missing from the in-memory
		# filesystem tree (e.g. written while a scan was rebuilding it).
		# Re-register unknown files first so the reimport actually happens.
		if resource_filesystem.has_method("get_file_type") and resource_filesystem.has_method("update_file"):
			for known_path in accepted_paths:
				if str(resource_filesystem.get_file_type(known_path)) == "":
					resource_filesystem.update_file(known_path)
					registered_paths.append(known_path)
		if resource_filesystem.has_method("reimport_files"):
			_run_after_process_frame(func() -> void:
				if is_instance_valid(resource_filesystem):
					resource_filesystem.reimport_files(packed_paths)
			)
			reimported = true
		elif resource_filesystem.has_method("scan"):
			_run_after_process_frame(func() -> void:
				if is_instance_valid(resource_filesystem):
					resource_filesystem.scan()
			)
			scanned = true

	if not reimported and not scanned and refresh_filesystem.is_valid():
		refresh_filesystem.call()

	return {
		"ok": true,
		"data": {
			"paths": accepted_paths,
			"reimported": reimported,
			"scanned": scanned,
			"registeredPaths": registered_paths
		}
	}


static func _run_after_process_frame(callback: Callable) -> void:
	var main_loop := Engine.get_main_loop()
	if main_loop is SceneTree:
		var tree := main_loop as SceneTree
		tree.process_frame.connect(callback, CONNECT_ONE_SHOT)
	else:
		callback.call()
