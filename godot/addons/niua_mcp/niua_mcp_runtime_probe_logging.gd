@tool
extends RefCounted

const NiuaMcpRuntimeProbeProtocol = preload("niua_mcp_runtime_probe_protocol.gd")
const NiuaMcpRuntimeProbeVariantCodec = preload("niua_mcp_runtime_probe_variant_codec.gd")

const MAX_LOG_MESSAGE_LENGTH := NiuaMcpRuntimeProbeProtocol.MAX_LOG_MESSAGE_LENGTH
const LOG_LEVELS := NiuaMcpRuntimeProbeProtocol.LOG_LEVELS
const RUNTIME_LOG_MESSAGE := NiuaMcpRuntimeProbeProtocol.RUNTIME_LOG_MESSAGE


static func log_event(probe: Node, send_debugger_message: Callable, message: String, level: String = "info", data: Dictionary = {}) -> void:
	var normalized_level := level.strip_edges().to_lower()
	if not LOG_LEVELS.has(normalized_level):
		normalized_level = "info"

	var text := str(message)
	var truncated := false
	if text.length() > MAX_LOG_MESSAGE_LENGTH:
		text = text.substr(0, MAX_LOG_MESSAGE_LENGTH)
		truncated = true

	var tree := probe.get_tree()
	var current_scene := tree.current_scene if tree != null else null
	send_debugger_message.call(RUNTIME_LOG_MESSAGE, {
		"kind": "runtime_log",
		"level": normalized_level,
		"message": text,
		"data": NiuaMcpRuntimeProbeVariantCodec.variant_to_json(data),
		"currentScene": current_scene.scene_file_path if current_scene != null else "",
		"timeMsec": Time.get_ticks_msec(),
		"truncated": truncated
	})
