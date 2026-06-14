@tool
extends RefCounted

const NiuaMcpJsonArgs = preload("niua_mcp_json_args.gd")
const NiuaMcpViewportResolver = preload("niua_mcp_viewport_resolver.gd")
const NiuaMcpViewportStateOperations = preload("niua_mcp_viewport_state_operations.gd")
const NiuaMcpViewportUtils = preload("niua_mcp_viewport_utils.gd")


static func set_viewport_camera(editor: EditorInterface, body: Dictionary) -> Dictionary:
	if editor == null:
		return NiuaMcpViewportUtils.error("Godot editor interface is unavailable")

	var viewport_kind := str(body.get("viewport", "3d")).to_lower()
	var index := int(body.get("index", 0))
	var resolved := NiuaMcpViewportResolver.resolve_editor_viewport(editor, viewport_kind, index)
	if not resolved.get("ok", false):
		return resolved

	var viewport := resolved.get("viewport") as SubViewport
	index = int(resolved.get("index", index))
	if viewport == null:
		return NiuaMcpViewportUtils.error("editor viewport unavailable: %s" % viewport_kind, "not_found")

	match viewport_kind:
		"2d":
			var camera_2d := viewport.get_camera_2d()
			if camera_2d == null:
				return NiuaMcpViewportUtils.error("editor 2D viewport camera is unavailable", "not_found")
			var result_2d := apply_camera2d_update(camera_2d, body)
			if not result_2d.get("ok", false):
				return result_2d
		"3d":
			var camera_3d := viewport.get_camera_3d()
			if camera_3d == null:
				return NiuaMcpViewportUtils.error("editor 3D viewport camera is unavailable", "not_found")
			var result_3d := apply_camera3d_update(camera_3d, body)
			if not result_3d.get("ok", false):
				return result_3d
		_:
			return NiuaMcpViewportUtils.error("viewport must be 2d or 3d: %s" % viewport_kind)

	return NiuaMcpViewportStateOperations.viewport_state(editor, {
		"viewport": viewport_kind,
		"index": index
	})


static func apply_camera2d_update(camera: Camera2D, body: Dictionary) -> Dictionary:
	if body.has("position"):
		var position := NiuaMcpJsonArgs.typed_vector2(body.get("position"), "position")
		if not position.get("ok", false):
			return position
		camera.global_position = position.get("value")
	if body.has("zoom"):
		var zoom := NiuaMcpJsonArgs.typed_vector2(body.get("zoom"), "zoom")
		if not zoom.get("ok", false):
			return zoom
		camera.zoom = zoom.get("value")
	if body.has("rotation"):
		camera.global_rotation = float(body.get("rotation"))
	if body.has("rotationDegrees"):
		camera.global_rotation_degrees = float(body.get("rotationDegrees"))
	return { "ok": true }


static func apply_camera3d_update(camera: Camera3D, body: Dictionary) -> Dictionary:
	if body.has("position"):
		var position := NiuaMcpJsonArgs.typed_vector3(body.get("position"), "position")
		if not position.get("ok", false):
			return position
		camera.global_position = position.get("value")
	if body.has("rotation"):
		var rotation := NiuaMcpJsonArgs.typed_vector3(body.get("rotation"), "rotation")
		if not rotation.get("ok", false):
			return rotation
		camera.global_rotation = rotation.get("value")
	if body.has("rotationDegrees"):
		var rotation_degrees := NiuaMcpJsonArgs.typed_vector3(body.get("rotationDegrees"), "rotationDegrees")
		if not rotation_degrees.get("ok", false):
			return rotation_degrees
		camera.global_rotation_degrees = rotation_degrees.get("value")
	if body.has("fov"):
		camera.fov = float(body.get("fov"))
	if body.has("near"):
		camera.near = float(body.get("near"))
	if body.has("far"):
		camera.far = float(body.get("far"))
	return { "ok": true }
