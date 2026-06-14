@tool
extends RefCounted

const NiuaMcpSpriteFramesSheetExpander = preload("niua_mcp_sprite_frames_sheet_expander.gd")
const NiuaMcpSpriteFramesSheetGrid = preload("niua_mcp_sprite_frames_sheet_grid.gd")


static func expand_sprite_sheet_frames(raw_sheet, animation_name: String) -> Dictionary:
	return NiuaMcpSpriteFramesSheetExpander.expand_sprite_sheet_frames(raw_sheet, animation_name)


static func infer_sprite_sheet_grid(sheet: Dictionary, texture, animation_name: String) -> Dictionary:
	return NiuaMcpSpriteFramesSheetGrid.infer_sprite_sheet_grid(sheet, texture, animation_name)
