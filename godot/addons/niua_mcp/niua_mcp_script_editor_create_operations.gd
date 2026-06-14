@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpScriptEditorAuthoringUtils = preload("niua_mcp_script_editor_authoring_utils.gd")
const NiuaMcpScriptTemplates = preload("niua_mcp_script_templates.gd")


static func create_script(body: Dictionary, write_text_file: Callable) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_script_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	var overwrite := bool(body.get("overwrite", false))
	if FileAccess.file_exists(path) and not overwrite:
		return NiuaMcpScriptEditorAuthoringUtils.error("script already exists: %s" % path)

	var base_type := str(body.get("baseType", "Node")).strip_edges()
	if base_type.is_empty():
		base_type = "Node"

	var template := str(body.get("template", "extends_only")).strip_edges()
	if template.is_empty():
		template = "extends_only"
	var script_class_name := str(body.get("className", "")).strip_edges()
	var used_template := "custom"
	var used_class_name := ""

	var content := ""
	if body.has("content"):
		content = str(body.get("content"))
	else:
		var template_result := NiuaMcpScriptTemplates.template_content(base_type, template, script_class_name)
		if not template_result.get("ok", false):
			return template_result
		content = str(template_result.get("content", ""))
		used_template = template
		used_class_name = script_class_name

	var write_result_raw = write_text_file.call({
		"path": path,
		"content": content
	})
	var write_result := NiuaMcpScriptEditorAuthoringUtils.callback_dictionary_result(write_result_raw, "write_text_file")
	if not write_result.get("ok", false):
		return write_result

	return {
		"ok": true,
		"data": {
			"path": path,
			"baseType": base_type,
			"template": used_template,
			"className": used_class_name,
			"bytes": content.to_utf8_buffer().size(),
			"created": true,
			"overwrote": overwrite
		}
	}
