@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpRunUtils = preload("niua_mcp_run_utils.gd")

const MAIN_SCENE_SETTING := NiuaMcpRunUtils.MAIN_SCENE_SETTING


static func run_settings(editor: EditorInterface) -> Dictionary:
	var main_scene := str(ProjectSettings.get_setting(MAIN_SCENE_SETTING, ""))
	var main_scene_exists := false
	if not main_scene.is_empty():
		main_scene_exists = FileAccess.file_exists(main_scene) or ResourceLoader.exists(main_scene)

	return {
		"ok": true,
		"data": {
			"mainScene": main_scene,
			"mainSceneExists": main_scene_exists,
			"mainSceneName": main_scene.get_file().get_basename() if not main_scene.is_empty() else "",
			"projectName": str(ProjectSettings.get_setting("application/config/name", "")),
			"runStatus": NiuaMcpRunUtils.run_status_data(editor)
		}
	}


static func set_main_scene(editor: EditorInterface, body: Dictionary, save_project_settings: Callable) -> Dictionary:
	var validation := NiuaMcpPathUtils.validate_scene_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	if not FileAccess.file_exists(path) and not ResourceLoader.exists(path):
		return NiuaMcpRunUtils.error("scene not found: %s" % path, "not_found")

	ProjectSettings.set_setting(MAIN_SCENE_SETTING, path)
	var save_requested := bool(body.get("save", true))
	var save_error := int(save_project_settings.call(save_requested))
	if save_error != OK:
		return NiuaMcpRunUtils.error("failed to save main scene setting: %s" % save_error)

	var response := run_settings(editor)
	var data: Dictionary = response.get("data", {})
	data["saved"] = save_requested
	return {
		"ok": true,
		"data": data
	}


static func run_status(editor: EditorInterface) -> Dictionary:
	return {
		"ok": true,
		"data": NiuaMcpRunUtils.run_status_data(editor)
	}
