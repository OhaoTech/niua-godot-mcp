@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")


static func create_multiplayer_state_script(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	var node_path := str(body.get("nodePath", ""))
	var node := NiuaMcpSceneNodeContext.resolve_node(editor, node_path)
	if node == null:
		return NiuaMcpSceneNodeContext.error("node not found: %s" % node_path, "not_found")

	var validation := NiuaMcpPathUtils.validate_script_path(str(body.get("scriptPath", "")))
	if not bool(validation.get("ok", false)):
		return validation

	var property_name := str(body.get("propertyName", ""))
	if not _is_valid_identifier(property_name):
		return NiuaMcpSceneNodeContext.error("invalid propertyName: %s" % property_name)

	var script_path := str(validation.get("path", ""))
	var overwrite := bool(body.get("overwrite", false))
	if FileAccess.file_exists(script_path) and not overwrite:
		return NiuaMcpSceneNodeContext.error("script already exists: %s" % script_path)

	var initial_value := str(body.get("initialValue", "WAITING"))
	var content := state_script_content(property_name, initial_value)
	var write_result := _write_script(script_path, content)
	if not bool(write_result.get("ok", false)):
		return write_result

	if refresh_filesystem.is_valid():
		refresh_filesystem.call(script_path)

	var script_result := _load_script(script_path)
	if not bool(script_result.get("ok", false)):
		return script_result

	node.set_script(script_result.get("script"))

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, node),
			"scriptPath": script_path,
			"propertyName": property_name,
			"initialValue": initial_value,
			"attached": true,
			"reloadError": script_result.get("reloadError", OK),
			"bytes": content.to_utf8_buffer().size()
		}
	}


static func state_script_content(property_name: String, initial_value: String) -> String:
	return """extends Node

@export var %s := "%s"
""" % [property_name, _escape(initial_value)]


static func _write_script(script_path: String, content: String) -> Dictionary:
	var parent_error := NiuaMcpPathUtils.ensure_parent_directory(script_path)
	if parent_error != OK:
		return NiuaMcpSceneNodeContext.error("failed to create parent directory for %s: %s" % [script_path, parent_error])

	var file := FileAccess.open(script_path, FileAccess.WRITE)
	if file == null:
		return NiuaMcpSceneNodeContext.error("failed to write script: %s" % script_path)
	file.store_string(content)
	file.close()
	return { "ok": true }


static func _load_script(script_path: String) -> Dictionary:
	var resource := ResourceLoader.load(script_path, "GDScript", ResourceLoader.CACHE_MODE_IGNORE)
	if resource == null or not (resource is GDScript):
		return NiuaMcpSceneNodeContext.error("script not found or not loadable: %s" % script_path, "not_found")

	var script := resource as GDScript
	var reload_error := script.reload()
	if reload_error != OK:
		return NiuaMcpSceneNodeContext.error("script failed to reload %s: %s" % [script_path, reload_error])
	return {
		"ok": true,
		"script": script,
		"reloadError": reload_error
	}


static func _is_valid_identifier(value: String) -> bool:
	if value.is_empty():
		return false
	var first := value.unicode_at(0)
	if not _is_identifier_start(first):
		return false
	for index in range(1, value.length()):
		if not _is_identifier_part(value.unicode_at(index)):
			return false
	return true


static func _is_identifier_start(codepoint: int) -> bool:
	return codepoint == 95 or (codepoint >= 65 and codepoint <= 90) or (codepoint >= 97 and codepoint <= 122)


static func _is_identifier_part(codepoint: int) -> bool:
	return _is_identifier_start(codepoint) or (codepoint >= 48 and codepoint <= 57)


static func _escape(value: String) -> String:
	return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n")
