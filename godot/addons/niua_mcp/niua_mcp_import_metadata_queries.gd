@tool
extends RefCounted

const NiuaMcpImportMetadataDiagnostics = preload("niua_mcp_import_metadata_diagnostics.gd")
const NiuaMcpImportMetadataLoader = preload("niua_mcp_import_metadata_loader.gd")
const NiuaMcpImportMetadataQueryReader = preload("niua_mcp_import_metadata_query_reader.gd")
const NiuaMcpImportMetadataSummary = preload("niua_mcp_import_metadata_summary.gd")


static func get_metadata(query: Dictionary) -> Dictionary:
	return NiuaMcpImportMetadataQueryReader.get_metadata(query)


static func get_diagnostics(query: Dictionary) -> Dictionary:
	return NiuaMcpImportMetadataQueryReader.get_diagnostics(query)


static func summary(source_path: String, metadata_path: String, metadata: Dictionary) -> Dictionary:
	return NiuaMcpImportMetadataSummary.summary(source_path, metadata_path, metadata)


static func diagnostic_issues(source_path: String, metadata_path: String, metadata: Dictionary, metadata_exists: bool, metadata_load_error: int) -> Array:
	return NiuaMcpImportMetadataDiagnostics.diagnostic_issues(
		source_path,
		metadata_path,
		metadata,
		metadata_exists,
		metadata_load_error
	)


static func load_metadata(path: String) -> Dictionary:
	return NiuaMcpImportMetadataLoader.load_metadata(path)
