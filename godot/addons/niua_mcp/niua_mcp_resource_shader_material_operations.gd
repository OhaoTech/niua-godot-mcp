@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpResourceOperationUtils = preload("niua_mcp_resource_operation_utils.gd")
const NiuaMcpShaderMaterialBuilder = preload("niua_mcp_shader_material_builder.gd")


static func create_shader_material_resource(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	var material_validation := NiuaMcpPathUtils.validate_res_path(str(body.get("path", "")))
	if not material_validation.get("ok", false):
		return material_validation
	var material_path := str(material_validation.get("path"))

	var shader_validation := NiuaMcpPathUtils.validate_res_path(str(body.get("shaderPath", "")))
	if not shader_validation.get("ok", false):
		return shader_validation
	var shader_path := str(shader_validation.get("path"))

	var build_result := NiuaMcpShaderMaterialBuilder.build(body)
	if not build_result.get("ok", false):
		return build_result
	var shader_resource = build_result.get("shader") as Shader
	var material = build_result.get("material") as ShaderMaterial
	if shader_resource == null or material == null:
		return NiuaMcpResourceOperationUtils.error("failed to build ShaderMaterial resource")

	var overwrite_material := bool(body.get("overwrite", false))
	if (FileAccess.file_exists(material_path) or ResourceLoader.exists(material_path)) and not overwrite_material:
		return NiuaMcpResourceOperationUtils.error("resource already exists: %s" % material_path)

	var overwrite_shader := bool(body.get("overwriteShader", false))
	if (FileAccess.file_exists(shader_path) or ResourceLoader.exists(shader_path)) and not overwrite_shader:
		return NiuaMcpResourceOperationUtils.error("shader resource already exists: %s" % shader_path)

	var shader_parent_error := NiuaMcpPathUtils.ensure_parent_directory(shader_path)
	if shader_parent_error != OK:
		return NiuaMcpResourceOperationUtils.error("failed to create parent directory for %s: %s" % [shader_path, shader_parent_error])

	var material_parent_error := NiuaMcpPathUtils.ensure_parent_directory(material_path)
	if material_parent_error != OK:
		return NiuaMcpResourceOperationUtils.error("failed to create parent directory for %s: %s" % [material_path, material_parent_error])

	var shader_save_error := ResourceSaver.save(shader_resource, shader_path)
	if shader_save_error != OK:
		return NiuaMcpResourceOperationUtils.error("failed to save shader resource %s: %s" % [shader_path, shader_save_error])

	var material_save_error := ResourceSaver.save(material, material_path)
	if material_save_error != OK:
		return NiuaMcpResourceOperationUtils.error("failed to save ShaderMaterial resource %s: %s" % [material_path, material_save_error])

	var opened := false
	if bool(body.get("open", true)) and editor != null and editor.has_method("edit_resource"):
		editor.edit_resource(material)
		opened = true

	NiuaMcpResourceOperationUtils.refresh(refresh_filesystem)
	return {
		"ok": true,
		"data": {
			"path": material_path,
			"shaderPath": shader_path,
			"type": material.get_class(),
			"shaderType": shader_resource.get_class(),
			"saved": true,
			"shaderSaved": true,
			"opened": opened,
			"overwrote": overwrite_material,
			"overwroteShader": overwrite_shader,
			"resourceName": str(build_result.get("resourceName", "")),
			"parameterNames": build_result.get("parameterNames", [])
		}
	}
