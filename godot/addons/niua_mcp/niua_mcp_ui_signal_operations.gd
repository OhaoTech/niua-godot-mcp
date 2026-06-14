@tool
extends RefCounted

const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")


static func connect_ui_signal(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var source := NiuaMcpSceneNodeContext.resolve_node(editor, str(body.get("sourcePath", "")))
	if source == null:
		return NiuaMcpSceneNodeContext.error("source node not found: %s" % str(body.get("sourcePath", "")), "not_found")
	if not (source is Control):
		return NiuaMcpSceneNodeContext.error("source node is not a Control: %s" % str(body.get("sourcePath", "")))

	var signal_name := StringName(str(body.get("signalName", "")))
	if String(signal_name).is_empty():
		return NiuaMcpSceneNodeContext.error("signalName is required")
	if not source.has_signal(signal_name):
		return NiuaMcpSceneNodeContext.error("source Control does not expose signal: %s" % String(signal_name), "not_found")

	var target := NiuaMcpSceneNodeContext.resolve_node(editor, str(body.get("targetPath", "")))
	if target == null:
		return NiuaMcpSceneNodeContext.error("target node not found: %s" % str(body.get("targetPath", "")), "not_found")

	var method_name := StringName(str(body.get("methodName", "")))
	if String(method_name).is_empty():
		return NiuaMcpSceneNodeContext.error("methodName is required")
	if not target.has_method(method_name):
		return NiuaMcpSceneNodeContext.error("target node does not expose method: %s" % String(method_name), "not_found")

	var callable := Callable(target, method_name)
	if source.is_connected(signal_name, callable):
		return _response(editor, source, target, signal_name, method_name, true)

	var error := source.connect(signal_name, callable, Object.CONNECT_PERSIST)
	if error != OK:
		return NiuaMcpSceneNodeContext.error("failed to connect UI signal %s: %s" % [String(signal_name), error])

	return _response(editor, source, target, signal_name, method_name, false)


static func _response(editor: EditorInterface, source: Node, target: Node, signal_name: StringName, method_name: StringName, already_connected: bool) -> Dictionary:
	return {
		"ok": true,
		"data": {
			"sourcePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, source),
			"signalName": String(signal_name),
			"targetPath": NiuaMcpSceneNodeContext.node_path_for_response(editor, target),
			"methodName": String(method_name),
			"alreadyConnected": already_connected
		}
	}
