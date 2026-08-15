@tool
extends RefCounted

const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")

const PRESETS := {
	"full_rect": Control.PRESET_FULL_RECT,
	"center": Control.PRESET_CENTER,
	"top_left": Control.PRESET_TOP_LEFT,
	"top_wide": Control.PRESET_TOP_WIDE,
	"bottom_wide": Control.PRESET_BOTTOM_WIDE,
	"left_wide": Control.PRESET_LEFT_WIDE,
	"right_wide": Control.PRESET_RIGHT_WIDE
}

const SIZE_FLAGS := {
	"shrink_begin": Control.SIZE_SHRINK_BEGIN,
	"fill": Control.SIZE_FILL,
	"expand": Control.SIZE_EXPAND,
	"expand_fill": Control.SIZE_EXPAND_FILL,
	"shrink_center": Control.SIZE_SHRINK_CENTER,
	"shrink_end": Control.SIZE_SHRINK_END
}


static func set_control_layout(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var node := NiuaMcpSceneNodeContext.resolve_node(editor, str(body.get("nodePath", "")))
	if node == null:
		return NiuaMcpSceneNodeContext.error("control node not found: %s" % str(body.get("nodePath", "")), "not_found")
	if not (node is Control):
		return NiuaMcpSceneNodeContext.error("node is not a Control: %s" % str(body.get("nodePath", "")))

	var result := apply_layout_to_control(node as Control, body)
	if not bool(result.get("ok", false)):
		return result

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, node),
			"layout": result.get("data", {})
		}
	}


static func apply_layout_to_control(control: Control, data: Dictionary) -> Dictionary:
	if data.has("preset"):
		var preset_name := str(data.get("preset", ""))
		if not PRESETS.has(preset_name):
			return NiuaMcpSceneNodeContext.error("unsupported Control preset: %s" % preset_name)
		control.set_anchors_preset(int(PRESETS[preset_name]), bool(data.get("keepOffsets", false)))

	if typeof(data.get("anchors", null)) == TYPE_DICTIONARY:
		_apply_anchors(control, data.get("anchors"))

	if typeof(data.get("offsets", null)) == TYPE_DICTIONARY:
		_apply_offsets(control, data.get("offsets"))

	if typeof(data.get("customMinimumSize", null)) == TYPE_DICTIONARY:
		control.custom_minimum_size = _vector2_from_json(data.get("customMinimumSize"))

	if data.has("horizontalSizeFlags"):
		var horizontal := str(data.get("horizontalSizeFlags", ""))
		if not SIZE_FLAGS.has(horizontal):
			return NiuaMcpSceneNodeContext.error("unsupported horizontal size flag: %s" % horizontal)
		control.size_flags_horizontal = int(SIZE_FLAGS[horizontal])

	if data.has("verticalSizeFlags"):
		var vertical := str(data.get("verticalSizeFlags", ""))
		if not SIZE_FLAGS.has(vertical):
			return NiuaMcpSceneNodeContext.error("unsupported vertical size flag: %s" % vertical)
		control.size_flags_vertical = int(SIZE_FLAGS[vertical])

	if _wants_offset_transform(data):
		var transform_result := apply_offset_transform_to_control(control, data)
		if not bool(transform_result.get("ok", false)):
			return transform_result

	return {
		"ok": true,
		"data": layout_snapshot(control)
	}


static func layout_snapshot(control: Control) -> Dictionary:
	return {
		"anchors": {
			"left": control.anchor_left,
			"top": control.anchor_top,
			"right": control.anchor_right,
			"bottom": control.anchor_bottom
		},
		"offsets": {
			"left": control.offset_left,
			"top": control.offset_top,
			"right": control.offset_right,
			"bottom": control.offset_bottom
		},
		"customMinimumSize": {
			"type": "Vector2",
			"x": control.custom_minimum_size.x,
			"y": control.custom_minimum_size.y
		},
		"horizontalSizeFlags": control.size_flags_horizontal,
		"verticalSizeFlags": control.size_flags_vertical,
		"offsetTransform": offset_transform_snapshot(control)
	}


static func _apply_anchors(control: Control, anchors: Dictionary) -> void:
	if anchors.has("left"):
		control.anchor_left = float(anchors.get("left"))
	if anchors.has("top"):
		control.anchor_top = float(anchors.get("top"))
	if anchors.has("right"):
		control.anchor_right = float(anchors.get("right"))
	if anchors.has("bottom"):
		control.anchor_bottom = float(anchors.get("bottom"))


static func _apply_offsets(control: Control, offsets: Dictionary) -> void:
	if offsets.has("left"):
		control.offset_left = float(offsets.get("left"))
	if offsets.has("top"):
		control.offset_top = float(offsets.get("top"))
	if offsets.has("right"):
		control.offset_right = float(offsets.get("right"))
	if offsets.has("bottom"):
		control.offset_bottom = float(offsets.get("bottom"))


static func set_control_offset_transform(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var node := NiuaMcpSceneNodeContext.resolve_node(editor, str(body.get("nodePath", "")))
	if node == null:
		return NiuaMcpSceneNodeContext.error("control node not found: %s" % str(body.get("nodePath", "")), "not_found")
	if not (node is Control):
		return NiuaMcpSceneNodeContext.error("node is not a Control: %s" % str(body.get("nodePath", "")))

	var control := node as Control
	var result := apply_offset_transform_to_control(control, body)
	if not bool(result.get("ok", false)):
		return result

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, node),
			"offsetTransform": result.get("data", {})
		}
	}


static func apply_offset_transform_to_control(control: Control, data: Dictionary) -> Dictionary:
	if not control.has_method("set_offset_transform_enabled"):
		return NiuaMcpSceneNodeContext.error("Control offset transforms require Godot 4.7+")

	if data.has("enabled"):
		control.offset_transform_enabled = bool(data.get("enabled"))
	elif _wants_offset_transform(data):
		control.offset_transform_enabled = true

	if typeof(data.get("position", null)) == TYPE_DICTIONARY or typeof(data.get("position", null)) == TYPE_ARRAY:
		control.offset_transform_position = _vector2_from_any(data.get("position"))
	if typeof(data.get("positionRatio", null)) == TYPE_DICTIONARY or typeof(data.get("positionRatio", null)) == TYPE_ARRAY:
		control.offset_transform_position_ratio = _vector2_from_any(data.get("positionRatio"))
	if data.has("rotationDegrees"):
		control.offset_transform_rotation = deg_to_rad(float(data.get("rotationDegrees")))
	elif data.has("rotation"):
		control.offset_transform_rotation = float(data.get("rotation"))
	if typeof(data.get("scale", null)) == TYPE_DICTIONARY or typeof(data.get("scale", null)) == TYPE_ARRAY:
		control.offset_transform_scale = _vector2_from_any(data.get("scale"))
	if typeof(data.get("pivot", null)) == TYPE_DICTIONARY or typeof(data.get("pivot", null)) == TYPE_ARRAY:
		control.offset_transform_pivot = _vector2_from_any(data.get("pivot"))
	if typeof(data.get("pivotRatio", null)) == TYPE_DICTIONARY or typeof(data.get("pivotRatio", null)) == TYPE_ARRAY:
		control.offset_transform_pivot_ratio = _vector2_from_any(data.get("pivotRatio"))
	if data.has("visualOnly"):
		control.offset_transform_visual_only = bool(data.get("visualOnly"))

	return {
		"ok": true,
		"data": offset_transform_snapshot(control)
	}


static func offset_transform_snapshot(control: Control) -> Dictionary:
	if not control.has_method("is_offset_transform_enabled"):
		return {
			"available": false
		}
	return {
		"available": true,
		"enabled": control.offset_transform_enabled,
		"position": _vector2_to_json(control.offset_transform_position),
		"positionRatio": _vector2_to_json(control.offset_transform_position_ratio),
		"rotation": control.offset_transform_rotation,
		"rotationDegrees": rad_to_deg(control.offset_transform_rotation),
		"scale": _vector2_to_json(control.offset_transform_scale),
		"pivot": _vector2_to_json(control.offset_transform_pivot),
		"pivotRatio": _vector2_to_json(control.offset_transform_pivot_ratio),
		"visualOnly": control.offset_transform_visual_only
	}


static func _wants_offset_transform(data: Dictionary) -> bool:
	return data.has("enabled") \
		or data.has("position") \
		or data.has("positionRatio") \
		or data.has("rotation") \
		or data.has("rotationDegrees") \
		or data.has("scale") \
		or data.has("pivot") \
		or data.has("pivotRatio") \
		or data.has("visualOnly")


static func _vector2_from_json(value: Dictionary) -> Vector2:
	return Vector2(float(value.get("x", 0.0)), float(value.get("y", 0.0)))


static func _vector2_from_any(value) -> Vector2:
	if typeof(value) == TYPE_ARRAY and value.size() >= 2:
		return Vector2(float(value[0]), float(value[1]))
	if typeof(value) == TYPE_DICTIONARY:
		return _vector2_from_json(value)
	return Vector2.ZERO


static func _vector2_to_json(value: Vector2) -> Dictionary:
	return {
		"type": "Vector2",
		"x": value.x,
		"y": value.y
	}
