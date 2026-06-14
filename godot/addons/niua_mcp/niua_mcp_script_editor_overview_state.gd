@tool
extends RefCounted

const NiuaMcpDebuggerRuntimeOperations = preload("niua_mcp_debugger_runtime_operations.gd")
const NiuaMcpScriptFileOperations = preload("niua_mcp_script_file_operations.gd")


static func script_editor_state(editor: EditorInterface) -> Dictionary:
	if editor == null or not editor.has_method("get_script_editor"):
		return _error("Godot editor does not expose get_script_editor")

	var script_editor = editor.get_script_editor()
	if script_editor == null:
		return {
			"ok": true,
			"data": {
				"available": false,
				"reason": "script editor is unavailable"
			}
		}

	var open_scripts := []
	if script_editor.has_method("get_open_scripts"):
		for script in script_editor.get_open_scripts():
			open_scripts.append(NiuaMcpScriptFileOperations.resource_summary(script))

	var breakpoints := []
	if script_editor.has_method("get_breakpoints"):
		for raw_breakpoint in script_editor.get_breakpoints():
			breakpoints.append(NiuaMcpDebuggerRuntimeOperations.debugger_breakpoint_summary(str(raw_breakpoint)))

	var current_script = null
	if script_editor.has_method("get_current_script"):
		var current_script_resource = script_editor.get_current_script()
		if current_script_resource != null:
			current_script = NiuaMcpScriptFileOperations.resource_summary(current_script_resource)

	var current_editor = null
	if script_editor.has_method("get_current_editor"):
		var editor_base = script_editor.get_current_editor()
		if editor_base != null:
			current_editor = {
				"type": editor_base.get_class(),
				"path": str(editor_base.get_path())
			}

	return {
		"ok": true,
		"data": {
			"available": true,
			"currentScript": current_script,
			"openScripts": open_scripts,
			"breakpoints": breakpoints,
			"currentEditor": current_editor
		}
	}


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
