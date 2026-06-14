@tool
extends RefCounted

const NiuaMcpScriptEditorCursorState = preload("niua_mcp_script_editor_cursor_state.gd")
const NiuaMcpScriptEditorOverviewState = preload("niua_mcp_script_editor_overview_state.gd")


static func script_editor_state(editor: EditorInterface) -> Dictionary:
	return NiuaMcpScriptEditorOverviewState.script_editor_state(editor)


static func script_cursor_state(editor: EditorInterface) -> Dictionary:
	return NiuaMcpScriptEditorCursorState.script_cursor_state(editor)
