@tool
extends RefCounted

const NiuaMcpNodeSnapshot = preload("niua_mcp_node_snapshot.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpScriptEditorAuthoringUtils = preload("niua_mcp_script_editor_authoring_utils.gd")


static func attach_script(editor: EditorInterface, body: Dictionary, resolve_node: Callable, create_script: Callable, save_current_scene: Callable, edited_scene_root: Callable) -> Dictionary:
	if editor == null:
		return NiuaMcpScriptEditorAuthoringUtils.error("Godot editor interface is unavailable")

	var node_path := str(body.get("nodePath", ""))
	var node_raw = resolve_node.call(node_path)
	if node_raw == null or not (node_raw is Node):
		var label := node_path if not node_path.is_empty() else "<edited scene root>"
		return NiuaMcpScriptEditorAuthoringUtils.error("node not found: %s" % label, "not_found")
	var node := node_raw as Node

	var validation := NiuaMcpPathUtils.validate_script_path(str(body.get("scriptPath", "")))
	if not validation.get("ok", false):
		return validation

	var script_path := str(validation.get("path"))
	var created := false
	if not FileAccess.file_exists(script_path) and bool(body.get("createIfMissing", false)):
		var create_body := {
			"path": script_path,
			"baseType": str(body.get("baseType", node.get_class()))
		}
		if body.has("content"):
			create_body["content"] = body.get("content")
		if body.has("template"):
			create_body["template"] = body.get("template")
		if body.has("className"):
			create_body["className"] = body.get("className")
		var create_result_raw = create_script.call(create_body)
		var create_result := NiuaMcpScriptEditorAuthoringUtils.callback_dictionary_result(create_result_raw, "create_script")
		if not create_result.get("ok", false):
			return create_result
		created = true

	if not FileAccess.file_exists(script_path) and not ResourceLoader.exists(script_path):
		return NiuaMcpScriptEditorAuthoringUtils.error("script not found: %s" % script_path, "not_found")

	var resource := ResourceLoader.load(script_path, "GDScript", ResourceLoader.CACHE_MODE_IGNORE)
	if resource == null or not (resource is GDScript):
		return NiuaMcpScriptEditorAuthoringUtils.error("script not found or not loadable: %s" % script_path, "not_found")

	var script := resource as GDScript
	var reload_error := script.reload()
	if reload_error != OK:
		return NiuaMcpScriptEditorAuthoringUtils.error("script failed to reload %s: %s" % [script_path, reload_error])

	node.set_script(script)
	# set_script() silently no-ops when the script's base type is incompatible
	# with the node, which would otherwise report a successful attach on a node
	# that actually has no script. Confirm it took.
	if node.get_script() != script:
		return NiuaMcpScriptEditorAuthoringUtils.error("script %s could not be attached to a %s node (incompatible base type?)" % [script_path, node.get_class()], "attach_failed")

	var inspected := false
	if editor.has_method("inspect_object"):
		editor.inspect_object(node)
		inspected = true

	# The script is already attached; a failed post-attach save must NOT be
	# reported as a total failure (it would look like the attach failed).
	# Surface the save problem as a soft warning instead.
	var saved := false
	var save_error := ""
	if bool(body.get("saveScene", false)):
		var save_result_raw = save_current_scene.call({})
		var save_result := NiuaMcpScriptEditorAuthoringUtils.callback_dictionary_result(save_result_raw, "save_current_scene")
		if save_result.get("ok", false):
			saved = true
		else:
			save_error = str(save_result.get("error", "failed to save scene"))

	var root_raw = edited_scene_root.call()
	var root := root_raw as Node if root_raw is Node else null
	return {
		"ok": true,
		"data": {
			"node": NiuaMcpNodeSnapshot.selection_item(node, root),
			"script": {
				"path": script_path,
				"type": script.get_class()
			},
			"created": created,
			"reloadError": reload_error,
			"inspected": inspected,
			"saved": saved,
			"saveError": save_error
		}
	}
