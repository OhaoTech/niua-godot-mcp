@tool
extends RefCounted


static func search_node_types(query: Dictionary) -> Dictionary:
	var search_text := str(query.get("query", "")).strip_edges().to_lower()
	var base_type := str(query.get("baseType", "Node")).strip_edges()
	if base_type.is_empty():
		base_type = "Node"
	if not ClassDB.class_exists(base_type):
		return _error("unknown Godot base class: %s" % base_type, "not_found")

	var include_abstract := str(query.get("includeAbstract", "false")).to_lower() == "true"
	var include_disabled := str(query.get("includeDisabled", "false")).to_lower() == "true"
	var limit := int(query.get("limit", "50"))
	limit = clamp(limit, 1, 500)

	var classes: Array = Array(ClassDB.get_class_list())
	classes.sort()

	var matches: Array = []
	var total := 0
	for class_value in classes:
		var type_name := str(class_value)
		var inherits_base := type_name == base_type or ClassDB.is_parent_class(type_name, base_type)
		if not inherits_base:
			continue

		var can_instantiate := ClassDB.can_instantiate(type_name)
		var enabled := true
		if ClassDB.has_method("is_class_enabled"):
			enabled = bool(ClassDB.is_class_enabled(type_name))
		if not include_disabled and not enabled:
			continue

		if not include_abstract and not can_instantiate:
			continue

		if not search_text.is_empty() and type_name.to_lower().find(search_text) == -1:
			continue

		total += 1
		if matches.size() >= limit:
			continue

		var inheritance_chain := class_inheritance_chain(type_name, base_type)
		matches.append({
			"name": type_name,
			"parentClass": ClassDB.get_parent_class(type_name),
			"canInstantiate": can_instantiate,
			"enabled": enabled,
			"inheritsBase": inherits_base,
			"isBaseType": type_name == base_type,
			"inheritanceDepth": max(inheritance_chain.size() - 1, 0),
			"inheritanceChain": inheritance_chain
		})

	return {
		"ok": true,
		"data": {
			"query": search_text,
			"baseType": base_type,
			"includeAbstract": include_abstract,
			"includeDisabled": include_disabled,
			"limit": limit,
			"total": total,
			"matches": matches
		}
	}


static func class_inheritance_chain(type_name: String, stop_type: String = "") -> Array:
	var chain := []
	var current := type_name
	while not current.is_empty() and ClassDB.class_exists(current):
		chain.append(current)
		if not stop_type.is_empty() and current == stop_type:
			break
		current = ClassDB.get_parent_class(current)
	return chain


static func _error(message: String, code: String = "bad_request") -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"errorCode": code
	}
