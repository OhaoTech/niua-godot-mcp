@tool
extends RefCounted


static func line_count(base_editor) -> int:
	if base_editor.has_method("get_line_count"):
		return int(base_editor.get_line_count())
	return -1


static func visible_range(base_editor):
	if not base_editor.has_method("get_first_visible_line") or not base_editor.has_method("get_last_full_visible_line"):
		return null

	var first_line := int(base_editor.get_first_visible_line())
	var last_line := int(base_editor.get_last_full_visible_line())
	return {
		"firstLine": first_line,
		"firstLineOneBased": first_line + 1,
		"lastFullLine": last_line,
		"lastFullLineOneBased": last_line + 1
	}


static func carets(base_editor, line_count: int) -> Array:
	var items := []
	var caret_count := int(base_editor.get_caret_count())
	for caret_index in range(caret_count):
		var line := int(base_editor.get_caret_line(caret_index))
		var column := int(base_editor.get_caret_column(caret_index))
		var has_selection := false
		if base_editor.has_method("has_selection"):
			has_selection = bool(base_editor.has_selection(caret_index))

		items.append({
			"index": caret_index,
			"line": line,
			"lineOneBased": line + 1,
			"column": column,
			"hasSelection": has_selection,
			"selection": selection_for_caret(base_editor, caret_index, has_selection),
			"lineText": line_text(base_editor, line, line_count)
		})
	return items


static func selection_for_caret(base_editor, caret_index: int, has_selection: bool):
	if not has_selection:
		return null
	if not base_editor.has_method("get_selection_from_line") or not base_editor.has_method("get_selection_from_column") or not base_editor.has_method("get_selection_to_line") or not base_editor.has_method("get_selection_to_column"):
		return null

	var from_line := int(base_editor.get_selection_from_line(caret_index))
	var to_line := int(base_editor.get_selection_to_line(caret_index))
	return {
		"fromLine": from_line,
		"fromLineOneBased": from_line + 1,
		"fromColumn": int(base_editor.get_selection_from_column(caret_index)),
		"toLine": to_line,
		"toLineOneBased": to_line + 1,
		"toColumn": int(base_editor.get_selection_to_column(caret_index))
	}


static func line_text(base_editor, line: int, line_count: int):
	if base_editor.has_method("get_line") and line >= 0 and (line_count < 0 or line < line_count):
		return str(base_editor.get_line(line))
	return null
