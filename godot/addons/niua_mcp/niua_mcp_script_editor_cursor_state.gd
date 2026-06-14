@tool
extends RefCounted

const NiuaMcpScriptEditorCaretSnapshot = preload("niua_mcp_script_editor_caret_snapshot.gd")
const NiuaMcpScriptEditorCursorContext = preload("niua_mcp_script_editor_cursor_context.gd")


static func script_cursor_state(editor: EditorInterface) -> Dictionary:
	if editor == null or not editor.has_method("get_script_editor"):
		return NiuaMcpScriptEditorCursorContext.error("Godot editor does not expose get_script_editor")

	var script_editor = editor.get_script_editor()
	if script_editor == null:
		return NiuaMcpScriptEditorCursorContext.unavailable_response(false, "script editor is unavailable")

	var current_script = NiuaMcpScriptEditorCursorContext.current_script_summary(script_editor)

	var editor_base = NiuaMcpScriptEditorCursorContext.current_editor_base(script_editor)
	if editor_base == null:
		return NiuaMcpScriptEditorCursorContext.unavailable_response(true, "no current script editor", current_script)

	var current_editor = NiuaMcpScriptEditorCursorContext.current_editor_summary(editor_base)
	var base_editor = null
	if editor_base.has_method("get_base_editor"):
		base_editor = editor_base.get_base_editor()
	if base_editor == null or not base_editor.has_method("get_caret_count"):
		return NiuaMcpScriptEditorCursorContext.unavailable_response(true, "current script editor does not expose a TextEdit-compatible base editor", current_script, current_editor)

	var line_count := NiuaMcpScriptEditorCaretSnapshot.line_count(base_editor)
	var visible_range = NiuaMcpScriptEditorCaretSnapshot.visible_range(base_editor)
	var carets := NiuaMcpScriptEditorCaretSnapshot.carets(base_editor, line_count)

	return {
		"ok": true,
		"data": {
			"available": true,
			"cursorAvailable": true,
			"currentScript": current_script,
			"currentEditor": current_editor,
			"baseEditor": {
				"type": base_editor.get_class(),
				"path": str(base_editor.get_path())
			},
			"lineCount": line_count,
			"visibleRange": visible_range,
			"carets": carets,
			"primaryCaret": carets[0] if carets.size() > 0 else null
		}
	}
