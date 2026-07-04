@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")

const TRANSLATIONS_SETTING := "internationalization/locale/translations"


static func get_localization_state() -> Dictionary:
	# Determinism (B6): the engine stores loaded translations in a hash set, so
	# raw iteration order can differ run-to-run. loadedLocales and the
	# translations list are sorted (locale ascending); registeredTranslations
	# keeps project-settings order, which is meaningful state.
	var translations := []
	for translation in TranslationServer.get_translations():
		if translation is Translation:
			translations.append(_translation_snapshot(translation))
	translations.sort_custom(func(left, right): return str(left.get("locale")) < str(right.get("locale")))

	var loaded_locales := _packed_to_array(TranslationServer.get_loaded_locales())
	loaded_locales.sort()

	return {
		"ok": true,
		"data": {
			"locale": TranslationServer.get_locale(),
			"loadedLocales": loaded_locales,
			"registeredTranslations": registered_translation_paths(),
			"translations": translations
		}
	}


static func register_translation_file(body: Dictionary) -> Dictionary:
	var path := str(body.get("path", "")).strip_edges()
	var register_result := register_translation_path(path, body)
	if not bool(register_result.get("ok", false)):
		return register_result

	return {
		"ok": true,
		"data": register_result.get("data", {})
	}


static func register_translation_path(raw_path: String, body: Dictionary) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_res_path(raw_path)
	if not bool(validation.get("ok", false)):
		return validation

	var path := str(validation.get("path"))
	var registered := registered_translation_paths()
	var added := false
	if not registered.has(path):
		registered.append(path)
		added = true

	if not _save_registered_translation_paths(registered, body):
		return NiuaMcpSceneNodeContext.error("failed to save translation registration")

	var loaded := false
	var load_requested := bool(body.get("loadNow", path.ends_with(".translation")))
	if load_requested:
		var resource := ResourceLoader.load(path, "Translation", ResourceLoader.CACHE_MODE_IGNORE)
		if resource == null or not (resource is Translation):
			return NiuaMcpSceneNodeContext.error("translation resource not loadable: %s" % path, "not_found")
		TranslationServer.add_translation(resource)
		loaded = true

	return {
		"ok": true,
		"data": {
			"path": path,
			"added": added,
			"loaded": loaded,
			"registeredTranslations": registered,
			"state": get_localization_state().get("data", {})
		}
	}


static func registered_translation_paths() -> Array:
	var raw = ProjectSettings.get_setting(TRANSLATIONS_SETTING, PackedStringArray())
	var paths := []
	if raw is PackedStringArray:
		for path in raw:
			paths.append(str(path))
	elif typeof(raw) == TYPE_ARRAY:
		for path in raw:
			paths.append(str(path))
	return paths


static func _save_registered_translation_paths(paths: Array, body: Dictionary) -> bool:
	if body.has("save") and not bool(body.get("save")):
		ProjectSettings.set_setting(TRANSLATIONS_SETTING, PackedStringArray(paths))
		return true

	ProjectSettings.set_setting(TRANSLATIONS_SETTING, PackedStringArray(paths))
	return ProjectSettings.save() == OK


static func _translation_snapshot(translation: Translation) -> Dictionary:
	return {
		"locale": translation.get_locale(),
		"messageCount": translation.get_message_count(),
		"messages": _packed_to_array(translation.get_message_list())
	}


static func _packed_to_array(values) -> Array:
	var result := []
	for value in values:
		result.append(str(value))
	return result
