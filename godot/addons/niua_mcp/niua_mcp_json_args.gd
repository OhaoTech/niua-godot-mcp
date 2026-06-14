@tool
extends RefCounted

const NiuaMcpJsonScalarArgs = preload("niua_mcp_json_scalar_args.gd")
const NiuaMcpJsonVector2iArgs = preload("niua_mcp_json_vector2i_args.gd")
const NiuaMcpJsonTypedVariantArgs = preload("niua_mcp_json_typed_variant_args.gd")


static func integer(value, field_name: String) -> Dictionary:
	return NiuaMcpJsonScalarArgs.integer(value, field_name)


static func non_negative_number(value, field_name: String) -> Dictionary:
	return NiuaMcpJsonScalarArgs.non_negative_number(value, field_name)


static func vector2i_from_json(value, field_name: String, fallback: Vector2i = Vector2i.ZERO, positive: bool = false) -> Dictionary:
	return NiuaMcpJsonVector2iArgs.vector2i_from_json(value, field_name, fallback, positive)


static func vector2i_to_json(value: Vector2i) -> Dictionary:
	return NiuaMcpJsonVector2iArgs.vector2i_to_json(value)


static func typed_vector2(value, field_name: String, path_validator: Callable = Callable()) -> Dictionary:
	return NiuaMcpJsonTypedVariantArgs.typed_vector2(value, field_name, path_validator)


static func typed_vector3(value, field_name: String, path_validator: Callable = Callable()) -> Dictionary:
	return NiuaMcpJsonTypedVariantArgs.typed_vector3(value, field_name, path_validator)


static func typed_color(value, field_name: String, path_validator: Callable = Callable()) -> Dictionary:
	return NiuaMcpJsonTypedVariantArgs.typed_color(value, field_name, path_validator)
