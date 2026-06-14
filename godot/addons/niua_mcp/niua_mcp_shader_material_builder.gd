@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")


static func build(body: Dictionary) -> Dictionary:
	var code := str(body.get("code", "")).strip_edges()
	if code.is_empty():
		return _error("code is required")

	var raw_parameters = body.get("parameters", {})
	if typeof(raw_parameters) != TYPE_DICTIONARY:
		return _error("parameters must be an object")
	var parameters: Dictionary = raw_parameters

	var shader_resource := Shader.new()
	shader_resource.code = code
	var shader_resource_name := str(body.get("shaderResourceName", body.get("shaderName", ""))).strip_edges()
	if shader_resource_name.is_empty() and body.has("resourceName"):
		shader_resource_name = "%s Shader" % str(body.get("resourceName", "")).strip_edges()
	if not shader_resource_name.is_empty():
		shader_resource.resource_name = shader_resource_name

	var material := ShaderMaterial.new()
	material.set_shader(shader_resource)
	var resource_name := str(body.get("resourceName", body.get("name", ""))).strip_edges()
	if not resource_name.is_empty():
		material.resource_name = resource_name

	var parameter_names := []
	for raw_parameter_name in parameters.keys():
		var parameter_name := str(raw_parameter_name).strip_edges()
		if parameter_name.is_empty():
			return _error("shader parameter names must not be empty")
		if parameter_name.contains("/"):
			return _error("shader parameter names must not include slash: %s" % parameter_name)
		material.set_shader_parameter(
			StringName(parameter_name),
			NiuaMcpVariantCodec.json_to_variant(
				parameters[raw_parameter_name],
				Callable(NiuaMcpPathUtils, "validate_res_path")
			)
		)
		parameter_names.append(parameter_name)
	parameter_names.sort()

	return {
		"ok": true,
		"shader": shader_resource,
		"material": material,
		"shaderResourceName": shader_resource_name,
		"resourceName": resource_name,
		"parameterNames": parameter_names
	}


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
