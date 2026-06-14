@tool
extends RefCounted

const NiuaMcpSceneTabState = preload("niua_mcp_scene_tab_state.gd")
const NiuaMcpSceneTabControl = preload("niua_mcp_scene_tab_control.gd")
const NiuaMcpSceneTabUndoRedo = preload("niua_mcp_scene_tab_undo_redo.gd")
const NiuaMcpSceneTabSideEffects = preload("niua_mcp_scene_tab_side_effects.gd")


static func open_scene_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneTabSideEffects.open_scene_with_side_effects(editor, body, remember)


static func open_scene(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneTabControl.open_scene(editor, body)


static func scene_tab_state(editor: EditorInterface, extra: Dictionary = {}) -> Dictionary:
	return NiuaMcpSceneTabState.scene_tab_state(editor, extra)


static func open_scene_tabs(editor: EditorInterface) -> Dictionary:
	return NiuaMcpSceneTabState.open_scene_tabs(editor)


static func switch_scene_tab_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneTabSideEffects.switch_scene_tab_with_side_effects(editor, body, remember)


static func switch_scene_tab(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneTabControl.switch_scene_tab(editor, body)


static func close_scene_tab_with_side_effects(editor: EditorInterface, body: Dictionary, save_current_scene: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpSceneTabSideEffects.close_scene_tab_with_side_effects(editor, body, save_current_scene, remember)


static func close_scene_tab(editor: EditorInterface, body: Dictionary, save_current_scene: Callable) -> Dictionary:
	return NiuaMcpSceneTabControl.close_scene_tab(editor, body, save_current_scene)


static func mark_scene_unsaved_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneTabSideEffects.mark_scene_unsaved_with_side_effects(editor, body, remember)


static func mark_scene_unsaved(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneTabControl.mark_scene_unsaved(editor, body)


static func undo_editor_action_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneTabSideEffects.undo_editor_action_with_side_effects(editor, body, remember)


static func undo_editor_action(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneTabUndoRedo.undo_editor_action(editor, body)


static func redo_editor_action_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneTabSideEffects.redo_editor_action_with_side_effects(editor, body, remember)


static func redo_editor_action(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneTabUndoRedo.redo_editor_action(editor, body)
