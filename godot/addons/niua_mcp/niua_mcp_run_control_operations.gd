@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpRunUtils = preload("niua_mcp_run_utils.gd")


static func run_main_scene(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var availability := NiuaMcpRunUtils.require_editor_method(editor, "play_main_scene")
	if not availability.get("ok", false):
		return availability

	var main_scene_check := NiuaMcpRunUtils.require_main_scene_defined()
	if not main_scene_check.get("ok", false):
		return main_scene_check

	var save_result := NiuaMcpRunUtils.save_before_run_if_requested(editor, body)
	if not save_result.get("ok", false):
		return save_result

	NiuaMcpRunUtils.ensure_headless_run_args()
	editor.play_main_scene()
	return {
		"ok": true,
		"data": NiuaMcpRunUtils.run_result_data(editor, "main")
	}


static func run_current_scene(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var availability := NiuaMcpRunUtils.require_editor_method(editor, "play_current_scene")
	if not availability.get("ok", false):
		return availability

	var saved_check := NiuaMcpRunUtils.require_current_scene_saved(editor)
	if not saved_check.get("ok", false):
		return saved_check

	var save_result := NiuaMcpRunUtils.save_before_run_if_requested(editor, body)
	if not save_result.get("ok", false):
		return save_result

	NiuaMcpRunUtils.ensure_headless_run_args()
	editor.play_current_scene()
	return {
		"ok": true,
		"data": NiuaMcpRunUtils.run_result_data(editor, "current")
	}


static func run_custom_scene(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var availability := NiuaMcpRunUtils.require_editor_method(editor, "play_custom_scene")
	if not availability.get("ok", false):
		return availability

	var validation := NiuaMcpPathUtils.validate_res_path(str(body.get("path", "")))
	if not validation.get("ok", false):
		return validation

	var path := str(validation.get("path"))
	if not (path.ends_with(".tscn") or path.ends_with(".scn")):
		return NiuaMcpRunUtils.error("custom run path must be a scene: %s" % path)
	if not FileAccess.file_exists(path) and not ResourceLoader.exists(path):
		return NiuaMcpRunUtils.error("scene not found: %s" % path, "not_found")

	var save_result := NiuaMcpRunUtils.save_before_run_if_requested(editor, body)
	if not save_result.get("ok", false):
		return save_result

	NiuaMcpRunUtils.ensure_headless_run_args()
	editor.play_custom_scene(path)
	var data := NiuaMcpRunUtils.run_result_data(editor, "custom")
	data["path"] = path
	return {
		"ok": true,
		"data": data
	}


static func stop_running_scene(editor: EditorInterface) -> Dictionary:
	var availability := NiuaMcpRunUtils.require_editor_method(editor, "stop_playing_scene")
	if not availability.get("ok", false):
		return availability

	editor.stop_playing_scene()
	var data := NiuaMcpRunUtils.run_status_data(editor)
	data["requestedStop"] = true
	return {
		"ok": true,
		"data": data
	}


static func reload_running_scene(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var stop_availability := NiuaMcpRunUtils.require_editor_method(editor, "stop_playing_scene")
	if not stop_availability.get("ok", false):
		return stop_availability
	var play_availability := NiuaMcpRunUtils.require_editor_method(editor, "play_custom_scene")
	if not play_availability.get("ok", false):
		return play_availability
	var status_availability := NiuaMcpRunUtils.require_editor_method(editor, "is_playing_scene")
	if not status_availability.get("ok", false):
		return status_availability
	var scene_availability := NiuaMcpRunUtils.require_editor_method(editor, "get_playing_scene")
	if not scene_availability.get("ok", false):
		return scene_availability

	if not editor.is_playing_scene():
		return NiuaMcpRunUtils.error("no running scene to reload", "not_found")

	var playing_scene := str(editor.get_playing_scene())
	if playing_scene.is_empty():
		return NiuaMcpRunUtils.error("running scene path is unavailable")

	var save_result := NiuaMcpRunUtils.save_before_run_if_requested(editor, body)
	if not save_result.get("ok", false):
		return save_result

	editor.stop_playing_scene()
	_schedule_play_custom_scene_after_stop(editor, playing_scene)

	var data := NiuaMcpRunUtils.run_result_data(editor, "reload")
	data["requestedReload"] = true
	data["previousScene"] = playing_scene
	return {
		"ok": true,
		"data": data
	}


static func _schedule_play_custom_scene_after_stop(editor: EditorInterface, path: String) -> void:
	var base_control: Control = editor.get_base_control()
	if base_control == null:
		editor.call_deferred("play_custom_scene", path)
		return

	var tree: SceneTree = base_control.get_tree()
	if tree == null:
		editor.call_deferred("play_custom_scene", path)
		return

	var timer: SceneTreeTimer = tree.create_timer(0.25)
	timer.timeout.connect(func() -> void:
		NiuaMcpRunUtils.ensure_headless_run_args()
		editor.play_custom_scene(path)
	)
