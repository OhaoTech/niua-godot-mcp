@tool
extends RefCounted

const NiuaMcpJsonArgErrors = preload("niua_mcp_json_arg_errors.gd")
const NiuaMcpJsonScalarArgs = preload("niua_mcp_json_scalar_args.gd")


static func vector2i_from_json(value, field_name: String, fallback: Vector2i = Vector2i.ZERO, positive: bool = false) -> Dictionary:
	if value == null:
		return {
			"ok": true,
			"value": fallback
		}

	var raw_x = null
	var raw_y = null
	if typeof(value) == TYPE_ARRAY:
		var array: Array = value
		if array.size() != 2:
			return NiuaMcpJsonArgErrors.error("%s array must have exactly 2 entries" % field_name)
		raw_x = array[0]
		raw_y = array[1]
	elif typeof(value) == TYPE_DICTIONARY:
		var dictionary: Dictionary = value
		if not dictionary.has("x") or not dictionary.has("y"):
			return NiuaMcpJsonArgErrors.error("%s object must include x and y" % field_name)
		raw_x = dictionary.get("x")
		raw_y = dictionary.get("y")
	else:
		return NiuaMcpJsonArgErrors.error("%s must be a [x,y] array or {x,y} object" % field_name)

	var x_result := NiuaMcpJsonScalarArgs.integer(raw_x, "%s.x" % field_name)
	if not x_result.get("ok", false):
		return x_result
	var y_result := NiuaMcpJsonScalarArgs.integer(raw_y, "%s.y" % field_name)
	if not y_result.get("ok", false):
		return y_result

	var vector := Vector2i(int(x_result.get("value")), int(y_result.get("value")))
	if positive and (vector.x <= 0 or vector.y <= 0):
		return NiuaMcpJsonArgErrors.error("%s entries must be greater than 0" % field_name)

	return {
		"ok": true,
		"value": vector
	}


static func vector2i_to_json(value: Vector2i) -> Dictionary:
	return {
		"x": value.x,
		"y": value.y
	}
