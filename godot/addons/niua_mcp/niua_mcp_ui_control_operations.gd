@tool
extends RefCounted

const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")
const NiuaMcpUiLayoutOperations = preload("niua_mcp_ui_layout_operations.gd")

const SUPPORTED_CONTROL_TYPES := {
	"Control": true,
	"VBoxContainer": true,
	"HBoxContainer": true,
	"MarginContainer": true,
	"CenterContainer": true,
	"Label": true,
	"Button": true,
	"Panel": true,
	"TextureRect": true
}


static func create_ui_control(editor: EditorInterface, body: Dictionary, path_validator: Callable) -> Dictionary:
	var root := NiuaMcpSceneNodeContext.edited_scene_root(editor)
	if root == null:
		return NiuaMcpSceneNodeContext.error("no edited scene is open")

	var type_name := str(body.get("type", ""))
	if not SUPPORTED_CONTROL_TYPES.has(type_name):
		return NiuaMcpSceneNodeContext.error("unsupported UI Control type: %s" % type_name)

	var instance: Object = ClassDB.instantiate(type_name)
	if not (instance is Control):
		if instance != null:
			instance.free()
		return NiuaMcpSceneNodeContext.error("Godot class is not a Control: %s" % type_name)

	var control := instance as Control
	var parent: Node = root
	var parent_path := str(body.get("parentPath", ""))
	if not parent_path.is_empty():
		parent = NiuaMcpSceneNodeContext.resolve_node(editor, parent_path)
		if parent == null:
			control.free()
			return NiuaMcpSceneNodeContext.error("parent node not found: %s" % parent_path, "not_found")

	var texture_result := _prepare_texture(control, body, path_validator)
	if not bool(texture_result.get("ok", false)):
		control.free()
		return texture_result

	var desired_name := str(body.get("name", ""))
	if not desired_name.is_empty():
		control.name = desired_name

	if body.has("text"):
		if control is Label or control is Button:
			control.set("text", str(body.get("text", "")))
		else:
			control.free()
			return NiuaMcpSceneNodeContext.error("text is only supported for Label and Button controls")

	if body.has("tooltip"):
		control.tooltip_text = str(body.get("tooltip", ""))

	parent.add_child(control)
	control.owner = root

	var layout_data = body.get("layout", null)
	if typeof(layout_data) == TYPE_DICTIONARY:
		var layout_result := NiuaMcpUiLayoutOperations.apply_layout_to_control(control, layout_data)
		if not bool(layout_result.get("ok", false)):
			parent.remove_child(control)
			control.free()
			return layout_result

	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, control),
			"name": control.name,
			"type": control.get_class(),
			"parentPath": NiuaMcpSceneNodeContext.node_path_for_response(editor, parent),
			"text": control.get("text") if (control is Label or control is Button) else "",
			"texturePath": texture_result.get("path", ""),
			"layout": NiuaMcpUiLayoutOperations.layout_snapshot(control)
		}
	}


static func _prepare_texture(control: Control, body: Dictionary, path_validator: Callable) -> Dictionary:
	var texture_path := str(body.get("texturePath", ""))
	if texture_path.is_empty():
		return { "ok": true, "path": "" }
	if not (control is TextureRect):
		return NiuaMcpSceneNodeContext.error("texturePath is only supported for TextureRect controls")
	if not path_validator.is_valid():
		return NiuaMcpSceneNodeContext.error("resource path validator is unavailable")

	var validation = path_validator.call(texture_path)
	if typeof(validation) != TYPE_DICTIONARY or not bool(validation.get("ok", false)):
		return validation

	var path := str(validation.get("path", ""))
	var texture := ResourceLoader.load(path, "Texture2D", ResourceLoader.CACHE_MODE_IGNORE)
	if not (texture is Texture2D):
		return NiuaMcpSceneNodeContext.error("texture resource not found or not a Texture2D: %s" % path, "not_found")

	(control as TextureRect).texture = texture
	return {
		"ok": true,
		"path": path
	}
