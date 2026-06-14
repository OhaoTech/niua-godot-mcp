@tool
extends RefCounted

const EDITOR_MAIN_SCREENS := ["2D", "3D", "Script", "Game", "AssetLib"]


static func main_screen_state(editor: EditorInterface) -> Dictionary:
	if editor == null or not editor.has_method("get_editor_main_screen"):
		return {
			"available": false,
			"reason": "Godot editor does not expose get_editor_main_screen"
		}

	var main_screen := editor.get_editor_main_screen()
	if main_screen == null:
		return {
			"available": false,
			"reason": "editor main screen is unavailable"
		}

	return {
		"available": true,
		"name": str(main_screen.name),
		"type": main_screen.get_class(),
		"visible": main_screen.visible,
		"path": str(main_screen.get_path())
	}


static func set_main_screen_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := set_main_screen(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Switched editor main screen to %s" % str(data.get("screen", "")))
	return response


static func set_main_screen(editor: EditorInterface, body: Dictionary) -> Dictionary:
	if editor == null:
		return _error("Godot editor interface is unavailable")
	if not editor.has_method("set_main_screen_editor"):
		return _error("Godot editor does not expose set_main_screen_editor")

	var screen := _normalize_editor_main_screen(str(body.get("screen", "")))
	if screen.is_empty():
		return _error("screen is required")
	if not EDITOR_MAIN_SCREENS.has(screen):
		return _error("unsupported editor main screen: %s" % screen)

	editor.set_main_screen_editor(screen)
	return {
		"ok": true,
		"data": {
			"screen": screen,
			"mainScreen": main_screen_state(editor)
		}
	}


static func _normalize_editor_main_screen(raw_screen: String) -> String:
	var screen := raw_screen.strip_edges()
	for known_screen in EDITOR_MAIN_SCREENS:
		if screen.to_lower() == str(known_screen).to_lower():
			return str(known_screen)
	return screen


static func _remember(remember: Callable, message: String) -> void:
	if remember.is_valid():
		remember.call(message)


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
