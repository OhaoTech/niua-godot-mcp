@tool
extends RefCounted

const NiuaMcpSceneGraphContext = preload("niua_mcp_scene_graph_context.gd")


static func create_animation_tree_state_machine(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var root := NiuaMcpSceneGraphContext.edited_scene_root(editor)
	if root == null:
		return _error("no edited scene is open")

	var player_path := str(body.get("playerPath", "")).strip_edges()
	var player := NiuaMcpSceneGraphContext.resolve_node(editor, player_path)
	if not (player is AnimationPlayer):
		return _error("AnimationPlayer not found: %s" % player_path, "not_found")

	var tree_result := _resolve_or_create_tree(editor, body)
	if not bool(tree_result.get("ok", false)):
		return tree_result
	var tree: AnimationTree = tree_result.get("tree")

	var states = body.get("states", [])
	if typeof(states) != TYPE_ARRAY or states.is_empty():
		return _error("states must be a non-empty array")

	var state_machine := AnimationNodeStateMachine.new()
	for index in range(states.size()):
		var state = states[index]
		if typeof(state) != TYPE_DICTIONARY:
			return _error("state must be an object")
		var state_name := str(state.get("name", "")).strip_edges()
		var animation_name := str(state.get("animationName", "")).strip_edges()
		if state_name.is_empty() or animation_name.is_empty():
			return _error("state name and animationName are required")
		var animation_node := AnimationNodeAnimation.new()
		animation_node.animation = animation_name
		state_machine.add_node(state_name, animation_node, _state_position(state, index))

	var transitions = body.get("transitions", [])
	if typeof(transitions) == TYPE_ARRAY:
		for transition in transitions:
			if typeof(transition) != TYPE_DICTIONARY:
				return _error("transition must be an object")
			var from_state := str(transition.get("from", "")).strip_edges()
			var to_state := str(transition.get("to", "")).strip_edges()
			if from_state.is_empty() or to_state.is_empty():
				return _error("transition from and to are required")
			var state_transition := AnimationNodeStateMachineTransition.new()
			if transition.has("advanceCondition"):
				state_transition.advance_condition = str(transition.get("advanceCondition", ""))
			if transition.has("xfadeTime"):
				state_transition.xfade_time = float(transition.get("xfadeTime", 0.0))
			state_machine.add_transition(from_state, to_state, state_transition)

	tree.tree_root = state_machine
	tree.anim_player = tree.get_path_to(player)
	tree.active = bool(body.get("active", true))

	return {
		"ok": true,
		"data": {
			"treePath": NiuaMcpSceneGraphContext.node_path_for_response(editor, tree),
			"playerPath": NiuaMcpSceneGraphContext.node_path_for_response(editor, player),
			"stateCount": states.size(),
			"transitionCount": transitions.size() if typeof(transitions) == TYPE_ARRAY else 0,
			"createdTree": bool(tree_result.get("created", false))
		}
	}


static func travel_animation_tree(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var tree_path := str(body.get("treePath", "")).strip_edges()
	var tree := NiuaMcpSceneGraphContext.resolve_node(editor, tree_path)
	if not (tree is AnimationTree):
		return _error("AnimationTree not found: %s" % tree_path, "not_found")

	var state := str(body.get("state", "")).strip_edges()
	if state.is_empty():
		return _error("state is required")

	var playback = tree.get("parameters/playback")
	if playback == null or not playback.has_method("travel"):
		return _error("AnimationTree state-machine playback is unavailable")
	playback.travel(state)

	var current := ""
	if playback.has_method("get_current_node"):
		current = str(playback.get_current_node())

	return {
		"ok": true,
		"data": {
			"treePath": NiuaMcpSceneGraphContext.node_path_for_response(editor, tree),
			"requestedState": state,
			"currentState": current
		}
	}


static func _resolve_or_create_tree(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var root := NiuaMcpSceneGraphContext.edited_scene_root(editor)
	var tree_path := str(body.get("treePath", "")).strip_edges()
	if not tree_path.is_empty():
		var existing := NiuaMcpSceneGraphContext.resolve_node(editor, tree_path)
		if existing is AnimationTree:
			return {
				"ok": true,
				"tree": existing,
				"created": false
			}
		return _error("AnimationTree not found: %s" % tree_path, "not_found")

	var parent: Node = root
	var parent_path := str(body.get("parentPath", "")).strip_edges()
	if not parent_path.is_empty():
		parent = NiuaMcpSceneGraphContext.resolve_node(editor, parent_path)
		if parent == null:
			return _error("parent node not found: %s" % parent_path, "not_found")

	var tree_name := str(body.get("treeName", "AnimationTree")).strip_edges()
	if tree_name.is_empty():
		tree_name = "AnimationTree"

	var child := parent.get_node_or_null(NodePath(tree_name))
	if child is AnimationTree:
		return {
			"ok": true,
			"tree": child,
			"created": false
		}

	var tree := AnimationTree.new()
	tree.name = tree_name
	parent.add_child(tree)
	tree.owner = root
	return {
		"ok": true,
		"tree": tree,
		"created": true
	}


static func _state_position(state: Dictionary, index: int) -> Vector2:
	var position = state.get("position", {})
	if typeof(position) == TYPE_DICTIONARY:
		return Vector2(float(position.get("x", index * 160.0)), float(position.get("y", 0.0)))
	return Vector2(index * 160.0, 0.0)


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
