@tool
extends RefCounted


static func runtime_screenshot(probe: Node, request: Dictionary) -> Dictionary:
	var request_id := str(request.get("requestId", ""))
	if DisplayServer.get_name() == "headless":
		return runtime_screenshot_unavailable(
			request_id,
			"runtime screenshots require a rendered viewport; headless mode uses Godot's dummy renderer"
		)

	var viewport := probe.get_viewport()
	if viewport == null:
		return runtime_screenshot_unavailable(request_id, "runtime viewport is unavailable")

	var texture := viewport.get_texture()
	if texture == null:
		return runtime_screenshot_unavailable(request_id, "runtime viewport texture is unavailable")

	var image := texture.get_image()
	if image == null or image.is_empty():
		return runtime_screenshot_unavailable(request_id, "runtime viewport image is unavailable")

	var png := image.save_png_to_buffer()
	if png.is_empty():
		return runtime_screenshot_unavailable(request_id, "failed to encode runtime screenshot as PNG")

	return {
		"requestId": request_id,
		"available": true,
		"width": image.get_width(),
		"height": image.get_height(),
		"mimeType": "image/png",
		"encoding": "base64",
		"data": Marshalls.raw_to_base64(png)
	}


static func runtime_screenshot_unavailable(request_id: String, reason: String) -> Dictionary:
	return {
		"requestId": request_id,
		"available": false,
		"reason": reason,
		"width": 0,
		"height": 0,
		"mimeType": "image/png",
		"encoding": "base64",
		"data": ""
	}
