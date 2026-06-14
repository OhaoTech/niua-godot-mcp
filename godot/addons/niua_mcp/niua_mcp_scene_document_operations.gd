@tool
extends RefCounted

const NiuaMcpSceneDocumentCreateOperations = preload("niua_mcp_scene_document_create_operations.gd")
const NiuaMcpSceneDocumentSaveOperations = preload("niua_mcp_scene_document_save_operations.gd")
const NiuaMcpSceneDocumentSideEffects = preload("niua_mcp_scene_document_side_effects.gd")
const NiuaMcpSceneDocumentUtils = preload("niua_mcp_scene_document_utils.gd")


static func create_scene_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpSceneDocumentSideEffects.create_scene_with_side_effects(editor, body, refresh_filesystem, remember)


static func save_current_scene_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpSceneDocumentSideEffects.save_current_scene_with_side_effects(editor, body, remember)


static func save_scene_as_with_side_effects(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable) -> Dictionary:
	return NiuaMcpSceneDocumentSideEffects.save_scene_as_with_side_effects(editor, body, refresh_filesystem, remember)


static func create_scene(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	return NiuaMcpSceneDocumentCreateOperations.create_scene(editor, body, refresh_filesystem)


static func save_current_scene(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpSceneDocumentSaveOperations.save_current_scene(editor, body)


static func save_scene_as(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable) -> Dictionary:
	return NiuaMcpSceneDocumentSaveOperations.save_scene_as(editor, body, refresh_filesystem)
