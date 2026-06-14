@tool
extends EditorPlugin

const NiuaMcpBridge = preload("res://addons/niua_mcp/niua_mcp_bridge.gd")
const DEFAULT_BRIDGE_PORT := 9174
const PORT_ENV_VARS := ["NIUA_MCP_PORT", "GODOT_MCP_PORT"]
const TOKEN_ENV_VARS := ["NIUA_MCP_TOKEN", "GODOT_MCP_TOKEN"]

var bridge: Node


func _enter_tree() -> void:
	bridge = NiuaMcpBridge.new()
	bridge.name = "NIUA_MCP_Bridge"
	add_child(bridge)
	bridge.start(self, _bridge_port(), _bridge_token())


func _exit_tree() -> void:
	if bridge != null:
		bridge.stop()
		bridge.queue_free()
		bridge = null


func _bridge_port() -> int:
	for env_var in PORT_ENV_VARS:
		var raw := OS.get_environment(env_var).strip_edges()
		if raw.is_valid_int():
			var port := int(raw)
			if port > 0 and port < 65536:
				return port

	return DEFAULT_BRIDGE_PORT


func _bridge_token() -> String:
	for env_var in TOKEN_ENV_VARS:
		var raw := OS.get_environment(env_var).strip_edges()
		if not raw.is_empty():
			return raw
	return ""
