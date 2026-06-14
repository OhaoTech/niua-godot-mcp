@tool
extends RefCounted

const NiuaMcpBridgeContext = preload("niua_mcp_bridge_context.gd")

var editor: EditorInterface
var debugger_probe_host
var memory
var _editor: EditorInterface
var _debugger_probe_host


func configure(editor: EditorInterface, debugger_probe_host, memory) -> void:
	self.editor = editor
	self.debugger_probe_host = debugger_probe_host
	self.memory = memory
	_editor = editor
	_debugger_probe_host = debugger_probe_host


func editor_resource_filesystem():
	return NiuaMcpBridgeContext.editor_resource_filesystem(editor)


func edited_scene_root() -> Node:
	return NiuaMcpBridgeContext.edited_scene_root(editor)


func resolve_node(node_path: String) -> Node:
	return NiuaMcpBridgeContext.resolve_node(editor, node_path)


func node_path_for_response(node: Node) -> String:
	return NiuaMcpBridgeContext.node_path_for_response(editor, node)


func validate_res_path(raw_path: String, allow_root: bool = false) -> Dictionary:
	return NiuaMcpBridgeContext.validate_res_path(raw_path, allow_root)


func refresh_filesystem(path: String = "") -> void:
	NiuaMcpBridgeContext.refresh_filesystem(editor, path)


func save_project_settings_if_requested(save_requested: bool) -> int:
	return NiuaMcpBridgeContext.save_project_settings_if_requested(save_requested)


func debugger_probe():
	if _debugger_probe_host == null:
		return null
	return _debugger_probe_host.probe()


func remember(message: String) -> void:
	if memory != null:
		memory.remember(message)


func _validate_res_path(raw_path: String, allow_root: bool = false) -> Dictionary:
	return NiuaMcpBridgeContext.validate_res_path(raw_path, allow_root)


func _refresh_filesystem(path: String = "") -> void:
	NiuaMcpBridgeContext.refresh_filesystem(editor, path)


func _node_path_for_response(node: Node) -> String:
	return NiuaMcpBridgeContext.node_path_for_response(_editor, node)
