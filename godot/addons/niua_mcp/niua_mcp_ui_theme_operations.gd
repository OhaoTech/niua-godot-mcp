@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")


static func create_ui_theme(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_res_path(str(body.get("path", "")))
	if not bool(validation.get("ok", false)):
		return validation

	var path := str(validation.get("path", ""))
	var overwrite := bool(body.get("overwrite", false))
	if (FileAccess.file_exists(path) or ResourceLoader.exists(path)) and not overwrite:
		return NiuaMcpSceneNodeContext.error("theme resource already exists: %s" % path)

	var theme := Theme.new()
	if body.has("defaultFontSize"):
		theme.default_font_size = int(body.get("defaultFontSize"))

	var type_styles = body.get("typeStyles", [])
	if typeof(type_styles) == TYPE_ARRAY:
		for style in type_styles:
			if typeof(style) == TYPE_DICTIONARY:
				var style_result := _apply_type_style(theme, style)
				if not bool(style_result.get("ok", false)):
					return style_result

	var parent_error := NiuaMcpPathUtils.ensure_parent_directory(path)
	if parent_error != OK:
		return NiuaMcpSceneNodeContext.error("failed to create parent directory for %s: %s" % [path, parent_error])

	var save_error := ResourceSaver.save(theme, path)
	if save_error != OK:
		return NiuaMcpSceneNodeContext.error("failed to save theme %s: %s" % [path, save_error])

	if refresh_filesystem.is_valid():
		refresh_filesystem.call(path)

	var applied_to := ""
	var apply_to := str(body.get("applyToNodePath", ""))
	if not apply_to.is_empty():
		var node := NiuaMcpSceneNodeContext.resolve_node(editor, apply_to)
		if node == null:
			return NiuaMcpSceneNodeContext.error("control node not found: %s" % apply_to, "not_found")
		if not (node is Control):
			return NiuaMcpSceneNodeContext.error("node is not a Control: %s" % apply_to)
		(node as Control).theme = theme
		applied_to = NiuaMcpSceneNodeContext.node_path_for_response(editor, node)

	return {
		"ok": true,
		"data": {
			"path": path,
			"type": "Theme",
			"saved": true,
			"overwrote": overwrite,
			"defaultFontSize": theme.default_font_size,
			"appliedToNodePath": applied_to
		}
	}


static func apply_ui_theme_override(editor: EditorInterface, body: Dictionary, path_validator: Callable) -> Dictionary:
	var node := NiuaMcpSceneNodeContext.resolve_node(editor, str(body.get("nodePath", "")))
	if node == null:
		return NiuaMcpSceneNodeContext.error("control node not found: %s" % str(body.get("nodePath", "")), "not_found")
	if not (node is Control):
		return NiuaMcpSceneNodeContext.error("node is not a Control: %s" % str(body.get("nodePath", "")))

	var control := node as Control
	var theme_path := str(body.get("themePath", ""))
	if not theme_path.is_empty():
		if not path_validator.is_valid():
			return NiuaMcpSceneNodeContext.error("resource path validator is unavailable")
		var validation = path_validator.call(theme_path)
		if typeof(validation) != TYPE_DICTIONARY or not bool(validation.get("ok", false)):
			return validation
		var path := str(validation.get("path", ""))
		var theme := ResourceLoader.load(path, "Theme", ResourceLoader.CACHE_MODE_IGNORE)
		if not (theme is Theme):
			return NiuaMcpSceneNodeContext.error("theme resource not found: %s" % path, "not_found")
		control.theme = theme

	if body.has("themeTypeVariation"):
		control.theme_type_variation = StringName(str(body.get("themeTypeVariation", "")))

	var applied := _apply_control_overrides(control, body)
	if not bool(applied.get("ok", false)):
		return applied

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, control),
			"themePath": control.theme.resource_path if control.theme != null else "",
			"themeTypeVariation": str(control.theme_type_variation),
			"overrides": applied.get("data", {})
		}
	}


static func _apply_type_style(theme: Theme, data: Dictionary) -> Dictionary:
	var type_name := StringName(str(data.get("typeName", "Control")))
	var font_sizes: Dictionary = data.get("fontSizes", {}) if typeof(data.get("fontSizes", {})) == TYPE_DICTIONARY else {}
	for item_name in font_sizes.keys():
		theme.set_font_size(StringName(str(item_name)), type_name, int(font_sizes[item_name]))

	var colors: Dictionary = data.get("colors", {}) if typeof(data.get("colors", {})) == TYPE_DICTIONARY else {}
	for item_name in colors.keys():
		var color_result := _color_from_json(colors[item_name])
		if not bool(color_result.get("ok", false)):
			return color_result
		theme.set_color(StringName(str(item_name)), type_name, color_result.get("color"))

	var constants: Dictionary = data.get("constants", {}) if typeof(data.get("constants", {})) == TYPE_DICTIONARY else {}
	for item_name in constants.keys():
		theme.set_constant(StringName(str(item_name)), type_name, int(constants[item_name]))

	var styleboxes: Dictionary = data.get("styleboxes", {}) if typeof(data.get("styleboxes", {})) == TYPE_DICTIONARY else {}
	for item_name in styleboxes.keys():
		var box_result := _stylebox_from_json(styleboxes[item_name])
		if not bool(box_result.get("ok", false)):
			return box_result
		theme.set_stylebox(StringName(str(item_name)), type_name, box_result.get("stylebox"))

	return { "ok": true }


static func _apply_control_overrides(control: Control, data: Dictionary) -> Dictionary:
	var applied := {
		"fontSizes": {},
		"colors": {},
		"constants": {},
		"styleboxes": []
	}

	var font_sizes: Dictionary = data.get("fontSizes", {}) if typeof(data.get("fontSizes", {})) == TYPE_DICTIONARY else {}
	for item_name in font_sizes.keys():
		var key := StringName(str(item_name))
		var value := int(font_sizes[item_name])
		control.add_theme_font_size_override(key, value)
		applied["fontSizes"][str(item_name)] = value

	var colors: Dictionary = data.get("colors", {}) if typeof(data.get("colors", {})) == TYPE_DICTIONARY else {}
	for item_name in colors.keys():
		var color_result := _color_from_json(colors[item_name])
		if not bool(color_result.get("ok", false)):
			return color_result
		var key := StringName(str(item_name))
		var color: Color = color_result.get("color")
		control.add_theme_color_override(key, color)
		applied["colors"][str(item_name)] = _color_to_json(color)

	var constants: Dictionary = data.get("constants", {}) if typeof(data.get("constants", {})) == TYPE_DICTIONARY else {}
	for item_name in constants.keys():
		var key := StringName(str(item_name))
		var value := int(constants[item_name])
		control.add_theme_constant_override(key, value)
		applied["constants"][str(item_name)] = value

	var styleboxes: Dictionary = data.get("styleboxes", {}) if typeof(data.get("styleboxes", {})) == TYPE_DICTIONARY else {}
	for item_name in styleboxes.keys():
		var box_result := _stylebox_from_json(styleboxes[item_name])
		if not bool(box_result.get("ok", false)):
			return box_result
		control.add_theme_stylebox_override(StringName(str(item_name)), box_result.get("stylebox"))
		applied["styleboxes"].append(str(item_name))

	return {
		"ok": true,
		"data": applied
	}


static func _stylebox_from_json(value) -> Dictionary:
	if typeof(value) != TYPE_DICTIONARY:
		return NiuaMcpSceneNodeContext.error("stylebox override must be an object")

	var box := StyleBoxFlat.new()
	if value.has("bgColor"):
		var bg_result := _color_from_json(value.get("bgColor"))
		if not bool(bg_result.get("ok", false)):
			return bg_result
		box.bg_color = bg_result.get("color")
	if value.has("borderColor"):
		var border_result := _color_from_json(value.get("borderColor"))
		if not bool(border_result.get("ok", false)):
			return border_result
		box.border_color = border_result.get("color")
	if value.has("borderWidth"):
		box.set_border_width_all(int(value.get("borderWidth")))
	if value.has("cornerRadius"):
		box.set_corner_radius_all(int(value.get("cornerRadius")))

	return {
		"ok": true,
		"stylebox": box
	}


static func _color_from_json(value) -> Dictionary:
	if value is Color:
		return {
			"ok": true,
			"color": value
		}
	if typeof(value) != TYPE_DICTIONARY:
		return NiuaMcpSceneNodeContext.error("theme color value must be a Color object")
	if str(value.get("type", "")) != "Color":
		return NiuaMcpSceneNodeContext.error("theme color value must use type Color")
	return {
		"ok": true,
		"color": Color(
			float(value.get("r", 1.0)),
			float(value.get("g", 1.0)),
			float(value.get("b", 1.0)),
			float(value.get("a", 1.0))
		)
	}


static func _color_to_json(color: Color) -> Dictionary:
	return {
		"type": "Color",
		"r": color.r,
		"g": color.g,
		"b": color.b,
		"a": color.a
	}
