@tool
extends RefCounted

const NiuaMcpUiOperations = preload("niua_mcp_ui_operations.gd")

const HANDLERS := {
	"_create_ui_control": true,
	"_set_control_layout": true,
	"_create_ui_theme": true,
	"_apply_ui_theme_override": true,
	"_connect_ui_signal": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _create_ui_control(body: Dictionary) -> Dictionary:
	return NiuaMcpUiOperations.create_ui_control_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "validate_res_path"),
		Callable(_context, "remember")
	)


func _set_control_layout(body: Dictionary) -> Dictionary:
	return NiuaMcpUiOperations.set_control_layout_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _create_ui_theme(body: Dictionary) -> Dictionary:
	return NiuaMcpUiOperations.create_ui_theme_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "refresh_filesystem"),
		Callable(_context, "remember")
	)


func _apply_ui_theme_override(body: Dictionary) -> Dictionary:
	return NiuaMcpUiOperations.apply_ui_theme_override_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "validate_res_path"),
		Callable(_context, "remember")
	)


func _connect_ui_signal(body: Dictionary) -> Dictionary:
	return NiuaMcpUiOperations.connect_ui_signal_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)
