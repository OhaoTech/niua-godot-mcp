@tool
extends RefCounted

const NiuaMcpDebuggerProbeRuntimeDataUtils = preload("niua_mcp_debugger_probe_runtime_data_utils.gd")

var _runtime_states := {}
var _runtime_messages := {}


func runtime_session_data(session_id: int) -> Dictionary:
	return {
		"hasRuntimeState": _runtime_states.has(session_id),
		"lastRuntimeMessage": _runtime_messages.get(session_id, null),
		"runtimeState": _runtime_states.get(session_id, null)
	}


func store_runtime_message(kind: String, data: Array, session_id: int, record_event: Callable) -> void:
	var payload := NiuaMcpDebuggerProbeRuntimeDataUtils.runtime_payload(data)
	var message := {
		"kind": kind,
		"timeMsec": Time.get_ticks_msec()
	}
	_runtime_states[session_id] = payload
	_runtime_messages[session_id] = message
	NiuaMcpDebuggerProbeRuntimeDataUtils.record_event(record_event, kind, {
		"sessionId": session_id,
		"runtimeKind": str(payload.get("kind", "")),
		"currentScene": str(payload.get("currentScene", ""))
	})


func store_runtime_log(data: Array, session_id: int, record_event: Callable) -> void:
	var payload := NiuaMcpDebuggerProbeRuntimeDataUtils.runtime_payload(data)
	NiuaMcpDebuggerProbeRuntimeDataUtils.record_event(record_event, "runtime_log", {
		"sessionId": session_id,
		"level": str(payload.get("level", "info")),
		"message": str(payload.get("message", "")),
		"data": payload.get("data", {}),
		"currentScene": str(payload.get("currentScene", "")),
		"runtimeTimeMsec": int(payload.get("timeMsec", -1)),
		"truncated": bool(payload.get("truncated", false))
	})
