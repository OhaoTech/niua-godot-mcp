@tool
extends RefCounted


static func capture_editor_screenshot(editor: EditorInterface) -> Dictionary:
	if editor == null:
		return _error("Godot editor interface is unavailable")
	if not editor.has_method("get_base_control"):
		return _error("Godot editor does not expose get_base_control")

	var base_control := editor.get_base_control()
	if base_control == null:
		return _editor_screenshot_unavailable("editor base control is unavailable")

	var viewport := base_control.get_viewport()
	if viewport == null:
		return _editor_screenshot_unavailable("editor viewport is unavailable")

	if DisplayServer.get_name() == "headless":
		return _editor_screenshot_unavailable(
			"editor screenshots require a rendered editor; headless mode uses Godot's dummy renderer"
		)

	var texture := viewport.get_texture()
	if texture == null:
		return _editor_screenshot_unavailable("editor viewport texture is unavailable")

	var image := texture.get_image()
	if image == null or image.is_empty():
		return _editor_screenshot_unavailable("editor viewport image is unavailable")

	var png := image.save_png_to_buffer()
	if png.is_empty():
		return _editor_screenshot_unavailable("failed to encode editor screenshot as PNG")

	return {
		"ok": true,
		"data": {
			"available": true,
			"width": image.get_width(),
			"height": image.get_height(),
			"mimeType": "image/png",
			"encoding": "base64",
			"data": Marshalls.raw_to_base64(png)
		}
	}


static func _editor_screenshot_unavailable(reason: String) -> Dictionary:
	return {
		"ok": true,
		"data": {
			"available": false,
			"reason": reason
		}
	}


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
