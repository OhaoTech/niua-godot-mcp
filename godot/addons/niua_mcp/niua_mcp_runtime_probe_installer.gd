@tool
extends RefCounted

const RUNTIME_PROBE_AUTOLOAD_NAME := "NiuaMcpRuntimeProbe"
const RUNTIME_PROBE_AUTOLOAD_KEY := "autoload/NiuaMcpRuntimeProbe"
const RUNTIME_PROBE_PATH := "res://addons/niua_mcp/niua_mcp_runtime_probe.gd"


static func install_runtime_probe_with_side_effects(body: Dictionary, remember: Callable) -> Dictionary:
	var response := install_runtime_probe(body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		_remember(remember, "Installed runtime probe autoload %s" % str(data.get("autoloadName", "")))
	return response


static func install_runtime_probe(body: Dictionary) -> Dictionary:
	if not FileAccess.file_exists(RUNTIME_PROBE_PATH):
		return _error("runtime probe script not found: %s" % RUNTIME_PROBE_PATH, "not_found")

	ProjectSettings.set_setting(RUNTIME_PROBE_AUTOLOAD_KEY, "*" + RUNTIME_PROBE_PATH)

	var save_requested := bool(body.get("save", true))
	var saved := false
	if save_requested:
		var save_error := ProjectSettings.save()
		if save_error != OK:
			return _error("failed to save project settings after installing runtime probe: %s" % save_error)
		saved = true

	return {
		"ok": true,
		"data": {
			"autoloadName": RUNTIME_PROBE_AUTOLOAD_NAME,
			"autoloadKey": RUNTIME_PROBE_AUTOLOAD_KEY,
			"path": RUNTIME_PROBE_PATH,
			"enabled": true,
			"saved": saved
		}
	}


static func _remember(remember: Callable, message: String) -> void:
	if remember.is_valid():
		remember.call(message)


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
