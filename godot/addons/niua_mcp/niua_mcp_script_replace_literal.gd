@tool
extends RefCounted


static func replace_literal(content: String, search: String, replacement: String, case_sensitive: bool) -> Dictionary:
	var haystack := content if case_sensitive else content.to_lower()
	var needle := search if case_sensitive else search.to_lower()
	var output := ""
	var index := 0
	var count := 0
	var found := haystack.find(needle, index)
	while found != -1:
		output += content.substr(index, found - index)
		output += replacement
		index = found + search.length()
		count += 1
		found = haystack.find(needle, index)
	output += content.substr(index)
	return { "count": count, "content": output }
