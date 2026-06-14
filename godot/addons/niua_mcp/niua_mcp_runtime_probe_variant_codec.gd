@tool
extends RefCounted

const NiuaMcpRuntimeProbeProtocol = preload("niua_mcp_runtime_probe_protocol.gd")

const MAX_SERIALIZED_COLLECTION_ITEMS := NiuaMcpRuntimeProbeProtocol.MAX_SERIALIZED_COLLECTION_ITEMS


static func json_to_variant(value):
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
		_:
			return value


static func variant_to_json(value):
	match typeof(value):
		TYPE_NIL, TYPE_BOOL, TYPE_INT, TYPE_FLOAT, TYPE_STRING:
			return value
		TYPE_STRING_NAME:
			return str(value)
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
			var count := 0
			for item in value:
				if count >= MAX_SERIALIZED_COLLECTION_ITEMS:
					break
				items.append(variant_to_json(item))
				count += 1
			return items
		TYPE_DICTIONARY:
			var output := {}
			var count := 0
			for key in value.keys():
				if count >= MAX_SERIALIZED_COLLECTION_ITEMS:
					break
				output[str(key)] = variant_to_json(value[key])
				count += 1
			return output
		TYPE_OBJECT:
			if value == null:
				return null
			if value is Node:
				return {
					"type": value.get_class(),
					"path": str(value.get_path())
				}
			if value is Resource:
				return {
					"type": value.get_class(),
					"resourcePath": value.resource_path
				}
			return str(value)
		_:
			return str(value)
