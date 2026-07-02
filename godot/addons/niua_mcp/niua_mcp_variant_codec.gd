@tool
extends RefCounted


static func json_to_variant(value, path_validator: Callable = Callable()):
	# Schema-untyped ("any") tool params can reach us as a raw JSON STRING when the
	# client can't coerce them (e.g. set_node_property.value arrives as
	# '{"type":"Vector3",...}' or "[0,5.8,56]"). Parse an object/array-looking string
	# back to structure so typed values work without the caller wrapping them.
	if typeof(value) == TYPE_STRING:
		var trimmed := (value as String).strip_edges()
		if trimmed.begins_with("{") or trimmed.begins_with("["):
			var parsed = JSON.parse_string(trimmed)
			if parsed != null:
				value = parsed

	if typeof(value) != TYPE_DICTIONARY:
		return value

	var kind := str(value.get("type", ""))
	match kind:
		"Vector2":
			return Vector2(float(value.get("x", 0.0)), float(value.get("y", 0.0)))
		"Vector3":
			return Vector3(float(value.get("x", 0.0)), float(value.get("y", 0.0)), float(value.get("z", 0.0)))
		"Quaternion":
			return Quaternion(
				float(value.get("x", 0.0)),
				float(value.get("y", 0.0)),
				float(value.get("z", 0.0)),
				float(value.get("w", 1.0))
			)
		"Color":
			return Color(
				float(value.get("r", 1.0)),
				float(value.get("g", 1.0)),
				float(value.get("b", 1.0)),
				float(value.get("a", 1.0))
			)
		"NodePath":
			return NodePath(str(value.get("path", "")))
		"Resource":
			return resource_from_json(value, path_validator)
		_:
			return value


static func resource_from_json(value: Dictionary, path_validator: Callable):
	if not path_validator.is_valid():
		return null

	var validation = path_validator.call(str(value.get("path", "")))
	if typeof(validation) != TYPE_DICTIONARY or not validation.get("ok", false):
		return null

	var path := str(validation.get("path"))
	if not FileAccess.file_exists(path) and not ResourceLoader.exists(path):
		return null

	return ResourceLoader.load(path, "", ResourceLoader.CACHE_MODE_IGNORE)


static func coerce_to_declared_type(value, declared_type: int):
	# Make a schema-untyped value apply to a property without the caller pre-typing it.
	# A raw scalar string ("false", "7", "1.5") becomes the declared scalar type; a plain
	# [x,y,z] / {x,y,z} array or dict becomes the declared Vector/Color. Anything already
	# the right shape passes through untouched.
	if typeof(value) == TYPE_STRING:
		var text := (value as String).strip_edges()
		match declared_type:
			TYPE_BOOL:
				var low := text.to_lower()
				return low == "true" or low == "1" or low == "yes" or low == "on"
			TYPE_INT:
				return text.to_int()
			TYPE_FLOAT:
				return text.to_float()
		return value

	match declared_type:
		TYPE_VECTOR2:
			return _as_vector2(value)
		TYPE_VECTOR3:
			return _as_vector3(value)
		TYPE_COLOR:
			return _as_color(value)
	return value


static func _as_vector2(value):
	if value is Vector2:
		return value
	if value is Array and value.size() >= 2:
		return Vector2(float(value[0]), float(value[1]))
	if value is Dictionary and value.has("x"):
		return Vector2(float(value.get("x", 0.0)), float(value.get("y", 0.0)))
	return value


static func _as_vector3(value):
	if value is Vector3:
		return value
	if value is Array and value.size() >= 3:
		return Vector3(float(value[0]), float(value[1]), float(value[2]))
	if value is Dictionary and value.has("x"):
		return Vector3(float(value.get("x", 0.0)), float(value.get("y", 0.0)), float(value.get("z", 0.0)))
	return value


static func _as_color(value):
	if value is Color:
		return value
	if value is Array and value.size() >= 3:
		return Color(float(value[0]), float(value[1]), float(value[2]), float(value[3]) if value.size() >= 4 else 1.0)
	if value is Dictionary and value.has("r"):
		return Color(float(value.get("r", 1.0)), float(value.get("g", 1.0)), float(value.get("b", 1.0)), float(value.get("a", 1.0)))
	return value


static func variant_to_json(value):
	match typeof(value):
		TYPE_NIL, TYPE_BOOL, TYPE_INT, TYPE_FLOAT, TYPE_STRING:
			return value
		TYPE_VECTOR2:
			return {
				"type": "Vector2",
				"x": value.x,
				"y": value.y
			}
		TYPE_VECTOR3:
			return {
				"type": "Vector3",
				"x": value.x,
				"y": value.y,
				"z": value.z
			}
		TYPE_QUATERNION:
			return {
				"type": "Quaternion",
				"x": value.x,
				"y": value.y,
				"z": value.z,
				"w": value.w
			}
		TYPE_COLOR:
			return {
				"type": "Color",
				"r": value.r,
				"g": value.g,
				"b": value.b,
				"a": value.a
			}
		TYPE_NODE_PATH:
			return {
				"type": "NodePath",
				"path": str(value)
			}
		TYPE_ARRAY:
			var items := []
			for item in value:
				items.append(variant_to_json(item))
			return items
		TYPE_DICTIONARY:
			var output := {}
			for key in value.keys():
				output[str(key)] = variant_to_json(value[key])
			return output
		TYPE_OBJECT:
			if value == null:
				return null
			if value is Resource:
				return {
					"type": value.get_class(),
					"resourcePath": value.resource_path
				}
			return str(value)
		_:
			return str(value)


static func variant_type_name(value) -> String:
	return type_string(typeof(value))
