@tool
extends RefCounted

const NiuaMcpViewportResolver = preload("niua_mcp_viewport_resolver.gd")
const NiuaMcpViewportUtils = preload("niua_mcp_viewport_utils.gd")


static func capture_viewport_screenshot(editor: EditorInterface, query: Dictionary) -> Dictionary:
	if editor == null:
		return NiuaMcpViewportUtils.error("Godot editor interface is unavailable")

	var viewport_kind := str(query.get("viewport", "3d")).to_lower()
	var index := int(query.get("index", 0))
	var resolved := NiuaMcpViewportResolver.resolve_editor_viewport(editor, viewport_kind, index)
	if not resolved.get("ok", false):
		return resolved

	var viewport := resolved.get("viewport") as SubViewport
	index = int(resolved.get("index", index))
	if viewport == null:
		return NiuaMcpViewportUtils.error("editor viewport unavailable: %s" % viewport_kind, "not_found")

	if DisplayServer.get_name() == "headless":
		return NiuaMcpViewportUtils.screenshot_unavailable(
			viewport_kind,
			index,
			"editor viewport screenshots require a rendered editor; headless mode uses Godot's dummy renderer"
		)

	var texture := viewport.get_texture()
	if texture == null:
		return NiuaMcpViewportUtils.screenshot_unavailable(viewport_kind, index, "editor viewport texture is unavailable")

	var image := texture.get_image()
	if image == null or image.is_empty():
		return NiuaMcpViewportUtils.screenshot_unavailable(viewport_kind, index, "editor viewport image is unavailable")

	var png := image.save_png_to_buffer()
	if png.is_empty():
		return NiuaMcpViewportUtils.screenshot_unavailable(viewport_kind, index, "failed to encode viewport screenshot as PNG")

	return {
		"ok": true,
		"data": {
			"viewport": viewport_kind,
			"index": index,
			"available": true,
			"width": image.get_width(),
			"height": image.get_height(),
			"mimeType": "image/png",
			"encoding": "base64",
			"data": Marshalls.raw_to_base64(png)
		}
	}
