@tool
extends RefCounted

const NiuaMcpLocalizationRegistryOperations = preload("niua_mcp_localization_registry_operations.gd")
const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")


static func set_locale(body: Dictionary) -> Dictionary:
	var locale := str(body.get("locale", "")).strip_edges()
	if locale.is_empty():
		return NiuaMcpSceneNodeContext.error("locale is required")

	TranslationServer.set_locale(locale)
	return {
		"ok": true,
		"data": {
			"locale": TranslationServer.get_locale(),
			"state": NiuaMcpLocalizationRegistryOperations.get_localization_state().get("data", {})
		}
	}
