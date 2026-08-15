@tool
extends RefCounted

const NiuaMcpJsonArgs = preload("niua_mcp_json_args.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpResourceOperationUtils = preload("niua_mcp_resource_operation_utils.gd")
const NiuaMcpVersionSupport = preload("niua_mcp_version_support.gd")

const FORMATS := {
	"rgba8": 0,
	"drawable_format_rgba8": 0,
	"rgba8_srgb": 1,
	"drawable_format_rgba8_srgb": 1,
	"rgbah": 2,
	"drawable_format_rgbah": 2,
	"rgbaf": 3,
	"drawable_format_rgbaf": 3
}


static func create_drawable_texture_2d(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	if not ClassDB.class_exists("DrawableTexture2D"):
		return NiuaMcpResourceOperationUtils.error(
			NiuaMcpVersionSupport.unknown_class_message("DrawableTexture2D")
		)

	var validation := NiuaMcpPathUtils.validate_res_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation
	var path := str(validation.get("path"))

	var overwrite := bool(body.get("overwrite", false))
	if (FileAccess.file_exists(path) or ResourceLoader.exists(path)) and not overwrite:
		return NiuaMcpResourceOperationUtils.error("resource already exists: %s" % path)

	var width_result := NiuaMcpJsonArgs.integer(body.get("width", 256), "width")
	if not bool(width_result.get("ok", false)):
		return width_result
	var height_result := NiuaMcpJsonArgs.integer(body.get("height", 256), "height")
	if not bool(height_result.get("ok", false)):
		return height_result
	var width := int(width_result.get("value"))
	var height := int(height_result.get("value"))
	if width <= 0 or height <= 0:
		return NiuaMcpResourceOperationUtils.error("width and height must be positive")

	var format := _format_from_body(body)
	if not bool(format.get("ok", false)):
		return format

	var color := Color.WHITE
	if body.has("color"):
		var color_result := _color_from_value(body.get("color"), "color")
		if not bool(color_result.get("ok", false)):
			return color_result
		color = color_result.get("value")

	var use_mipmaps := bool(body.get("useMipmaps", false))
	var texture: Resource = ClassDB.instantiate("DrawableTexture2D")
	if texture == null or not texture.has_method("setup"):
		if texture != null and texture is Object:
			texture.free()
		return NiuaMcpResourceOperationUtils.error("DrawableTexture2D.setup is unavailable (requires Godot 4.7+)")

	texture.setup(width, height, int(format.get("value")), color, use_mipmaps)

	if body.has("blit"):
		var blit_result := _blit_on_texture(texture, body.get("blit"))
		if not bool(blit_result.get("ok", false)):
			return blit_result

	var parent_error := NiuaMcpPathUtils.ensure_parent_directory(path)
	if parent_error != OK:
		return NiuaMcpResourceOperationUtils.error("failed to create parent directory for %s: %s" % [path, parent_error])

	var save_error := ResourceSaver.save(texture, path)
	if save_error != OK:
		return NiuaMcpResourceOperationUtils.error("failed to save DrawableTexture2D %s: %s" % [path, save_error])

	var opened := false
	if bool(body.get("open", true)) and editor != null and editor.has_method("edit_resource"):
		editor.edit_resource(texture)
		opened = true

	NiuaMcpResourceOperationUtils.refresh(refresh_filesystem)
	return {
		"ok": true,
		"data": {
			"path": path,
			"type": texture.get_class(),
			"width": width,
			"height": height,
			"format": int(format.get("value")),
			"useMipmaps": use_mipmaps,
			"saved": true,
			"opened": opened,
			"overwrote": overwrite
		}
	}


static func blit_drawable_texture_2d(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	if not ClassDB.class_exists("DrawableTexture2D"):
		return NiuaMcpResourceOperationUtils.error(
			NiuaMcpVersionSupport.unknown_class_message("DrawableTexture2D")
		)

	var validation := NiuaMcpPathUtils.validate_res_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation
	var path := str(validation.get("path"))
	if not FileAccess.file_exists(path) and not ResourceLoader.exists(path):
		return NiuaMcpResourceOperationUtils.error("resource not found: %s" % path, "not_found")

	var texture := ResourceLoader.load(path, "", ResourceLoader.CACHE_MODE_IGNORE)
	if texture == null or not texture.has_method("blit_rect"):
		return NiuaMcpResourceOperationUtils.error("resource is not a DrawableTexture2D: %s" % path)

	var blit_result := _blit_on_texture(texture, body)
	if not bool(blit_result.get("ok", false)):
		return blit_result

	var save_error := ResourceSaver.save(texture, path)
	if save_error != OK:
		return NiuaMcpResourceOperationUtils.error("failed to save DrawableTexture2D %s: %s" % [path, save_error])

	var opened := false
	if bool(body.get("open", false)) and editor != null and editor.has_method("edit_resource"):
		editor.edit_resource(texture)
		opened = true

	NiuaMcpResourceOperationUtils.refresh(refresh_filesystem)
	return {
		"ok": true,
		"data": {
			"path": path,
			"type": texture.get_class(),
			"saved": true,
			"opened": opened,
			"blit": blit_result.get("data", {})
		}
	}


static func _blit_on_texture(texture: Resource, raw_blit) -> Dictionary:
	if typeof(raw_blit) != TYPE_DICTIONARY:
		return NiuaMcpResourceOperationUtils.error("blit must be an object")
	var blit: Dictionary = raw_blit
	var source_path := str(blit.get("sourcePath", blit.get("source", "")))
	var source_validation := NiuaMcpPathUtils.validate_res_path(source_path)
	if not bool(source_validation.get("ok", false)):
		return source_validation
	source_path = str(source_validation.get("path"))
	if not ResourceLoader.exists(source_path) and not FileAccess.file_exists(source_path):
		return NiuaMcpResourceOperationUtils.error("blit source not found: %s" % source_path, "not_found")

	var source := ResourceLoader.load(source_path)
	if source == null or not (source is Texture2D):
		return NiuaMcpResourceOperationUtils.error("blit source is not a Texture2D: %s" % source_path)

	var rect := _rect2i_from_body(blit)
	if not bool(rect.get("ok", false)):
		return rect

	var modulate := Color.WHITE
	if blit.has("modulate"):
		var color_result := _color_from_value(blit.get("modulate"), "modulate")
		if not bool(color_result.get("ok", false)):
			return color_result
		modulate = color_result.get("value")

	var mipmap := 0
	if blit.has("mipmap"):
		var mipmap_result := NiuaMcpJsonArgs.integer(blit.get("mipmap"), "mipmap")
		if not bool(mipmap_result.get("ok", false)):
			return mipmap_result
		mipmap = int(mipmap_result.get("value"))

	texture.blit_rect(rect.get("value"), source, modulate, mipmap, null)
	return {
		"ok": true,
		"data": {
			"sourcePath": source_path,
			"rect": {
				"x": rect.get("value").position.x,
				"y": rect.get("value").position.y,
				"width": rect.get("value").size.x,
				"height": rect.get("value").size.y
			},
			"mipmap": mipmap
		}
	}


static func _format_from_body(body: Dictionary) -> Dictionary:
	if not body.has("format"):
		return { "ok": true, "value": 0 }
	var raw := str(body.get("format", "")).strip_edges().to_lower()
	if raw.is_valid_int():
		var numeric := int(raw)
		if numeric < 0 or numeric > 3:
			return NiuaMcpResourceOperationUtils.error("format must be rgba8, rgba8_srgb, rgbah, or rgbaf")
		return { "ok": true, "value": numeric }
	if not FORMATS.has(raw):
		return NiuaMcpResourceOperationUtils.error("format must be rgba8, rgba8_srgb, rgbah, or rgbaf")
	return { "ok": true, "value": int(FORMATS[raw]) }


static func _color_from_value(value, field_name: String) -> Dictionary:
	if typeof(value) == TYPE_STRING:
		var hex := str(value).strip_edges()
		if Color.html_is_valid(hex):
			return { "ok": true, "value": Color.html(hex) }
	return NiuaMcpJsonArgs.typed_color(value, field_name)


static func _rect2i_from_body(body: Dictionary) -> Dictionary:
	var rect_value = body.get("rect", body)
	if typeof(rect_value) != TYPE_DICTIONARY:
		return NiuaMcpResourceOperationUtils.error("rect must be an object with x, y, width, height")
	var rect: Dictionary = rect_value
	var x := int(rect.get("x", 0))
	var y := int(rect.get("y", 0))
	var width := int(rect.get("width", rect.get("w", 0)))
	var height := int(rect.get("height", rect.get("h", 0)))
	if width <= 0 or height <= 0:
		return NiuaMcpResourceOperationUtils.error("rect width and height must be positive")
	return {
		"ok": true,
		"value": Rect2i(x, y, width, height)
	}
