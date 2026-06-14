@tool
extends RefCounted


static func parse_property_range_hint(hint_string: String) -> Dictionary:
	var parts := hint_string.split(",", false)
	var range_info := {
		"flags": []
	}
	if parts.size() > 0 and parts[0].strip_edges().is_valid_float():
		range_info["min"] = float(parts[0].strip_edges())
	if parts.size() > 1 and parts[1].strip_edges().is_valid_float():
		range_info["max"] = float(parts[1].strip_edges())
	if parts.size() > 2 and parts[2].strip_edges().is_valid_float():
		range_info["step"] = float(parts[2].strip_edges())

	for index in range(3, parts.size()):
		var token := parts[index].strip_edges()
		if token.is_empty():
			continue
		var separator := token.find(":")
		if separator > 0:
			range_info[token.substr(0, separator).strip_edges().to_camel_case()] = token.substr(separator + 1).strip_edges()
		else:
			range_info["flags"].append(token.to_snake_case())

	return range_info


static func parse_property_options_hint(hint_string: String) -> Array:
	var options := []
	var index := 0
	for raw_option in hint_string.split(",", false):
		var text := raw_option.strip_edges()
		if text.is_empty():
			continue
		var label := text
		var value = index
		var separator := text.find(":")
		if separator >= 0:
			label = text.substr(0, separator).strip_edges()
			var raw_value := text.substr(separator + 1).strip_edges()
			if raw_value.is_valid_int():
				value = int(raw_value)
			elif raw_value.is_valid_float():
				value = float(raw_value)
			else:
				value = raw_value
		options.append({
			"label": label,
			"value": value
		})
		index += 1
	return options


static func split_hint_tokens(hint_string: String) -> Array:
	var tokens := []
	for raw_token in hint_string.split(",", false):
		var token := raw_token.strip_edges()
		if not token.is_empty():
			tokens.append(token)
	return tokens
