@tool
extends RefCounted


static func remember(remember: Callable, message: String) -> void:
	if remember.is_valid():
		remember.call(message)


static func error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}


static func edited_scene_root(editor: EditorInterface) -> Node:
	if editor == null:
		return null
	return editor.get_edited_scene_root()
