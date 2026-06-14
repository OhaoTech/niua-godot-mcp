@tool
extends RefCounted

const NiuaMcpAudioBusOperations = preload("niua_mcp_audio_bus_operations.gd")
const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")


static func create_audio_stream_player(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var root := NiuaMcpSceneNodeContext.edited_scene_root(editor)
	if root == null:
		return NiuaMcpSceneNodeContext.error("no edited scene is open")

	var parent: Node = root
	var parent_path := str(body.get("parentPath", ""))
	if not parent_path.is_empty():
		parent = NiuaMcpSceneNodeContext.resolve_node(editor, parent_path)
		if parent == null:
			return NiuaMcpSceneNodeContext.error("parent node not found: %s" % parent_path, "not_found")

	var bus_name := str(body.get("busName", "Master")).strip_edges()
	if bus_name.is_empty():
		bus_name = "Master"
	if NiuaMcpAudioBusOperations.audio_bus_index(bus_name) == -1:
		return NiuaMcpSceneNodeContext.error("audio bus not found: %s" % bus_name, "not_found")

	var player := AudioStreamPlayer.new()
	player.name = str(body.get("name", "AudioStreamPlayer"))
	player.bus = bus_name
	player.stream = _create_generator_stream(body.get("generator", {}))
	player.autoplay = bool(body.get("autoplay", false))
	if body.has("volumeDb"):
		player.volume_db = float(body.get("volumeDb"))

	parent.add_child(player)
	player.owner = root

	if bool(body.get("play", false)):
		player.play()

	return {
		"ok": true,
		"data": player_snapshot(editor, player, parent)
	}


static func player_snapshot(editor: EditorInterface, player: AudioStreamPlayer, parent: Node) -> Dictionary:
	var stream := player.stream
	return {
		"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, player),
		"name": player.name,
		"type": player.get_class(),
		"parentPath": NiuaMcpSceneNodeContext.node_path_for_response(editor, parent),
		"busName": str(player.bus),
		"volumeDb": player.volume_db,
		"autoplay": player.autoplay,
		"playing": player.is_playing(),
		"streamClass": stream.get_class() if stream != null else "",
		"hasStream": stream != null
	}


static func _create_generator_stream(raw_generator) -> AudioStreamGenerator:
	var data: Dictionary = raw_generator if typeof(raw_generator) == TYPE_DICTIONARY else {}
	var generator := AudioStreamGenerator.new()
	generator.mix_rate = float(data.get("mixRate", 44100.0))
	generator.buffer_length = float(data.get("bufferLength", 0.5))
	return generator
