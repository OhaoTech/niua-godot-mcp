@tool
extends RefCounted

const ALLOWED_EDITOR_ACTIONS := [
	"set_distraction_free_mode",
	"select_file",
	"filesystem_scan",
	"filesystem_scan_sources",
	"filesystem_update_file",
	"reload_scene_from_path",
	"save_scene",
	"save_all_scenes",
	"mark_scene_as_unsaved",
	"set_movie_maker_enabled"
]


static func has_action(action: String) -> bool:
	return ALLOWED_EDITOR_ACTIONS.has(action)


static func allowed_actions() -> Array:
	return ALLOWED_EDITOR_ACTIONS.duplicate()
