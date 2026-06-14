@tool
extends RefCounted


static func property_editor_control(declared_type: int, hint: int, section_kind: String) -> String:
	if section_kind != "property":
		return "section"

	match hint:
		PROPERTY_HINT_RANGE:
			return "range"
		PROPERTY_HINT_ENUM:
			return "enum"
		PROPERTY_HINT_FLAGS:
			return "flags"
		PROPERTY_HINT_MULTILINE_TEXT:
			return "multiline_text"
		PROPERTY_HINT_COLOR_NO_ALPHA:
			return "color"
		PROPERTY_HINT_FILE, PROPERTY_HINT_GLOBAL_FILE, PROPERTY_HINT_SAVE_FILE, PROPERTY_HINT_GLOBAL_SAVE_FILE:
			return "file_picker"
		PROPERTY_HINT_DIR, PROPERTY_HINT_GLOBAL_DIR:
			return "directory_picker"
		PROPERTY_HINT_RESOURCE_TYPE:
			return "resource_picker"
		PROPERTY_HINT_NODE_PATH_VALID_TYPES:
			return "node_path_picker"

	match declared_type:
		TYPE_BOOL:
			return "checkbox"
		TYPE_INT, TYPE_FLOAT:
			return "number"
		TYPE_STRING, TYPE_STRING_NAME:
			return "text"
		TYPE_COLOR:
			return "color"
		TYPE_NODE_PATH:
			return "node_path_picker"
		TYPE_OBJECT, TYPE_RID:
			return "resource_picker"
		TYPE_VECTOR2, TYPE_VECTOR2I, TYPE_VECTOR3, TYPE_VECTOR3I, TYPE_VECTOR4, TYPE_VECTOR4I, TYPE_RECT2, TYPE_RECT2I, TYPE_TRANSFORM2D, TYPE_TRANSFORM3D, TYPE_PLANE, TYPE_QUATERNION, TYPE_AABB, TYPE_BASIS, TYPE_PROJECTION:
			return "vector"
		TYPE_ARRAY, TYPE_DICTIONARY:
			return "collection"

	return "value"
