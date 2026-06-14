@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")
const NiuaMcpSceneNodeInstanceCreation = preload("niua_mcp_scene_node_instance_creation.gd")
const NiuaMcpSceneNodeTreeOperations = preload("niua_mcp_scene_node_tree_operations.gd")


static func create_node_with_script(editor: EditorInterface, body: Dictionary, path_validator: Callable, create_script: Callable, attach_script: Callable) -> Dictionary:
	var script_validation := NiuaMcpPathUtils.validate_script_path(str(body.get("scriptPath", "")))
	if not script_validation.get("ok", false):
		return script_validation

	var script_path := str(script_validation.get("path"))
	var overwrite_script := bool(body.get("overwriteScript", false))
	var script_exists := FileAccess.file_exists(script_path) or ResourceLoader.exists(script_path)
	if script_exists and body.has("scriptContent") and not overwrite_script:
		return NiuaMcpSceneNodeContext.error("script already exists: %s" % script_path)

	var create_result := NiuaMcpSceneNodeInstanceCreation.create_node(editor, body, path_validator)
	if not create_result.get("ok", false):
		return create_result

	var node_data: Dictionary = create_result.get("data", {})
	var node_path := str(node_data.get("nodePath", ""))
	var node_type := str(node_data.get("type", body.get("type", "Node")))
	var base_type := str(body.get("scriptBaseType", node_type)).strip_edges()
	if base_type.is_empty():
		base_type = node_type

	var script_created := false
	if overwrite_script or not script_exists:
		var create_body: Dictionary = {
			"path": script_path,
			"baseType": base_type,
			"overwrite": overwrite_script
		}
		if body.has("scriptContent"):
			create_body["content"] = body.get("scriptContent")
		if body.has("scriptTemplate"):
			create_body["template"] = body.get("scriptTemplate")
		if body.has("scriptClassName"):
			create_body["className"] = body.get("scriptClassName")

		var create_script_raw = create_script.call(create_body)
		if typeof(create_script_raw) != TYPE_DICTIONARY:
			NiuaMcpSceneNodeTreeOperations.delete_node(editor, { "nodePath": node_path })
			return NiuaMcpSceneNodeContext.error("create script callback did not return a Dictionary")
		var create_script_result: Dictionary = create_script_raw
		if not create_script_result.get("ok", false):
			NiuaMcpSceneNodeTreeOperations.delete_node(editor, { "nodePath": node_path })
			return create_script_result
		var create_script_data: Dictionary = create_script_result.get("data", {})
		script_created = bool(create_script_data.get("created", false))

	var attach_body: Dictionary = {
		"nodePath": node_path,
		"scriptPath": script_path,
		"baseType": base_type,
		"createIfMissing": false,
		"saveScene": bool(body.get("saveScene", false))
	}
	var attach_raw = attach_script.call(attach_body)
	if typeof(attach_raw) != TYPE_DICTIONARY:
		NiuaMcpSceneNodeTreeOperations.delete_node(editor, { "nodePath": node_path })
		return NiuaMcpSceneNodeContext.error("attach script callback did not return a Dictionary")
	var attach_result: Dictionary = attach_raw
	if not attach_result.get("ok", false):
		NiuaMcpSceneNodeTreeOperations.delete_node(editor, { "nodePath": node_path })
		return attach_result

	var attach_data: Dictionary = attach_result.get("data", {})
	return {
		"ok": true,
		"data": {
			"node": node_data,
			"script": attach_data.get("script", {}),
			"created": script_created,
			"attached": true,
			"inspected": bool(attach_data.get("inspected", false)),
			"saved": bool(attach_data.get("saved", false))
		}
	}
