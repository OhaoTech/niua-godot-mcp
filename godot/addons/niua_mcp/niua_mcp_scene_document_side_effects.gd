@tool
extends RefCounted

const NiuaMcpSceneDocumentCreateOperations = preload("niua_mcp_scene_document_create_operations.gd")
const NiuaMcpSceneDocumentSaveOperations = preload("niua_mcp_scene_document_save_operations.gd")
const NiuaMcpSceneDocumentUtils = preload("niua_mcp_scene_document_utils.gd")


static func create_scene_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneDocumentCreateOperations.create_scene(editor, body, refresh_filesystem)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneDocumentUtils.remember(remember, "Created scene %s" % str(data.get("path", "")))
	return response


static func save_current_scene_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneDocumentSaveOperations.save_current_scene(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneDocumentUtils.remember(remember, "Saved scene %s" % str(data.get("path", "")))
	return response


static func save_scene_as_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	var response := NiuaMcpSceneDocumentSaveOperations.save_scene_as(editor, body, refresh_filesystem)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneDocumentUtils.remember(remember, "Saved scene as %s" % str(data.get("path", "")))
	return response
