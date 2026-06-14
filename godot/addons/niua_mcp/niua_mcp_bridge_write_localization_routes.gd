@tool
extends RefCounted

const NiuaMcpLocalizationOperations = preload("niua_mcp_localization_operations.gd")

const HANDLERS := {
	"_create_csv_translation": true,
	"_register_translation_file": true,
	"_set_locale": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _create_csv_translation(body: Dictionary) -> Dictionary:
	return NiuaMcpLocalizationOperations.create_csv_translation_with_side_effects(
		body,
		Callable(_context, "remember")
	)


func _register_translation_file(body: Dictionary) -> Dictionary:
	return NiuaMcpLocalizationOperations.register_translation_file_with_side_effects(
		body,
		Callable(_context, "remember")
	)


func _set_locale(body: Dictionary) -> Dictionary:
	return NiuaMcpLocalizationOperations.set_locale_with_side_effects(
		body,
		Callable(_context, "remember")
	)
