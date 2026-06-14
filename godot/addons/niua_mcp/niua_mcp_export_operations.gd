@tool
extends RefCounted

const NiuaMcpConfigFileCodec = preload("niua_mcp_config_file_codec.gd")
const NiuaMcpExportPresets = preload("niua_mcp_export_presets.gd")

const EXPORT_PRESETS_PATH := "res://export_presets.cfg"


static func export_presets() -> Dictionary:
	var path := EXPORT_PRESETS_PATH
	if not FileAccess.file_exists(path):
		return {
			"ok": true,
			"data": {
				"path": path,
				"exists": false,
				"presets": [],
				"sections": {}
			}
		}

	var config := ConfigFile.new()
	var load_error := config.load(path)
	if load_error != OK:
		return _error("failed to read export presets %s: %s" % [path, load_error])

	var sections := NiuaMcpConfigFileCodec.to_json(config)
	return {
		"ok": true,
		"data": {
			"path": path,
			"exists": true,
			"presets": NiuaMcpExportPresets.preset_summaries(sections),
			"sections": sections
		}
	}


static func upsert_export_preset(body: Dictionary) -> Dictionary:
	var name := str(body.get("name", "")).strip_edges()
	var platform := str(body.get("platform", "")).strip_edges()
	if name.is_empty():
		return _error("export preset name is required")
	if platform.is_empty():
		return _error("export preset platform is required")

	var path := EXPORT_PRESETS_PATH
	var config := ConfigFile.new()
	if FileAccess.file_exists(path):
		var load_error := config.load(path)
		if load_error != OK:
			return _error("failed to read export presets %s: %s" % [path, load_error])

	var index := int(body.get("index", -1))
	if index < 0:
		index = NiuaMcpExportPresets.find_preset_index(config, name, platform)
	if index < 0:
		index = NiuaMcpExportPresets.next_preset_index(config)

	var section := "preset.%d" % index
	config.set_value(section, "name", name)
	config.set_value(section, "platform", platform)
	config.set_value(section, "runnable", bool(body.get("runnable", true)))
	config.set_value(section, "dedicated_server", bool(body.get("dedicatedServer", false)))
	config.set_value(section, "custom_features", str(body.get("customFeatures", "")))
	config.set_value(section, "export_filter", str(body.get("exportFilter", "all_resources")))
	config.set_value(section, "include_filter", str(body.get("includeFilter", "")))
	config.set_value(section, "exclude_filter", str(body.get("excludeFilter", "")))
	config.set_value(section, "export_path", str(body.get("exportPath", "")))

	var options = body.get("options", {})
	if typeof(options) == TYPE_DICTIONARY:
		var options_section := "%s.options" % section
		for key in options.keys():
			config.set_value(options_section, str(key), options[key])

	var save_error := config.save(path)
	if save_error != OK:
		return _error("failed to save export presets %s: %s" % [path, save_error])

	var sections := NiuaMcpConfigFileCodec.to_json(config)
	var preset_values = sections.get(section, {})
	var preset_options = sections.get("%s.options" % section, {})
	return {
		"ok": true,
		"data": {
			"path": path,
			"index": index,
			"preset": NiuaMcpExportPresets.preset_summary(
				index,
				preset_values if typeof(preset_values) == TYPE_DICTIONARY else {},
				preset_options if typeof(preset_options) == TYPE_DICTIONARY else {}
			),
			"presets": NiuaMcpExportPresets.preset_summaries(sections),
			"sections": sections
		}
	}


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
