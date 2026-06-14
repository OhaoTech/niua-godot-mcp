@tool
extends RefCounted

const DEFAULT_MAX_BYTES := 67108864
const ENV_VARS := ["NIUA_MCP_MAX_PAYLOAD_BYTES", "GODOT_MCP_MAX_PAYLOAD_BYTES"]


static func max_bytes() -> int:
	for env_var in ENV_VARS:
		var raw := OS.get_environment(env_var).strip_edges()
		if raw.is_valid_int():
			var value := int(raw)
			if value > 0:
				return value
	return DEFAULT_MAX_BYTES


static func validate_size(label: String, byte_count: int) -> Dictionary:
	var limit := max_bytes()
	if byte_count > limit:
		return {
			"ok": false,
			"error": "%s exceeds NIUA MCP payload limit: %d bytes > %d bytes. Reduce the file size or raise NIUA_MCP_MAX_PAYLOAD_BYTES." % [label, byte_count, limit],
			"errorCode": "payload_too_large"
		}
	return { "ok": true, "limit": limit, "bytes": byte_count }
