@tool
extends RefCounted

const MAIN_SCENE_SETTING := "application/run/main_scene"
const MAIN_RUN_ARGS_SETTING := "editor/run/main_run_args"


static func ensure_headless_run_args() -> void:
	# A headless editor cannot host a windowed game: the spawned process
	# dies before the debugger/runtime probe ever connects. Append
	# --headless to the run args so play works on display-less hosts.
	# Godot reads this setting from the saved project.godot when spawning
	# the game (an in-memory set is not honored), so persist it.
	if DisplayServer.get_name() != "headless":
		return
	var args := str(ProjectSettings.get_setting(MAIN_RUN_ARGS_SETTING, ""))
	if args.find("--headless") != -1:
		return
	ProjectSettings.set_setting(MAIN_RUN_ARGS_SETTING, ("%s --headless" % args).strip_edges())
	ProjectSettings.save()


static func run_result_data(editor: EditorInterface, mode: String) -> Dictionary:
	var data := run_status_data(editor)
	data["mode"] = mode
	return data


static func run_status_data(editor: EditorInterface) -> Dictionary:
	var playing := false
	var playing_scene := ""

	if editor != null:
		if editor.has_method("is_playing_scene"):
			playing = editor.is_playing_scene()
		if editor.has_method("get_playing_scene"):
			playing_scene = editor.get_playing_scene()

	return {
		"playing": playing,
		"playingScene": playing_scene
	}


static func require_editor_method(editor: EditorInterface, method_name: String) -> Dictionary:
	if editor == null:
		return error("Godot editor interface is unavailable")
	if not editor.has_method(method_name):
		return error("Godot editor does not expose %s" % method_name)
	return {
		"ok": true
	}


static func save_before_run_if_requested(editor: EditorInterface, body: Dictionary) -> Dictionary:
	if not bool(body.get("saveBeforeRun", false)):
		return {
			"ok": true
		}

	return save_edited_scene(editor)


# Save the edited scene programmatically. editor.save_all_scenes() /
# editor.save_scene() delegate to the editor's GUI flow and pop a modal
# "Save As" EditorFileDialog for an untitled scene, which an agent cannot
# dismiss and which collides with any other open modal (window.cpp:1090).
# Pack + ResourceSaver.save never shows UI; an untitled scene returns a
# structured error the agent can act on instead.
static func save_edited_scene(editor: EditorInterface) -> Dictionary:
	if editor == null:
		return error("Godot editor interface is unavailable")

	var root := editor.get_edited_scene_root()
	if root == null:
		return error("no edited scene is open", "not_found")

	var scene_path := str(root.scene_file_path)
	if scene_path.is_empty():
		return error("current scene has never been saved; save it to a res:// path before running", "unsaved_scene")

	var packed := PackedScene.new()
	var pack_error := packed.pack(root)
	if pack_error != OK:
		return error("failed to pack scene: %s" % pack_error)

	var save_error := ResourceSaver.save(packed, scene_path)
	if save_error != OK:
		return error("failed to save scene %s: %s" % [scene_path, save_error])

	return {
		"ok": true
	}


# Guard before editor.play_main_scene(): with no main scene defined (or a
# missing one) the editor pops a "No main scene defined - select one?"
# ConfirmationDialog that chains into an EditorFileDialog picker.
static func require_main_scene_defined() -> Dictionary:
	var main_scene := str(ProjectSettings.get_setting(MAIN_SCENE_SETTING, ""))
	if main_scene.is_empty():
		return error("no main scene is defined; call set_main_scene before run_main_scene", "no_main_scene")
	if not FileAccess.file_exists(main_scene) and not ResourceLoader.exists(main_scene):
		return error("main scene does not exist: %s" % main_scene, "not_found")
	return {
		"ok": true
	}


# Guard before editor.play_current_scene(): an untitled scene prompts the
# editor to save before running, which pops a modal "Save As" dialog.
static func require_current_scene_saved(editor: EditorInterface) -> Dictionary:
	if editor == null:
		return error("Godot editor interface is unavailable")

	var root := editor.get_edited_scene_root()
	if root == null:
		return error("no edited scene is open", "not_found")
	if str(root.scene_file_path).is_empty():
		return error("current scene has never been saved; save it to a res:// path before running", "unsaved_scene")
	return {
		"ok": true
	}


static func remember(remember: Callable, message: String) -> void:
	if remember.is_valid():
		remember.call(message)


static func error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
