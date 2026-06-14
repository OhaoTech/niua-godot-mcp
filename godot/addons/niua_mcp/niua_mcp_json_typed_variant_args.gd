@tool
extends RefCounted

const NiuaMcpJsonArgErrors = preload("niua_mcp_json_arg_errors.gd")
const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")


static func typed_vector2(value, field_name: String, path_validator: Callable = Callable()) -> Dictionary:
	var converted = NiuaMcpVariantCodec.json_to_variant(value, path_validator)
	if typeof(converted) != TYPE_VECTOR2:
		return NiuaMcpJsonArgErrors.error("%s must be a typed Vector2 JSON value" % field_name)
	return {
		"ok": true,
		"value": converted
	}


static func typed_vector3(value, field_name: String, path_validator: Callable = Callable()) -> Dictionary:
	var converted = NiuaMcpVariantCodec.json_to_variant(value, path_validator)
	if typeof(converted) != TYPE_VECTOR3:
		return NiuaMcpJsonArgErrors.error("%s must be a typed Vector3 JSON value" % field_name)
	return {
		"ok": true,
		"value": converted
	}


static func typed_color(value, field_name: String, path_validator: Callable = Callable()) -> Dictionary:
	var converted = NiuaMcpVariantCodec.json_to_variant(value, path_validator)
	if typeof(converted) != TYPE_COLOR:
		return NiuaMcpJsonArgErrors.error("%s must be a typed Color JSON value" % field_name)
	return {
		"ok": true,
		"value": converted
	}
