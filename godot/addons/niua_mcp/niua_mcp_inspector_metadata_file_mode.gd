@tool
extends RefCounted


static func property_file_mode(hint: int) -> String:
	match hint:
		PROPERTY_HINT_FILE:
			return "project_file_open"
		PROPERTY_HINT_GLOBAL_FILE:
			return "global_file_open"
		PROPERTY_HINT_SAVE_FILE:
			return "project_file_save"
		PROPERTY_HINT_GLOBAL_SAVE_FILE:
			return "global_file_save"
		PROPERTY_HINT_DIR:
			return "project_directory"
		PROPERTY_HINT_GLOBAL_DIR:
			return "global_directory"
	return "path"
