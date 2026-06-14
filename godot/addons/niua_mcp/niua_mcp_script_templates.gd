@tool
extends RefCounted

const SCRIPT_TEMPLATES := ["extends_only", "node_lifecycle", "node_process", "tool_node"]


static func template_content(base_type: String, template: String, script_class_name: String) -> Dictionary:
	if not SCRIPT_TEMPLATES.has(template):
		return error_payload("unsupported script template: %s" % template, "unsupported_template")

	var class_result := validate_class_name(script_class_name)
	if not class_result.get("ok", false):
		return class_result

	var lines: Array[String] = []
	if template == "tool_node":
		lines.append("@tool")
	if not script_class_name.is_empty():
		lines.append("class_name %s" % script_class_name)
	lines.append("extends %s" % base_type)

	match template:
		"extends_only":
			pass
		"node_lifecycle", "tool_node":
			lines.append("")
			lines.append("func _ready() -> void:")
			lines.append("\tpass")
		"node_process":
			lines.append("")
			lines.append("func _ready() -> void:")
			lines.append("\tpass")
			lines.append("")
			lines.append("func _process(delta: float) -> void:")
			lines.append("\tpass")

	var content := ""
	for line in lines:
		content += line + "\n"
	return { "ok": true, "content": content }


static func validate_class_name(script_class_name: String) -> Dictionary:
	if script_class_name.is_empty():
		return { "ok": true }
	if not is_script_identifier(script_class_name):
		return error_payload("className must be a valid GDScript identifier: %s" % script_class_name, "invalid_class_name")
	return { "ok": true }


static func is_script_identifier(value: String) -> bool:
	if value.is_empty():
		return false
	if not is_identifier_start(value.unicode_at(0)):
		return false
	for index in range(1, value.length()):
		if not is_identifier_part(value.unicode_at(index)):
			return false
	return true


static func is_identifier_start(code: int) -> bool:
	return (code >= 65 and code <= 90) or (code >= 97 and code <= 122) or code == 95


static func is_identifier_part(code: int) -> bool:
	return is_identifier_start(code) or (code >= 48 and code <= 57)


static func error_payload(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
