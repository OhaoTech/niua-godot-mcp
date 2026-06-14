@tool
extends RefCounted

const NiuaMcpImportOperations = preload("niua_mcp_import_operations.gd")

const HANDLERS := {
	"_set_import_options": true,
	"_reimport_assets": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _set_import_options(body: Dictionary) -> Dictionary:
	return NiuaMcpImportOperations.set_import_options_with_side_effects(
		body,
		Callable(_context, "validate_res_path"),
		Callable(self, "_reimport_assets"),
		Callable(_context, "remember")
	)


func _reimport_assets(body: Dictionary) -> Dictionary:
	return NiuaMcpImportOperations.reimport_assets_with_side_effects(
		body,
		_context.editor_resource_filesystem(),
		Callable(_context, "refresh_filesystem"),
		Callable(_context, "remember")
	)
