@tool
extends RefCounted

const NiuaMcpLocalizationCsvOperations = preload("niua_mcp_localization_csv_operations.gd")
const NiuaMcpLocalizationLocaleOperations = preload("niua_mcp_localization_locale_operations.gd")
const NiuaMcpLocalizationRegistryOperations = preload("niua_mcp_localization_registry_operations.gd")
const NiuaMcpLocalizationSideEffects = preload("niua_mcp_localization_side_effects.gd")


static func get_localization_state() -> Dictionary:
	return NiuaMcpLocalizationRegistryOperations.get_localization_state()


static func create_csv_translation(body: Dictionary) -> Dictionary:
	return NiuaMcpLocalizationCsvOperations.create_csv_translation(body)


static func create_csv_translation_with_side_effects(body: Dictionary, remember: Callable) -> Dictionary:
	var result := create_csv_translation(body)
	NiuaMcpLocalizationSideEffects.remember_created_csv_translation(result, remember)
	return result


static func register_translation_file(body: Dictionary) -> Dictionary:
	return NiuaMcpLocalizationRegistryOperations.register_translation_file(body)


static func register_translation_file_with_side_effects(body: Dictionary, remember: Callable) -> Dictionary:
	var result := register_translation_file(body)
	NiuaMcpLocalizationSideEffects.remember_registered_translation_file(result, remember)
	return result


static func set_locale(body: Dictionary) -> Dictionary:
	return NiuaMcpLocalizationLocaleOperations.set_locale(body)


static func set_locale_with_side_effects(body: Dictionary, remember: Callable) -> Dictionary:
	var result := set_locale(body)
	NiuaMcpLocalizationSideEffects.remember_set_locale(result, remember)
	return result
