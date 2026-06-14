@tool
extends RefCounted


static func scene_tab_state(editor: EditorInterface, extra: Dictionary = {}) -> Dictionary:
	var data := {
		"currentScene": current_scene_path(editor),
		"openScenes": open_scenes(editor)
	}
	for key in extra.keys():
		data[key] = extra[key]
	return {
		"ok": true,
		"data": data
	}


static func open_scene_tabs(editor: EditorInterface) -> Dictionary:
	var current_scene := current_scene_path(editor)
	var open_scene_paths := open_scenes(editor)
	var open_scene_roots := []
	if editor != null and editor.has_method("get_open_scene_roots"):
		open_scene_roots = editor.get_open_scene_roots()

	var undo_manager = null
	if editor != null and editor.has_method("get_editor_undo_redo"):
		undo_manager = editor.get_editor_undo_redo()

	var tabs := []
	var current_index := -1

	for index in range(open_scene_paths.size()):
		var scene_path := str(open_scene_paths[index])
		var is_current := scene_path == current_scene
		if is_current:
			current_index = index

		var root: Node = open_scene_roots[index] as Node if index < open_scene_roots.size() else null
		tabs.append(_scene_tab_metadata(editor, index, scene_path, is_current, root, undo_manager))

	return {
		"ok": true,
		"data": {
			"currentScene": current_scene,
			"currentIndex": current_index,
			"openScenes": open_scene_paths,
			"tabs": tabs
		}
	}


static func current_scene_path(editor: EditorInterface) -> String:
	var root := edited_scene_root(editor)
	if root == null:
		return ""
	return root.scene_file_path


static func open_scenes(editor: EditorInterface) -> Array:
	if editor == null or not editor.has_method("get_open_scenes"):
		return []

	var scenes := []
	for scene_path in editor.get_open_scenes():
		scenes.append(str(scene_path))
	return scenes


static func edited_scene_root(editor: EditorInterface) -> Node:
	if editor == null:
		return null
	return editor.get_edited_scene_root()


static func _scene_tab_metadata(editor: EditorInterface, index: int, scene_path: String, is_current: bool, root: Node, undo_manager) -> Dictionary:
	var metadata := {
		"index": index,
		"path": scene_path,
		"current": is_current,
		"rootName": "",
		"rootType": "",
		"rootPath": "",
		"rootSceneFilePath": "",
		"edited": false,
		"unsaved": false,
		"dirtySource": "unavailable",
		"historyId": null,
		"historyVersion": null,
		"hasUndo": false,
		"hasRedo": false
	}

	if root == null:
		return metadata

	metadata["rootName"] = str(root.name)
	metadata["rootType"] = root.get_class()
	metadata["rootPath"] = str(root.get_path())
	metadata["rootSceneFilePath"] = root.scene_file_path

	if editor != null and editor.has_method("is_object_edited"):
		var edited := editor.is_object_edited(root)
		metadata["edited"] = edited
		metadata["unsaved"] = edited
		metadata["dirtySource"] = "EditorInterface.is_object_edited"

	if undo_manager != null:
		var history_id := int(undo_manager.get_object_history_id(root))
		metadata["historyId"] = history_id
		var undo_redo = undo_manager.get_history_undo_redo(history_id)
		if undo_redo != null:
			metadata["historyVersion"] = undo_redo.get_version()
			metadata["hasUndo"] = undo_redo.has_undo()
			metadata["hasRedo"] = undo_redo.has_redo()

	return metadata
