@tool
extends RefCounted


static func filesystem_state(editor: EditorInterface) -> Dictionary:
	var selected_paths := []
	var current_path := ""
	var current_directory := ""
	var scanning := false
	var scanning_progress := 0.0

	if editor != null:
		if editor.has_method("get_selected_paths"):
			var raw_selected_paths = editor.get_selected_paths()
			for raw_path in raw_selected_paths:
				selected_paths.append(str(raw_path))
		if editor.has_method("get_current_path"):
			current_path = str(editor.get_current_path())
		if editor.has_method("get_current_directory"):
			current_directory = str(editor.get_current_directory())
		if editor.has_method("get_resource_filesystem"):
			var resource_filesystem = editor.get_resource_filesystem()
			if resource_filesystem != null:
				if resource_filesystem.has_method("is_scanning"):
					scanning = bool(resource_filesystem.is_scanning())
				if resource_filesystem.has_method("get_scanning_progress"):
					scanning_progress = float(resource_filesystem.get_scanning_progress())

	return {
		"ok": true,
		"data": {
			"selectedPaths": selected_paths,
			"currentPath": current_path,
			"currentDirectory": current_directory,
			"scanning": scanning,
			"scanningProgress": scanning_progress
		}
	}
