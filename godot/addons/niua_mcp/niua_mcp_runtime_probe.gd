extends Node

const NiuaMcpRuntimeProbeInput = preload("niua_mcp_runtime_probe_input.gd")
const NiuaMcpRuntimeProbeLogging = preload("niua_mcp_runtime_probe_logging.gd")
const NiuaMcpRuntimeProbeNodeMethodCaller = preload("niua_mcp_runtime_probe_node_method_caller.gd")
const NiuaMcpRuntimeProbeNodeProperties = preload("niua_mcp_runtime_probe_node_properties.gd")
const NiuaMcpRuntimeProbeProtocol = preload("niua_mcp_runtime_probe_protocol.gd")
const NiuaMcpRuntimeProbeScreenshot = preload("niua_mcp_runtime_probe_screenshot.gd")
const NiuaMcpRuntimeProbeState = preload("niua_mcp_runtime_probe_state.gd")
const NiuaMcpRuntimeProbeVariantCodec = preload("niua_mcp_runtime_probe_variant_codec.gd")

const CAPTURE_NAME := NiuaMcpRuntimeProbeProtocol.CAPTURE_NAME
const RUNTIME_READY_MESSAGE := NiuaMcpRuntimeProbeProtocol.RUNTIME_READY_MESSAGE
const RUNTIME_STATE_MESSAGE := NiuaMcpRuntimeProbeProtocol.RUNTIME_STATE_MESSAGE
const NODE_PROPERTIES_MESSAGE := NiuaMcpRuntimeProbeProtocol.NODE_PROPERTIES_MESSAGE
const NODE_PROPERTY_SET_MESSAGE := NiuaMcpRuntimeProbeProtocol.NODE_PROPERTY_SET_MESSAGE
const NODE_METHOD_CALL_RESULT_MESSAGE := NiuaMcpRuntimeProbeProtocol.NODE_METHOD_CALL_RESULT_MESSAGE
const RUNTIME_SCREENSHOT_RESULT_MESSAGE := NiuaMcpRuntimeProbeProtocol.RUNTIME_SCREENSHOT_RESULT_MESSAGE
const RUNTIME_INPUT_RESULT_MESSAGE := NiuaMcpRuntimeProbeProtocol.RUNTIME_INPUT_RESULT_MESSAGE


func _ready() -> void:
	_register_debugger_capture()
	_send_debugger_message(RUNTIME_READY_MESSAGE, NiuaMcpRuntimeProbeState.runtime_state(self, "ready"))


func _exit_tree() -> void:
	if EngineDebugger.has_capture(CAPTURE_NAME):
		EngineDebugger.unregister_message_capture(CAPTURE_NAME)


func log_event(message: String, level: String = "info", data: Dictionary = {}) -> void:
	NiuaMcpRuntimeProbeLogging.log_event(self, Callable(self, "_send_debugger_message"), message, level, data)


func log_debug(message: String, data: Dictionary = {}) -> void:
	log_event(message, "debug", data)


func log_info(message: String, data: Dictionary = {}) -> void:
	log_event(message, "info", data)


func log_warning(message: String, data: Dictionary = {}) -> void:
	log_event(message, "warning", data)


func log_error(message: String, data: Dictionary = {}) -> void:
	log_event(message, "error", data)


func _capture(message: String, _data: Array) -> bool:
	match message:
		"snapshot":
			var snapshot_request := NiuaMcpRuntimeProbeProtocol.request_payload(_data)
			_send_debugger_message(RUNTIME_STATE_MESSAGE, NiuaMcpRuntimeProbeState.runtime_state(
				self,
				"snapshot",
				int(snapshot_request.get("maxDepth", 0)),
				str(snapshot_request.get("pathFilter", "")),
				str(snapshot_request.get("requestId", ""))
			))
			return true
		"node_properties":
			_send_debugger_message(NODE_PROPERTIES_MESSAGE, NiuaMcpRuntimeProbeNodeProperties.node_properties(self, NiuaMcpRuntimeProbeProtocol.request_payload(_data)))
			return true
		"set_node_property":
			_send_debugger_message(NODE_PROPERTY_SET_MESSAGE, NiuaMcpRuntimeProbeNodeProperties.set_node_property(self, NiuaMcpRuntimeProbeProtocol.request_payload(_data)))
			return true
		"call_node_method":
			_send_debugger_message(NODE_METHOD_CALL_RESULT_MESSAGE, NiuaMcpRuntimeProbeNodeMethodCaller.call_node_method(self, NiuaMcpRuntimeProbeProtocol.request_payload(_data)))
			return true
		"runtime_screenshot":
			_send_debugger_message(RUNTIME_SCREENSHOT_RESULT_MESSAGE, NiuaMcpRuntimeProbeScreenshot.runtime_screenshot(self, NiuaMcpRuntimeProbeProtocol.request_payload(_data)))
			return true
		"send_input":
			_handle_send_input(NiuaMcpRuntimeProbeProtocol.request_payload(_data))
			return true
		_:
			return false


func _handle_send_input(request: Dictionary) -> void:
	var input_plan := NiuaMcpRuntimeProbeInput.plan(request)
	if not bool(input_plan.get("ok", false)):
		_send_debugger_message(RUNTIME_INPUT_RESULT_MESSAGE, {
			"requestId": input_plan.get("requestId", ""),
			"ok": false,
			"error": input_plan.get("error", ""),
			"errorCode": input_plan.get("errorCode", "bad_request"),
			"applied": null
		})
		return

	NiuaMcpRuntimeProbeInput.apply(input_plan)

	var hold_ms: int = int(input_plan.get("holdMs", 0))
	var held: Array = NiuaMcpRuntimeProbeInput.held_actions(input_plan)
	var held_keys: Array = NiuaMcpRuntimeProbeInput.held_keys(input_plan)
	var held_ms = null
	if hold_ms > 0 and (held.size() > 0 or held_keys.size() > 0):
		held_ms = hold_ms
		var tree := get_tree()
		if tree != null:
			await tree.create_timer(float(hold_ms) / 1000.0).timeout
		NiuaMcpRuntimeProbeInput.release(held)
		NiuaMcpRuntimeProbeInput.release_keys(held_keys)

	_send_debugger_message(RUNTIME_INPUT_RESULT_MESSAGE, {
		"requestId": input_plan.get("requestId", ""),
		"ok": true,
		"applied": NiuaMcpRuntimeProbeInput.applied_summary(input_plan, held_ms)
	})


func _register_debugger_capture() -> void:
	if not EngineDebugger.is_active():
		return
	if EngineDebugger.has_capture(CAPTURE_NAME):
		return
	EngineDebugger.register_message_capture(CAPTURE_NAME, Callable(self, "_capture"))


func _send_debugger_message(message: String, payload: Dictionary) -> void:
	if not EngineDebugger.is_active():
		return
	EngineDebugger.send_message(message, [payload])
