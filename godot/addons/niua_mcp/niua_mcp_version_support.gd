@tool
extends RefCounted

const REQUIRES_47 := {
	"AreaLight3D": true,
	"DrawableTexture2D": true
}


static func health() -> Dictionary:
	var info := Engine.get_version_info()
	var major := int(info.get("major", 0))
	var minor := int(info.get("minor", 0))
	var patch := int(info.get("patch", 0))
	var status := "untested"
	var message := "Godot %d.%d.%d is untested by NIUA MCP; supported: 4.7.x (verified 4.7.1); best-effort: 4.6.x and 4.8.x." % [major, minor, patch]
	if major == 4 and minor == 7:
		status = "supported"
		message = "Godot 4.7.x is supported by NIUA MCP (verified 4.7.1)."
	elif major == 4 and (minor == 6 or minor == 8):
		status = "best_effort"
		message = "Godot %d.%d.x is best-effort in NIUA MCP; supported: 4.7.x (verified 4.7.1)." % [major, minor]

	return {
		"version": info,
		"support": status,
		"warning": "" if status == "supported" else message,
		"message": message
	}


static func version_label() -> String:
	var info := Engine.get_version_info()
	return "%d.%d.%d" % [int(info.get("major", 0)), int(info.get("minor", 0)), int(info.get("patch", 0))]


static func unknown_class_message(type_name: String) -> String:
	var message := "unknown Godot class: %s" % type_name
	if REQUIRES_47.has(type_name):
		message += " (requires Godot 4.7+; this editor is %s)" % version_label()
	return message
