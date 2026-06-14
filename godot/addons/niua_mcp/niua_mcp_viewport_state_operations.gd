@tool
extends RefCounted

const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")
const NiuaMcpViewportResolver = preload("niua_mcp_viewport_resolver.gd")
const NiuaMcpViewportUtils = preload("niua_mcp_viewport_utils.gd")


static func viewport_state(editor: EditorInterface, query: Dictionary) -> Dictionary:
	if editor == null:
		return NiuaMcpViewportUtils.error("Godot editor interface is unavailable")

	var viewport_kind := str(query.get("viewport", "3d")).to_lower()
	var index := int(query.get("index", 0))
	if DisplayServer.get_name() == "headless":
		return {
			"ok": true,
			"data": {
				"viewport": viewport_kind,
				"index": index,
				"available": false,
				"displayServer": DisplayServer.get_name(),
				"reason": "editor viewport state requires a rendered editor; headless mode uses Godot's dummy renderer"
			}
		}

	var resolved := NiuaMcpViewportResolver.resolve_editor_viewport(editor, viewport_kind, index)
	if not resolved.get("ok", false):
		return resolved

	var viewport := resolved.get("viewport") as SubViewport
	index = int(resolved.get("index", index))
	if viewport == null:
		return {
			"ok": true,
			"data": {
				"viewport": viewport_kind,
				"index": index,
				"available": false,
				"reason": "editor viewport unavailable: %s" % viewport_kind
			}
		}

	return {
		"ok": true,
		"data": {
			"viewport": viewport_kind,
			"index": index,
			"available": true,
			"displayServer": DisplayServer.get_name(),
			"size": NiuaMcpVariantCodec.variant_to_json(viewport.get_visible_rect().size),
			"camera2D": camera2d_state(viewport.get_camera_2d()) if viewport_kind == "2d" else null,
			"camera3D": camera3d_state(viewport.get_camera_3d()) if viewport_kind == "3d" else null
		}
	}


static func camera2d_state(camera: Camera2D) -> Dictionary:
	if camera == null:
		return { "available": false }
	return {
		"available": true,
		"path": str(camera.get_path()),
		"position": NiuaMcpVariantCodec.variant_to_json(camera.global_position),
		"zoom": NiuaMcpVariantCodec.variant_to_json(camera.zoom),
		"rotation": camera.global_rotation
	}


static func camera3d_state(camera: Camera3D) -> Dictionary:
	if camera == null:
		return { "available": false }

	var transform := camera.global_transform
	return {
		"available": true,
		"path": str(camera.get_path()),
		"position": NiuaMcpVariantCodec.variant_to_json(transform.origin),
		"basisX": NiuaMcpVariantCodec.variant_to_json(transform.basis.x),
		"basisY": NiuaMcpVariantCodec.variant_to_json(transform.basis.y),
		"basisZ": NiuaMcpVariantCodec.variant_to_json(transform.basis.z),
		"fov": camera.fov,
		"near": camera.near,
		"far": camera.far,
		"projection": camera.projection
	}
