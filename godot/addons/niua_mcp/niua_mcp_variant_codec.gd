@tool
extends RefCounted


static func json_to_variant(value, path_validator: Callable = Callable()):
	if typeof(value) != TYPE_DICTIONARY:
		return value

	var kind := str(value.get("type", ""))
	match kind:
		"Vector2":
			return Vector2(float(value.get("x", 0.0)), float(value.get("y", 0.0)))
		"Vector3":
			return Vector3(float(value.get("x", 0.0)), float(value.get("y", 0.0)), float(value.get("z", 0.0)))
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
