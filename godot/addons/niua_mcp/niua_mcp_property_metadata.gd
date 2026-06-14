@tool
extends RefCounted


static func usage_flags(usage: int) -> Array:
	var flags := []
	if usage == PROPERTY_USAGE_NONE:
		flags.append("none")
	if (usage & PROPERTY_USAGE_STORAGE) != 0:
		flags.append("storage")
	if (usage & PROPERTY_USAGE_EDITOR) != 0:
		flags.append("editor")
	if (usage & PROPERTY_USAGE_INTERNAL) != 0:
		flags.append("internal")
	if (usage & PROPERTY_USAGE_CHECKABLE) != 0:
		flags.append("checkable")
	if (usage & PROPERTY_USAGE_CHECKED) != 0:
		flags.append("checked")
	if (usage & PROPERTY_USAGE_GROUP) != 0:
		flags.append("group")
	if (usage & PROPERTY_USAGE_CATEGORY) != 0:
		flags.append("category")
	if (usage & PROPERTY_USAGE_SUBGROUP) != 0:
		flags.append("subgroup")
	if (usage & PROPERTY_USAGE_CLASS_IS_BITFIELD) != 0:
		flags.append("class_is_bitfield")
	if (usage & PROPERTY_USAGE_NO_INSTANCE_STATE) != 0:
		flags.append("no_instance_state")
	if (usage & PROPERTY_USAGE_RESTART_IF_CHANGED) != 0:
		flags.append("restart_if_changed")
	if (usage & PROPERTY_USAGE_SCRIPT_VARIABLE) != 0:
		flags.append("script_variable")
	if (usage & PROPERTY_USAGE_STORE_IF_NULL) != 0:
		flags.append("store_if_null")
	if (usage & PROPERTY_USAGE_UPDATE_ALL_IF_MODIFIED) != 0:
		flags.append("update_all_if_modified")
	if (usage & PROPERTY_USAGE_SCRIPT_DEFAULT_VALUE) != 0:
		flags.append("script_default_value")
	if (usage & PROPERTY_USAGE_CLASS_IS_ENUM) != 0:
		flags.append("class_is_enum")
	if (usage & PROPERTY_USAGE_NIL_IS_VARIANT) != 0:
		flags.append("nil_is_variant")
	if (usage & PROPERTY_USAGE_ARRAY) != 0:
		flags.append("array")
	if (usage & PROPERTY_USAGE_ALWAYS_DUPLICATE) != 0:
		flags.append("always_duplicate")
	if (usage & PROPERTY_USAGE_NEVER_DUPLICATE) != 0:
		flags.append("never_duplicate")
	if (usage & PROPERTY_USAGE_HIGH_END_GFX) != 0:
		flags.append("high_end_gfx")
	if (usage & PROPERTY_USAGE_NODE_PATH_FROM_SCENE_ROOT) != 0:
		flags.append("node_path_from_scene_root")
	if (usage & PROPERTY_USAGE_RESOURCE_NOT_PERSISTENT) != 0:
		flags.append("resource_not_persistent")
	if (usage & PROPERTY_USAGE_KEYING_INCREMENTS) != 0:
		flags.append("keying_increments")
	if (usage & PROPERTY_USAGE_DEFERRED_SET_RESOURCE) != 0:
		flags.append("deferred_set_resource")
	if (usage & PROPERTY_USAGE_EDITOR_INSTANTIATE_OBJECT) != 0:
		flags.append("editor_instantiate_object")
	if (usage & PROPERTY_USAGE_EDITOR_BASIC_SETTING) != 0:
		flags.append("editor_basic_setting")
	if (usage & PROPERTY_USAGE_READ_ONLY) != 0:
		flags.append("read_only")
	if (usage & PROPERTY_USAGE_SECRET) != 0:
		flags.append("secret")
	return flags
