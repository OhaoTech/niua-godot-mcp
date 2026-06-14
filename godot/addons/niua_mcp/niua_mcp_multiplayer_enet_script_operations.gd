@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")


static func create_enet_multiplayer_script(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	var node_path := str(body.get("nodePath", ""))
	var node := NiuaMcpSceneNodeContext.resolve_node(editor, node_path)
	if node == null:
		return NiuaMcpSceneNodeContext.error("node not found: %s" % node_path, "not_found")

	var validation := NiuaMcpPathUtils.validate_script_path(str(body.get("scriptPath", "")))
	if not bool(validation.get("ok", false)):
		return validation

	var property_name := str(body.get("propertyName", ""))
	if not _is_valid_identifier(property_name):
		return NiuaMcpSceneNodeContext.error("invalid propertyName: %s" % property_name)

	var script_path := str(validation.get("path", ""))
	var overwrite := bool(body.get("overwrite", false))
	if FileAccess.file_exists(script_path) and not overwrite:
		return NiuaMcpSceneNodeContext.error("script already exists: %s" % script_path)

	var state_path := str(body.get("statePath", "SharedState"))
	var host_value := str(body.get("hostValue", "HOST_SYNCED"))
	var default_port := int(body.get("defaultPort", 19174))
	var content := enet_script_content(state_path, property_name, host_value, default_port)
	var write_result := _write_script(script_path, content)
	if not bool(write_result.get("ok", false)):
		return write_result

	if refresh_filesystem.is_valid():
		refresh_filesystem.call(script_path)

	var script_result := _load_script(script_path)
	if not bool(script_result.get("ok", false)):
		return script_result

	node.set_script(script_result.get("script"))

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, node),
			"scriptPath": script_path,
			"statePath": state_path,
			"propertyName": property_name,
			"hostValue": host_value,
			"defaultPort": default_port,
			"attached": true,
			"reloadError": script_result.get("reloadError", OK),
			"bytes": content.to_utf8_buffer().size()
		}
	}


static func enet_script_content(state_path: String, property_name: String, host_value: String, default_port: int) -> String:
	return """extends Node

@export var default_port := %s
@export var state_path := NodePath("%s")
@export var property_name := "%s"
@export var host_value := "%s"
@export var default_host := "127.0.0.1"
@export var timeout_seconds := 8.0

var _peer: ENetMultiplayerPeer
var _role := ""
var _host := "127.0.0.1"
var _port := 0
var _probe_log := ""
var _elapsed := 0.0
var _host_set := false
var _peer_connected := false
var _finished := false
var _state: Node


func _ready() -> void:
	_port = default_port
	_parse_user_args()
	_state = get_node_or_null(state_path)
	if _state == null:
		_finish(3, {"event": "error", "message": "state node not found", "state_path": str(state_path)})
		return

	if _role == "host":
		_start_host()
	elif _role == "client":
		_start_client()
	else:
		_finish(3, {"event": "error", "message": "expected --role host or --role client"})


func _process(delta: float) -> void:
	if _finished:
		return
	_elapsed += delta
	if _elapsed > timeout_seconds:
		_finish(2, {"event": "timeout", "role": _role, "value": _read_state_value()})
		return

	if _role == "host":
		_process_host()
	elif _role == "client":
		_process_client()


func _parse_user_args() -> void:
	var args := OS.get_cmdline_user_args()
	var index := 0
	while index < args.size():
		var key := str(args[index])
		var value := ""
		if index + 1 < args.size():
			value = str(args[index + 1])
		match key:
			"--role":
				_role = value
				index += 2
			"--host":
				_host = value
				index += 2
			"--port":
				_port = int(value)
				index += 2
			"--probe-log":
				_probe_log = value
				index += 2
			"--timeout":
				timeout_seconds = float(value)
				index += 2
			_:
				index += 1


func _start_host() -> void:
	_peer = ENetMultiplayerPeer.new()
	var err := _peer.create_server(_port, 1)
	if err != OK:
		_finish(4, {"event": "error", "role": "host", "message": "create_server failed", "error": err})
		return
	multiplayer.multiplayer_peer = _peer
	if not multiplayer.peer_connected.is_connected(_on_peer_connected):
		multiplayer.peer_connected.connect(_on_peer_connected)
	_log_event({"event": "host_started", "port": _port})


func _start_client() -> void:
	_peer = ENetMultiplayerPeer.new()
	var err := _peer.create_client(_host, _port)
	if err != OK:
		_finish(4, {"event": "error", "role": "client", "message": "create_client failed", "error": err})
		return
	multiplayer.multiplayer_peer = _peer
	_log_event({"event": "client_started", "host": _host, "port": _port})


func _process_host() -> void:
	if _host_set:
		return
	if not _peer_connected and _elapsed < 2.0:
		return
	_state.set(property_name, host_value)
	_host_set = true
	_log_event({"event": "host_set", "value": host_value})


func _on_peer_connected(peer_id: int) -> void:
	_peer_connected = true
	_log_event({"event": "peer_connected", "peer_id": peer_id})


func _process_client() -> void:
	var value = _read_state_value()
	if str(value) == host_value:
		_finish(0, {"event": "client_observed", "value": str(value)})


func _read_state_value():
	if _state == null:
		return null
	return _state.get(property_name)


func _finish(exit_code: int, event: Dictionary) -> void:
	if _finished:
		return
	_finished = true
	_log_event(event)
	if multiplayer.multiplayer_peer != null:
		multiplayer.multiplayer_peer.close()
		multiplayer.multiplayer_peer = null
	get_tree().quit(exit_code)


func _log_event(event: Dictionary) -> void:
	if _probe_log.is_empty():
		print(JSON.stringify(event))
		return
	var file := FileAccess.open(_probe_log, FileAccess.WRITE)
	if file == null:
		print(JSON.stringify(event))
		return
	file.store_string(JSON.stringify(event))
	file.close()
""" % [str(default_port), _escape(state_path), _escape(property_name), _escape(host_value)]


static func _write_script(script_path: String, content: String) -> Dictionary:
	var parent_error := NiuaMcpPathUtils.ensure_parent_directory(script_path)
	if parent_error != OK:
		return NiuaMcpSceneNodeContext.error("failed to create parent directory for %s: %s" % [script_path, parent_error])

	var file := FileAccess.open(script_path, FileAccess.WRITE)
	if file == null:
		return NiuaMcpSceneNodeContext.error("failed to write script: %s" % script_path)
	file.store_string(content)
	file.close()
	return { "ok": true }


static func _load_script(script_path: String) -> Dictionary:
	var resource := ResourceLoader.load(script_path, "GDScript", ResourceLoader.CACHE_MODE_IGNORE)
	if resource == null or not (resource is GDScript):
		return NiuaMcpSceneNodeContext.error("script not found or not loadable: %s" % script_path, "not_found")

	var script := resource as GDScript
	var reload_error := script.reload()
	if reload_error != OK:
		return NiuaMcpSceneNodeContext.error("script failed to reload %s: %s" % [script_path, reload_error])
	return {
		"ok": true,
		"script": script,
		"reloadError": reload_error
	}


static func _is_valid_identifier(value: String) -> bool:
	if value.is_empty():
		return false
	var first := value.unicode_at(0)
	if not _is_identifier_start(first):
		return false
	for index in range(1, value.length()):
		if not _is_identifier_part(value.unicode_at(index)):
			return false
	return true


static func _is_identifier_start(codepoint: int) -> bool:
	return codepoint == 95 or (codepoint >= 65 and codepoint <= 90) or (codepoint >= 97 and codepoint <= 122)


static func _is_identifier_part(codepoint: int) -> bool:
	return _is_identifier_start(codepoint) or (codepoint >= 48 and codepoint <= 57)


static func _escape(value: String) -> String:
	return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n")
