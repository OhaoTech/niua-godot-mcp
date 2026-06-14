@tool
extends RefCounted

const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")


static func create_navigation_target_follow_script(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	var node := NiuaMcpSceneNodeContext.resolve_node(editor, str(body.get("nodePath", "")))
	if node == null:
		return NiuaMcpSceneNodeContext.error("node not found: %s" % str(body.get("nodePath", "")), "not_found")
	if not (node is CharacterBody3D):
		return NiuaMcpSceneNodeContext.error("navigation target-follow script requires a CharacterBody3D node")

	var validation := NiuaMcpPathUtils.validate_script_path(str(body.get("scriptPath", "")))
	if not bool(validation.get("ok", false)):
		return validation

	var script_path := str(validation.get("path", ""))
	var overwrite := bool(body.get("overwrite", false))
	if FileAccess.file_exists(script_path) and not overwrite:
		return NiuaMcpSceneNodeContext.error("script already exists: %s" % script_path)

	var parent_error := NiuaMcpPathUtils.ensure_parent_directory(script_path)
	if parent_error != OK:
		return NiuaMcpSceneNodeContext.error("failed to create parent directory for %s: %s" % [script_path, parent_error])

	var content := target_follow_script_content(
		str(body.get("agentPath", "NavigationAgent3D")),
		str(body.get("targetPath", "../Target")),
		float(body.get("speed", 4.0))
	)
	var file := FileAccess.open(script_path, FileAccess.WRITE)
	if file == null:
		return NiuaMcpSceneNodeContext.error("failed to write script: %s" % script_path)
	file.store_string(content)
	file.close()

	if refresh_filesystem.is_valid():
		refresh_filesystem.call(script_path)

	var resource := ResourceLoader.load(script_path, "GDScript", ResourceLoader.CACHE_MODE_IGNORE)
	if resource == null or not (resource is GDScript):
		return NiuaMcpSceneNodeContext.error("script not found or not loadable: %s" % script_path, "not_found")

	var script := resource as GDScript
	var reload_error := script.reload()
	if reload_error != OK:
		return NiuaMcpSceneNodeContext.error("script failed to reload %s: %s" % [script_path, reload_error])

	node.set_script(script)

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, node),
			"scriptPath": script_path,
			"speed": float(body.get("speed", 4.0)),
			"agentPath": str(body.get("agentPath", "NavigationAgent3D")),
			"targetPath": str(body.get("targetPath", "../Target")),
			"attached": true,
			"reloadError": reload_error,
			"bytes": content.to_utf8_buffer().size()
		}
	}


static func target_follow_script_content(agent_path: String, target_path: String, speed: float) -> String:
	return """extends CharacterBody3D

@export var speed := %s
@export var agent_path := NodePath("%s")
@export var target_path := NodePath("%s")

@onready var _agent: NavigationAgent3D = get_node_or_null(agent_path) as NavigationAgent3D
@onready var _target: Node3D = get_node_or_null(target_path) as Node3D

func _ready() -> void:
	await get_tree().physics_frame
	if _agent != null and _target != null:
		_agent.target_position = _target.global_position

func _physics_process(_delta: float) -> void:
	if _agent == null or _target == null:
		velocity = Vector3.ZERO
		move_and_slide()
		return

	_agent.target_position = _target.global_position
	if _agent.is_navigation_finished():
		velocity = Vector3.ZERO
	else:
		var next_position := _agent.get_next_path_position()
		var direction := global_position.direction_to(next_position)
		velocity = direction * speed
	move_and_slide()
""" % [str(speed), _escape(agent_path), _escape(target_path)]


static func _escape(value: String) -> String:
	return value.replace("\\", "\\\\").replace("\"", "\\\"")
