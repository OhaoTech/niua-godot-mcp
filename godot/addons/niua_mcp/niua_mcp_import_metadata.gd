@tool
extends RefCounted

const NiuaMcpImportAssetListing = preload("niua_mcp_import_asset_listing.gd")
const NiuaMcpImportMetadataQueries = preload("niua_mcp_import_metadata_queries.gd")
const NiuaMcpImportEventSummary = preload("niua_mcp_import_event_summary.gd")


static func list_imported_assets(query: Dictionary) -> Dictionary:
	return NiuaMcpImportAssetListing.list_imported_assets(query)


static func get_metadata(query: Dictionary) -> Dictionary:
	return NiuaMcpImportMetadataQueries.get_metadata(query)


static func get_diagnostics(query: Dictionary) -> Dictionary:
	return NiuaMcpImportMetadataQueries.get_diagnostics(query)


static func summary(source_path: String, metadata_path: String, metadata: Dictionary) -> Dictionary:
	return NiuaMcpImportMetadataQueries.summary(source_path, metadata_path, metadata)


static func diagnostic_issues(source_path: String, metadata_path: String, metadata: Dictionary, metadata_exists: bool, metadata_load_error: int) -> Array:
	return NiuaMcpImportMetadataQueries.diagnostic_issues(source_path, metadata_path, metadata, metadata_exists, metadata_load_error)


static func event_summary(kind: String, raw_paths, extra: Dictionary, resource_filesystem) -> Dictionary:
	return NiuaMcpImportEventSummary.event_summary(kind, raw_paths, extra, resource_filesystem)
