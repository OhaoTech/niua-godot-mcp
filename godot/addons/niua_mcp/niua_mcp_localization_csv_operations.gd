@tool
extends RefCounted

const NiuaMcpLocalizationRegistryOperations = preload("niua_mcp_localization_registry_operations.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")


static func create_csv_translation(body: Dictionary) -> Dictionary:
	var csv_validation := NiuaMcpPathUtils.validate_res_path(str(body.get("path", "")))
	if not bool(csv_validation.get("ok", false)):
		return csv_validation
	var csv_path := str(csv_validation.get("path"))
	if not csv_path.ends_with(".csv"):
		return NiuaMcpSceneNodeContext.error("translation CSV path must end with .csv: %s" % csv_path)

	var locale := str(body.get("locale", "")).strip_edges()
	if locale.is_empty():
		return NiuaMcpSceneNodeContext.error("locale is required")

	var raw_messages = body.get("messages", {})
	if typeof(raw_messages) != TYPE_DICTIONARY or raw_messages.is_empty():
		return NiuaMcpSceneNodeContext.error("messages must be a non-empty dictionary")
	var messages: Dictionary = raw_messages

	var translation_path := str(body.get("translationPath", csv_path.get_basename() + ".translation")).strip_edges()
	var translation_validation := NiuaMcpPathUtils.validate_res_path(translation_path)
	if not bool(translation_validation.get("ok", false)):
		return translation_validation
	translation_path = str(translation_validation.get("path"))
	if not translation_path.ends_with(".translation"):
		return NiuaMcpSceneNodeContext.error("generated translation path must end with .translation: %s" % translation_path)

	var overwrite := bool(body.get("overwrite", false))
	if not overwrite and FileAccess.file_exists(csv_path):
		return NiuaMcpSceneNodeContext.error("translation CSV already exists: %s" % csv_path)
	if not overwrite and FileAccess.file_exists(translation_path):
		return NiuaMcpSceneNodeContext.error("translation resource already exists: %s" % translation_path)

	var csv_parent_error := NiuaMcpPathUtils.ensure_parent_directory(csv_path)
	if csv_parent_error != OK:
		return NiuaMcpSceneNodeContext.error("failed to create parent directory for %s: %s" % [csv_path, csv_parent_error])
	var translation_parent_error := NiuaMcpPathUtils.ensure_parent_directory(translation_path)
	if translation_parent_error != OK:
		return NiuaMcpSceneNodeContext.error("failed to create parent directory for %s: %s" % [translation_path, translation_parent_error])

	var csv_error := _write_csv(csv_path, locale, messages)
	if csv_error != OK:
		return NiuaMcpSceneNodeContext.error("failed to write translation CSV %s: %s" % [csv_path, csv_error])

	var translation := Translation.new()
	translation.set_locale(locale)
	for key in messages.keys():
		translation.add_message(StringName(str(key)), StringName(str(messages[key])), StringName(""))

	var save_error := ResourceSaver.save(translation, translation_path)
	if save_error != OK:
		return NiuaMcpSceneNodeContext.error("failed to save translation resource %s: %s" % [translation_path, save_error])

	var register_body := body.duplicate()
	register_body["loadNow"] = true
	var register_result := NiuaMcpLocalizationRegistryOperations.register_translation_path(translation_path, register_body)
	if not bool(register_result.get("ok", false)):
		return register_result

	if bool(body.get("activate", false)):
		TranslationServer.set_locale(locale)

	return {
		"ok": true,
		"data": {
			"csvPath": csv_path,
			"translationPath": translation_path,
			"locale": locale,
			"messageCount": messages.size(),
			"registered": register_result.get("data", {}),
			"state": NiuaMcpLocalizationRegistryOperations.get_localization_state().get("data", {})
		}
	}


static func _write_csv(path: String, locale: String, messages: Dictionary) -> int:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		return FileAccess.get_open_error()

	file.store_line("%s,%s" % [_csv_escape("key"), _csv_escape(locale)])
	for key in messages.keys():
		file.store_line("%s,%s" % [_csv_escape(str(key)), _csv_escape(str(messages[key]))])
	file.close()
	return OK


static func _csv_escape(value: String) -> String:
	if value.contains("\"") or value.contains(",") or value.contains("\n") or value.contains("\r"):
		return "\"" + value.replace("\"", "\"\"") + "\""
	return value
