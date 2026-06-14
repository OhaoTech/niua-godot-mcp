@tool
extends RefCounted

const MAX_EVENTS := 200

const NiuaMcpImportOperations = preload("niua_mcp_import_operations.gd")

var _events: Array[Dictionary] = []
var _signal_source = null


func start(resource_filesystem) -> void:
	stop()
	if resource_filesystem == null:
		return

	_signal_source = resource_filesystem
	_connect_signal("resources_reimporting", Callable(self, "_on_import_resources_reimporting"))
	_connect_signal("resources_reimported", Callable(self, "_on_import_resources_reimported"))
	_connect_signal("resources_reload", Callable(self, "_on_import_resources_reload"))
	_connect_signal("sources_changed", Callable(self, "_on_import_sources_changed"))
	_connect_signal("filesystem_changed", Callable(self, "_on_import_filesystem_changed"))


func stop() -> void:
	if _signal_source == null:
		return

	_disconnect_signal("resources_reimporting", Callable(self, "_on_import_resources_reimporting"))
	_disconnect_signal("resources_reimported", Callable(self, "_on_import_resources_reimported"))
	_disconnect_signal("resources_reload", Callable(self, "_on_import_resources_reload"))
	_disconnect_signal("sources_changed", Callable(self, "_on_import_sources_changed"))
	_disconnect_signal("filesystem_changed", Callable(self, "_on_import_filesystem_changed"))
	_signal_source = null


func response(query: Dictionary) -> Dictionary:
	return NiuaMcpImportOperations.import_events_response(
		query,
		_events,
		_signal_source != null,
		MAX_EVENTS
	)


func record(kind: String, raw_paths = [], extra: Dictionary = {}) -> void:
	NiuaMcpImportOperations.record_event(
		_events,
		MAX_EVENTS,
		kind,
		raw_paths,
		extra,
		_signal_source
	)


func _connect_signal(signal_name: String, callback: Callable) -> void:
	if _signal_source == null or not _signal_source.has_signal(signal_name):
		return
	if not _signal_source.is_connected(signal_name, callback):
		_signal_source.connect(signal_name, callback)


func _disconnect_signal(signal_name: String, callback: Callable) -> void:
	if _signal_source == null or not _signal_source.has_signal(signal_name):
		return
	if _signal_source.is_connected(signal_name, callback):
		_signal_source.disconnect(signal_name, callback)


func _on_import_resources_reimporting(resources) -> void:
	record("resources_reimporting", resources)


func _on_import_resources_reimported(resources) -> void:
	record("resources_reimported", resources)


func _on_import_resources_reload(resources) -> void:
	record("resources_reload", resources)


func _on_import_sources_changed(exists: bool) -> void:
	record("sources_changed", [], { "exists": exists })


func _on_import_filesystem_changed() -> void:
	record("filesystem_changed")
