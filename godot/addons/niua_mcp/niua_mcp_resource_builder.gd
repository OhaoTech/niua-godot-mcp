@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")


static func build(body: Dictionary) -> Dictionary:
	var resource_result := instantiate_resource(str(body.get("className", "")))
	if not resource_result.get("ok", false):
		return resource_result

	var resource := resource_result.get("resource") as Resource
	if resource == null:
		return _error("failed to instantiate resource")

	var properties_result := apply_properties(resource, body.get("properties", null))
	if not properties_result.get("ok", false):
		return properties_result

	return {
		"ok": true,
		"resource": resource,
		"className": resource.get_class(),
		"properties": properties_result.get("properties", {})
	}


static func instantiate_resource(resource_class_name: String) -> Dictionary:
	var type_name := resource_class_name.strip_edges()
	if type_name.is_empty():
		return _error("resource className is required")
	if not ClassDB.class_exists(type_name):
		return _error("unknown Godot class: %s" % type_name)
	if type_name != "Resource" and not ClassDB.is_parent_class(type_name, "Resource"):
		return _error("Godot class is not a Resource: %s" % type_name)
	if not ClassDB.can_instantiate(type_name):
		return _error("Godot class is not instantiable: %s" % type_name)

	var instance: Object = ClassDB.instantiate(type_name)
	if not (instance is Resource):
		if instance != null and instance is Object:
			instance.free()
		return _error("Godot class did not instantiate as a Resource: %s" % type_name)

	return {
		"ok": true,
		"resource": instance,
		"className": type_name
	}


static func apply_properties(resource: Resource, raw_properties) -> Dictionary:
	var applied := {}
	if raw_properties == null:
		return {
			"ok": true,
			"properties": applied
		}
	if typeof(raw_properties) != TYPE_DICTIONARY:
		return _error("properties must be an object")

	for raw_key in raw_properties.keys():
		var property_name := str(raw_key)
		if property_name.is_empty():
			return _error("resource property names must not be empty")
		resource.set(
			property_name,
			NiuaMcpVariantCodec.json_to_variant(
				raw_properties[raw_key],
				Callable(NiuaMcpPathUtils, "validate_res_path")
			)
		)
		applied[property_name] = NiuaMcpVariantCodec.variant_to_json(resource.get(property_name))

	return {
		"ok": true,
		"properties": applied
	}


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
