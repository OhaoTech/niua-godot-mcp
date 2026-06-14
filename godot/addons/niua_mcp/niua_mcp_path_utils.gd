@tool
extends RefCounted


static func validate_res_path(raw_path: String, allow_root: bool = false) -> Dictionary:
	var path := raw_path.strip_edges()
	if path.is_empty():
		return _error("res:// path is required")
	if path == "res:":
		path = "res://"
	if not path.begins_with("res://"):
		return _error("path must be under res://: %s" % path)
	if path.contains(".."):
		return _error("path traversal is not allowed: %s" % path)
	if not allow_root and path == "res://":
		return _error("res:// root is not valid for this operation")

	return {
		"ok": true,
		"path": path,
		"globalPath": ProjectSettings.globalize_path(path)
	}


static func validate_writable_res_path(raw_path: String, allow_root: bool = false) -> Dictionary:
	var validation := validate_res_path(raw_path, allow_root)
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	var protected_error := _protected_write_error(path)
	if not protected_error.is_empty():
		return protected_error

	var symlink_error := _symlink_escape_error(path)
	if not symlink_error.is_empty():
		return symlink_error

	return validation


static func validate_script_path(raw_path: String) -> Dictionary:
	var validation := validate_res_path(raw_path)
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	if not path.ends_with(".gd"):
		return _error("script path must end with .gd: %s" % path)

	return validation


static func validate_scene_path(raw_path: String) -> Dictionary:
	var validation := validate_res_path(raw_path)
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	if not (path.ends_with(".tscn") or path.ends_with(".scn")):
		return _error("scene path must end with .tscn or .scn: %s" % path)

	return validation


static func import_sidecar_path(path: String) -> String:
	if path.ends_with(".import"):
		return path
	return path + ".import"


static func join_res_path(base_path: String, name: String) -> String:
	if base_path.ends_with("/"):
		return base_path + name
	return base_path + "/" + name


static func ensure_parent_directory(path: String) -> int:
	var parent := path.get_base_dir()
	if parent.is_empty() or parent == "res://":
		return OK
	return DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(parent))


static func res_relative_path(path: String) -> String:
	return path.trim_prefix("res://")


static func res_child_prefix(path: String) -> String:
	if path.ends_with("/"):
		return path
	return path + "/"


static func filesystem_entry_exists(path: String) -> bool:
	return FileAccess.file_exists(path) or DirAccess.dir_exists_absolute(ProjectSettings.globalize_path(path))


static func filesystem_entry_type(path: String) -> String:
	if FileAccess.file_exists(path):
		return "file"
	if DirAccess.dir_exists_absolute(ProjectSettings.globalize_path(path)):
		return "directory"
	return "missing"


static func _protected_write_error(path: String) -> Dictionary:
	if path == "res://.godot" or path.begins_with("res://.godot/"):
		return _error("path points into protected project metadata and cannot be written by NIUA MCP: %s" % path)
	if path == "res://addons/niua_mcp" or path.begins_with("res://addons/niua_mcp/"):
		return _error("path points into the NIUA MCP addon and cannot overwrite the bridge: %s" % path)
	return {}


static func _symlink_escape_error(path: String) -> Dictionary:
	var root_global := ProjectSettings.globalize_path("res://")
	var relative := res_relative_path(path)
	var current_dir := root_global
	for raw_segment in relative.split("/", false):
		var segment := str(raw_segment)
		if segment.is_empty():
			continue
		var directory := DirAccess.open(current_dir)
		if directory == null:
			return {}
		if directory.is_link(segment):
			var target := directory.read_link(segment)
			return _error("path crosses a symbolic link and may escape res://: %s -> %s" % [path, target])
		current_dir = current_dir.path_join(segment)
	return {}


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
