@tool
extends RefCounted


static func resolve_layer(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary) -> Dictionary:
	var requested_path := str(body.get("nodePath", ""))
	var node = resolve_node.call(requested_path)
	if node == null:
		return error("node not found: %s" % requested_path, "not_found")
	if not (node is TileMapLayer):
		return error("node is not a TileMapLayer: %s" % str(node_path_for_response.call(node)), "invalid_node")

	var layer := node as TileMapLayer
	return {
		"ok": true,
		"layer": layer,
		"nodePath": str(node_path_for_response.call(layer))
	}


static func notify_layer_update(layer: TileMapLayer) -> void:
	if layer.has_method("notify_runtime_tile_data_update"):
		layer.notify_runtime_tile_data_update()


static func remember(remember: Callable, message: String) -> void:
	if remember.is_valid():
		remember.call(message)


static func error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
