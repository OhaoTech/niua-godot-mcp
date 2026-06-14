@tool
extends RefCounted

const NiuaMcpJsonArgErrors = preload("niua_mcp_json_arg_errors.gd")


static func integer(value, field_name: String) -> Dictionary:
	match typeof(value):
		TYPE_INT:
			return {
				"ok": true,
				"value": int(value)
			}
		TYPE_FLOAT:
			var number := float(value)
			if number == floor(number):
				return {
					"ok": true,
					"value": int(number)
				}
		TYPE_STRING:
			var text := str(value).strip_edges()
			if text.is_valid_int():
				return {
					"ok": true,
					"value": int(text)
				}

	return NiuaMcpJsonArgErrors.error("%s must be an integer" % field_name)


static func non_negative_number(value, field_name: String) -> Dictionary:
	var number := 0.0
	match typeof(value):
		TYPE_INT, TYPE_FLOAT:
			number = float(value)
		TYPE_STRING:
			var text := str(value).strip_edges()
			if not text.is_valid_float():
				return NiuaMcpJsonArgErrors.error("%s must be a number" % field_name)
			number = text.to_float()
		_:
			return NiuaMcpJsonArgErrors.error("%s must be a number" % field_name)

	if number < 0.0:
		return NiuaMcpJsonArgErrors.error("%s must be non-negative" % field_name)
	return {
		"ok": true,
		"value": number
	}
