@tool
extends RefCounted


static func remember_created_csv_translation(result: Dictionary, remember: Callable) -> void:
	if not bool(result.get("ok", false)) or not remember.is_valid():
		return
	var data: Dictionary = result.get("data", {})
	remember.call("Created CSV translation %s for %s" % [str(data.get("csvPath", "")), str(data.get("locale", ""))])


static func remember_registered_translation_file(result: Dictionary, remember: Callable) -> void:
	if not bool(result.get("ok", false)) or not remember.is_valid():
		return
	var data: Dictionary = result.get("data", {})
	remember.call("Registered translation file %s" % str(data.get("path", "")))


static func remember_set_locale(result: Dictionary, remember: Callable) -> void:
	if not bool(result.get("ok", false)) or not remember.is_valid():
		return
	var data: Dictionary = result.get("data", {})
	remember.call("Set locale %s" % str(data.get("locale", "")))
