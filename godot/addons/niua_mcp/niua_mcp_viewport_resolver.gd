@tool
extends RefCounted

const NiuaMcpViewportUtils = preload("niua_mcp_viewport_utils.gd")


static func resolve_editor_viewport(editor: EditorInterface, viewport_kind: String, index: int) -> Dictionary:
	match viewport_kind:
		"2d":
			if not editor.has_method("get_editor_viewport_2d"):
				return NiuaMcpViewportUtils.error("Godot editor does not expose get_editor_viewport_2d")
			return {
				"ok": true,
				"viewport": editor.get_editor_viewport_2d(),
				"index": 0
			}
		"3d":
			if not editor.has_method("get_editor_viewport_3d"):
				return NiuaMcpViewportUtils.error("Godot editor does not expose get_editor_viewport_3d")
			return {
				"ok": true,
				"viewport": editor.get_editor_viewport_3d(index),
				"index": index
			}
		_:
			return NiuaMcpViewportUtils.error("viewport must be 2d or 3d: %s" % viewport_kind)
