@tool
extends RefCounted


static func health() -> Dictionary:
	var info := Engine.get_version_info()
	var major := int(info.get("major", 0))
	var minor := int(info.get("minor", 0))
	var patch := int(info.get("patch", 0))
	var status := "untested"
	var message := "Godot %d.%d.%d is untested by NIUA MCP; supported: 4.6.x; best-effort: 4.5.x and 4.7.x." % [major, minor, patch]
	if major == 4 and minor == 6:
		status = "supported"
		message = "Godot 4.6.x is supported by NIUA MCP."
	elif major == 4 and (minor == 5 or minor == 7):
		status = "best_effort"
		message = "Godot %d.%d.x is best-effort in NIUA MCP; supported: 4.6.x." % [major, minor]

	return {
		"version": info,
		"support": status,
		"warning": "" if status == "supported" else message,
		"message": message
	}
