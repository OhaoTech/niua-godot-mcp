@tool
extends RefCounted

const NiuaMcpImportMetadata = preload("niua_mcp_import_metadata.gd")


static func list_imported_assets(query: Dictionary) -> Dictionary:
	return NiuaMcpImportMetadata.list_imported_assets(query)


static func get_import_metadata(query: Dictionary) -> Dictionary:
	return NiuaMcpImportMetadata.get_metadata(query)


static func get_import_diagnostics(query: Dictionary) -> Dictionary:
	return NiuaMcpImportMetadata.get_diagnostics(query)
