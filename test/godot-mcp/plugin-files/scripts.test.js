import assert from "node:assert/strict";
import test from "node:test";

import {
  readAddonFile,
  readAddonFileExact,
  readBridgeWriteSurface
} from "../helpers/plugin-files.js";

test("Godot script templates live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const scriptEditorAuthoring = await readAddonFile("niua_mcp_script_editor_authoring_operations.gd");
  const templates = await readAddonFile("niua_mcp_script_templates.gd");

  assert.doesNotMatch(bridge, /preload\("niua_mcp_script_templates\.gd"\)/);
  assert.match(scriptEditorAuthoring, /preload\("niua_mcp_script_templates\.gd"\)/);
  assert.match(scriptEditorAuthoring, /NiuaMcpScriptTemplates\.template_content/);
  assert.doesNotMatch(bridge, /func _script_template_content/);
  assert.doesNotMatch(bridge, /func _validate_script_class_name/);
  assert.doesNotMatch(bridge, /func _is_script_identifier/);
  assert.match(templates, /extends RefCounted/);
  assert.match(templates, /const SCRIPT_TEMPLATES := \["extends_only", "node_lifecycle", "node_process", "tool_node"\]/);
  assert.match(templates, /static func template_content\(base_type: String, template: String, script_class_name: String\) -> Dictionary:/);
  assert.match(templates, /static func validate_class_name\(script_class_name: String\) -> Dictionary:/);
  assert.match(templates, /static func is_script_identifier\(value: String\) -> bool:/);
  assert.match(templates, /class_name %s/);
  assert.match(templates, /func _process\(delta: float\) -> void:/);
});

test("Godot script file operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const scriptFiles = await readAddonFile("niua_mcp_script_file_operations.gd");

  assert.match(bridge, /preload\("niua_mcp_script_file_operations\.gd"\)/);
  assert.match(readRoutes, /NiuaMcpScriptFileOperations\.read_script/);
  assert.match(bridge, /NiuaMcpScriptFileOperations\.write_script/);
  assert.match(bridge, /NiuaMcpScriptFileOperations\.replace_in_scripts/);
  assert.match(readRoutes, /NiuaMcpScriptFileOperations\.validate_script/);
  assert.match(readRoutes, /NiuaMcpScriptFileOperations\.script_symbols/);
  assert.doesNotMatch(bridge, /func _script_paths_for_replace/);
  assert.doesNotMatch(bridge, /func _collect_script_paths/);
  assert.doesNotMatch(bridge, /func _replace_literal/);
  assert.doesNotMatch(bridge, /func _write_script_content/);
  assert.doesNotMatch(bridge, /func _script_resource_summary/);
  assert.match(scriptFiles, /extends RefCounted/);
  assert.match(scriptFiles, /preload\("niua_mcp_script_analysis_operations\.gd"\)/);
  assert.match(scriptFiles, /preload\("niua_mcp_script_file_basic_operations\.gd"\)/);
  assert.match(scriptFiles, /preload\("niua_mcp_script_file_side_effects\.gd"\)/);
  assert.match(scriptFiles, /preload\("niua_mcp_script_replace_operations\.gd"\)/);
  assert.match(scriptFiles, /static func read_script\(query: Dictionary\) -> Dictionary:/);
  assert.match(scriptFiles, /static func write_script\(body: Dictionary\) -> Dictionary:/);
  assert.match(scriptFiles, /static func replace_in_scripts\(body: Dictionary\) -> Dictionary:/);
  assert.match(scriptFiles, /static func validate_script\(query: Dictionary\) -> Dictionary:/);
  assert.match(scriptFiles, /static func script_symbols\(query: Dictionary\) -> Dictionary:/);
  assert.match(scriptFiles, /static func resource_summary\(script\) -> Dictionary:/);
  assert.doesNotMatch(scriptFiles, /maxReplacements/);
  assert.doesNotMatch(scriptFiles, /dryRun/);
  assert.doesNotMatch(scriptFiles, /get_script_method_list/);
  assert.doesNotMatch(scriptFiles, /get_script_property_list/);
  assert.doesNotMatch(scriptFiles, /get_script_signal_list/);
  assert.doesNotMatch(scriptFiles, /get_script_constant_map/);
});

test("Godot script file operations delegate focused domain modules", async () => {
  const facade = await readAddonFile("niua_mcp_script_file_operations.gd");
  const utils = await readAddonFile("niua_mcp_script_file_utils.gd");
  const basic = await readAddonFile("niua_mcp_script_file_basic_operations.gd");
  const replace = await readAddonFileExact("niua_mcp_script_replace_operations.gd");
  const replacePaths = await readAddonFile("niua_mcp_script_replace_paths.gd");
  const replaceLiteral = await readAddonFile("niua_mcp_script_replace_literal.gd");
  const replaceWriter = await readAddonFile("niua_mcp_script_replace_writer.gd");
  const analysis = await readAddonFile("niua_mcp_script_analysis_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_script_file_side_effects.gd");

  assert.match(facade, /preload\("niua_mcp_script_analysis_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_script_file_basic_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_script_file_side_effects\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_script_replace_operations\.gd"\)/);
  assert.match(facade, /NiuaMcpScriptFileBasicOperations\.read_script/);
  assert.match(facade, /NiuaMcpScriptFileBasicOperations\.write_script/);
  assert.match(facade, /NiuaMcpScriptReplaceOperations\.replace_in_scripts/);
  assert.match(facade, /NiuaMcpScriptAnalysisOperations\.validate_script/);
  assert.match(facade, /NiuaMcpScriptAnalysisOperations\.script_symbols/);
  assert.match(facade, /NiuaMcpScriptAnalysisOperations\.resource_summary/);
  assert.match(facade, /NiuaMcpScriptFileSideEffects\.write_script_with_side_effects/);
  assert.match(facade, /NiuaMcpScriptFileSideEffects\.replace_in_scripts_with_side_effects/);
  assert.doesNotMatch(facade, /FileAccess\.open/);
  assert.doesNotMatch(facade, /ResourceLoader\.load/);
  assert.doesNotMatch(facade, /func _remember/);
  assert.doesNotMatch(facade, /func _error/);

  assert.match(utils, /extends RefCounted/);
  assert.match(utils, /static func refresh\(refresh_filesystem: Callable\) -> void:/);
  assert.match(utils, /static func remember\(remember: Callable, message: String\) -> void:/);
  assert.match(utils, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);

  assert.match(basic, /extends RefCounted/);
  assert.match(basic, /preload\("niua_mcp_filesystem_operations\.gd"\)/);
  assert.match(basic, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(basic, /static func read_script\(query: Dictionary\) -> Dictionary:/);
  assert.match(basic, /static func write_script\(body: Dictionary\) -> Dictionary:/);
  assert.match(basic, /NiuaMcpFilesystemOperations\.read_text_file/);
  assert.match(basic, /NiuaMcpFilesystemOperations\.write_text_file/);

  assert.match(replace, /extends RefCounted/);
  assert.match(replace, /preload\("niua_mcp_script_replace_paths\.gd"\)/);
  assert.match(replace, /preload\("niua_mcp_script_replace_literal\.gd"\)/);
  assert.match(replace, /preload\("niua_mcp_script_replace_writer\.gd"\)/);
  assert.match(replace, /preload\("niua_mcp_script_file_utils\.gd"\)/);
  assert.match(replace, /static func replace_in_scripts\(body: Dictionary\) -> Dictionary:/);
  assert.match(replace, /NiuaMcpScriptReplacePaths\.script_paths_for_replace/);
  assert.match(replace, /NiuaMcpScriptReplaceLiteral\.replace_literal/);
  assert.match(replace, /NiuaMcpScriptReplaceWriter\.write_script_content/);
  assert.match(replace, /maxReplacements/);
  assert.match(replace, /dryRun/);
  assert.doesNotMatch(replace, /validate_script_path/);
  assert.doesNotMatch(replace, /DirAccess\.open/);
  assert.doesNotMatch(replace, /join_res_path/);
  assert.doesNotMatch(replace, /haystack\.find/);
  assert.doesNotMatch(replace, /FileAccess\.WRITE/);
  assert.doesNotMatch(replace, /store_string/);

  assert.match(replacePaths, /extends RefCounted/);
  assert.match(replacePaths, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(replacePaths, /preload\("niua_mcp_script_file_utils\.gd"\)/);
  assert.match(replacePaths, /static func script_paths_for_replace\(body: Dictionary, max_files: int\):/);
  assert.match(replacePaths, /static func collect_script_paths\(path: String, collected: Array, max_files: int\) -> void:/);
  assert.match(replacePaths, /validate_script_path/);
  assert.match(replacePaths, /join_res_path/);
  assert.match(replacePaths, /DirAccess\.open/);

  assert.match(replaceLiteral, /extends RefCounted/);
  assert.match(replaceLiteral, /static func replace_literal\(content: String, search: String, replacement: String, case_sensitive: bool\) -> Dictionary:/);
  assert.match(replaceLiteral, /haystack\.find/);
  assert.match(replaceLiteral, /output \+= replacement/);

  assert.match(replaceWriter, /extends RefCounted/);
  assert.match(replaceWriter, /static func write_script_content\(path: String, content: String\) -> int:/);
  assert.match(replaceWriter, /FileAccess\.WRITE/);
  assert.match(replaceWriter, /store_string/);
  assert.match(replaceWriter, /FileAccess\.get_open_error/);

  assert.match(analysis, /extends RefCounted/);
  assert.match(analysis, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(analysis, /preload\("niua_mcp_script_file_utils\.gd"\)/);
  assert.match(analysis, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(analysis, /static func resource_summary\(script\) -> Dictionary:/);
  assert.match(analysis, /static func validate_script\(query: Dictionary\) -> Dictionary:/);
  assert.match(analysis, /static func script_symbols\(query: Dictionary\) -> Dictionary:/);
  assert.match(analysis, /get_script_method_list/);
  assert.match(analysis, /get_script_property_list/);
  assert.match(analysis, /get_script_signal_list/);
  assert.match(analysis, /get_script_constant_map/);

  assert.match(sideEffects, /extends RefCounted/);
  assert.match(sideEffects, /preload\("niua_mcp_script_file_basic_operations\.gd"\)/);
  assert.match(sideEffects, /preload\("niua_mcp_script_file_utils\.gd"\)/);
  assert.match(sideEffects, /preload\("niua_mcp_script_replace_operations\.gd"\)/);
  assert.match(sideEffects, /static func write_script_with_side_effects\(body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /static func replace_in_scripts_with_side_effects\(body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /Wrote text file %s/);
  assert.match(sideEffects, /Script replace %s: %d replacements across %d file\(s\)/);
});

test("Godot script editor operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_script_editor_operations.gd");
  const authoring = await readAddonFile("niua_mcp_script_editor_authoring_operations.gd");
  const navigation = await readAddonFile("niua_mcp_script_editor_navigation_operations.gd");
  const state = await readAddonFile("niua_mcp_script_editor_state_operations.gd");
  const overviewState = await readAddonFile("niua_mcp_script_editor_overview_state.gd");
  const cursorState = await readAddonFile("niua_mcp_script_editor_cursor_state.gd");
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");

  assert.match(bridge, /preload\("niua_mcp_script_editor_operations\.gd"\)/);
  assert.match(bridge, /NiuaMcpScriptEditorOperations\.create_script/);
  assert.match(bridge, /NiuaMcpScriptEditorOperations\.attach_script/);
  assert.match(bridge, /NiuaMcpScriptEditorOperations\.open_script/);
  assert.match(readRoutes, /NiuaMcpScriptEditorOperations\.script_editor_state/);
  assert.match(readRoutes, /NiuaMcpScriptEditorOperations\.script_cursor_state/);
  assert.match(bridge, /NiuaMcpScriptEditorOperations\.goto_script_line/);
  assert.doesNotMatch(bridge, /NiuaMcpScriptTemplates\.template_content/);
  assert.doesNotMatch(bridge, /get_script_editor/);
  assert.doesNotMatch(bridge, /get_base_editor/);
  assert.doesNotMatch(bridge, /edit_script/);
  assert.doesNotMatch(bridge, /set_script/);
  assert.match(operations, /extends RefCounted/);
  assert.match(operations, /preload\("niua_mcp_script_editor_authoring_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_script_editor_navigation_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_script_editor_state_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_script_editor_side_effects\.gd"\)/);
  assert.match(operations, /static func create_script\(body: Dictionary, write_text_file: Callable\) -> Dictionary:/);
  assert.match(operations, /static func attach_script\(editor: EditorInterface, body: Dictionary, resolve_node: Callable, create_script: Callable, save_current_scene: Callable, edited_scene_root: Callable\) -> Dictionary:/);
  assert.match(operations, /static func open_script\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func script_editor_state\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(operations, /static func script_cursor_state\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(operations, /static func goto_script_line\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(authoring, /NiuaMcpScriptTemplates\.template_content/);
  assert.match(authoring, /NiuaMcpPathUtils\.validate_script_path/);
  assert.match(authoring, /ResourceLoader\.load/);
  assert.match(authoring, /GDScript/);
  assert.match(authoring, /set_script/);
  assert.match(navigation, /edit_resource/);
  assert.match(navigation, /edit_script/);
  assert.match(state, /preload\("niua_mcp_script_editor_overview_state\.gd"\)/);
  assert.match(state, /preload\("niua_mcp_script_editor_cursor_state\.gd"\)/);
  assert.doesNotMatch(state, /get_breakpoints/);
  assert.doesNotMatch(state, /get_base_editor/);
  assert.match(overviewState, /NiuaMcpScriptFileOperations\.resource_summary/);
  assert.match(overviewState, /get_script_editor/);
  assert.match(overviewState, /get_current_script/);
  assert.match(overviewState, /get_open_scripts/);
  assert.match(overviewState, /get_breakpoints/);
  assert.match(cursorState, /NiuaMcpScriptFileOperations\.resource_summary/);
  assert.match(cursorState, /get_base_editor/);
  assert.match(cursorState, /get_caret_count/);
  assert.match(cursorState, /get_caret_line/);
  assert.match(cursorState, /get_caret_column/);
  assert.match(cursorState, /get_selection_from_line/);
  assert.match(cursorState, /get_first_visible_line/);
  assert.match(cursorState, /get_last_full_visible_line/);
});

test("Godot script editor operations delegate focused domain modules", async () => {
  const operations = await readAddonFile("niua_mcp_script_editor_operations.gd");
  const authoring = await readAddonFile("niua_mcp_script_editor_authoring_operations.gd");
  const authoringFacade = await readAddonFileExact("niua_mcp_script_editor_authoring_operations.gd");
  const createOperations = await readAddonFile("niua_mcp_script_editor_create_operations.gd");
  const attachOperations = await readAddonFile("niua_mcp_script_editor_attach_operations.gd");
  const authoringUtils = await readAddonFile("niua_mcp_script_editor_authoring_utils.gd");
  const navigation = await readAddonFile("niua_mcp_script_editor_navigation_operations.gd");
  const state = await readAddonFile("niua_mcp_script_editor_state_operations.gd");
  const overviewState = await readAddonFile("niua_mcp_script_editor_overview_state.gd");
  const cursorState = await readAddonFile("niua_mcp_script_editor_cursor_state.gd");
  const sideEffects = await readAddonFile("niua_mcp_script_editor_side_effects.gd");

  assert.match(operations, /preload\("niua_mcp_script_editor_authoring_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_script_editor_navigation_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_script_editor_state_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_script_editor_side_effects\.gd"\)/);
  assert.match(operations, /NiuaMcpScriptEditorAuthoringOperations\.create_script/);
  assert.match(operations, /NiuaMcpScriptEditorNavigationOperations\.open_script/);
  assert.match(operations, /NiuaMcpScriptEditorStateOperations\.script_editor_state/);
  assert.match(operations, /NiuaMcpScriptEditorSideEffects\.create_script_with_side_effects/);
  assert.doesNotMatch(operations, /NiuaMcpScriptTemplates\.template_content/);
  assert.doesNotMatch(operations, /set_script/);
  assert.doesNotMatch(operations, /edit_resource/);
  assert.doesNotMatch(operations, /get_script_editor/);
  assert.doesNotMatch(operations, /get_base_editor/);

  assert.match(authoring, /static func create_script\(body: Dictionary, write_text_file: Callable\) -> Dictionary:/);
  assert.match(authoring, /static func attach_script\(editor: EditorInterface, body: Dictionary, resolve_node: Callable, create_script: Callable, save_current_scene: Callable, edited_scene_root: Callable\) -> Dictionary:/);
  assert.match(authoring, /NiuaMcpScriptTemplates\.template_content/);
  assert.match(authoring, /set_script/);

  assert.match(authoringFacade, /preload\("niua_mcp_script_editor_create_operations\.gd"\)/);
  assert.match(authoringFacade, /preload\("niua_mcp_script_editor_attach_operations\.gd"\)/);
  assert.match(authoringFacade, /static func create_script\(body: Dictionary, write_text_file: Callable\) -> Dictionary:/);
  assert.match(authoringFacade, /static func attach_script\(editor: EditorInterface, body: Dictionary, resolve_node: Callable, create_script: Callable, save_current_scene: Callable, edited_scene_root: Callable\) -> Dictionary:/);
  assert.match(authoringFacade, /NiuaMcpScriptEditorCreateOperations\.create_script/);
  assert.match(authoringFacade, /NiuaMcpScriptEditorAttachOperations\.attach_script/);
  assert.doesNotMatch(authoringFacade, /NiuaMcpScriptTemplates\.template_content/);
  assert.doesNotMatch(authoringFacade, /ResourceLoader\.load/);
  assert.doesNotMatch(authoringFacade, /set_script/);
  assert.doesNotMatch(authoringFacade, /write_text_file\.call/);
  assert.doesNotMatch(authoringFacade, /callback did not return a dictionary/);
  assert.doesNotMatch(authoringFacade, /func _error/);

  assert.match(createOperations, /extends RefCounted/);
  assert.match(createOperations, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(createOperations, /preload\("niua_mcp_script_templates\.gd"\)/);
  assert.match(createOperations, /preload\("niua_mcp_script_editor_authoring_utils\.gd"\)/);
  assert.match(createOperations, /static func create_script\(body: Dictionary, write_text_file: Callable\) -> Dictionary:/);
  assert.match(createOperations, /NiuaMcpPathUtils\.validate_script_path/);
  assert.match(createOperations, /NiuaMcpScriptTemplates\.template_content/);
  assert.match(createOperations, /write_text_file\.call/);
  assert.match(createOperations, /NiuaMcpScriptEditorAuthoringUtils\.callback_dictionary_result/);

  assert.match(attachOperations, /extends RefCounted/);
  assert.match(attachOperations, /preload\("niua_mcp_node_snapshot\.gd"\)/);
  assert.match(attachOperations, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(attachOperations, /preload\("niua_mcp_script_editor_authoring_utils\.gd"\)/);
  assert.match(attachOperations, /static func attach_script\(editor: EditorInterface, body: Dictionary, resolve_node: Callable, create_script: Callable, save_current_scene: Callable, edited_scene_root: Callable\) -> Dictionary:/);
  assert.match(attachOperations, /NiuaMcpNodeSnapshot\.selection_item/);
  assert.match(attachOperations, /NiuaMcpPathUtils\.validate_script_path/);
  assert.match(attachOperations, /<edited scene root>/);
  assert.match(attachOperations, /ResourceLoader\.load/);
  assert.match(attachOperations, /script\.reload/);
  assert.match(attachOperations, /set_script/);
  assert.match(attachOperations, /inspect_object/);
  assert.match(attachOperations, /save_current_scene\.call/);
  assert.match(attachOperations, /create_script\.call/);
  assert.match(attachOperations, /NiuaMcpScriptEditorAuthoringUtils\.callback_dictionary_result/);

  assert.match(authoringUtils, /extends RefCounted/);
  assert.match(authoringUtils, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(authoringUtils, /static func callback_dictionary_result\(raw, callback_name: String\) -> Dictionary:/);
  assert.match(authoringUtils, /callback did not return a dictionary/);
  assert.match(navigation, /static func open_script\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(navigation, /static func goto_script_line\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(navigation, /edit_resource/);
  assert.match(navigation, /edit_script/);
  assert.match(navigation, /var editor_line := requested_line/);
  assert.doesNotMatch(navigation, /requested_line - 1/);
  assert.match(state, /static func script_editor_state\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(state, /static func script_cursor_state\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(state, /NiuaMcpScriptEditorOverviewState\.script_editor_state/);
  assert.match(state, /NiuaMcpScriptEditorCursorState\.script_cursor_state/);
  assert.doesNotMatch(state, /get_script_editor/);
  assert.doesNotMatch(state, /get_base_editor/);
  assert.match(overviewState, /get_script_editor/);
  assert.match(cursorState, /get_base_editor/);
  assert.match(sideEffects, /static func create_script_with_side_effects\(body: Dictionary, write_text_file: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /static func goto_script_line_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /NiuaMcpScriptEditorAuthoringOperations\.create_script/);
  assert.match(sideEffects, /NiuaMcpScriptEditorNavigationOperations\.goto_script_line/);
});

test("Godot script editor state operations delegate overview and cursor modules", async () => {
  const state = await readAddonFile("niua_mcp_script_editor_state_operations.gd");
  const overviewState = await readAddonFile("niua_mcp_script_editor_overview_state.gd");
  const cursorState = await readAddonFile("niua_mcp_script_editor_cursor_state.gd");

  assert.match(state, /preload\("niua_mcp_script_editor_overview_state\.gd"\)/);
  assert.match(state, /preload\("niua_mcp_script_editor_cursor_state\.gd"\)/);
  assert.match(state, /static func script_editor_state\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(state, /static func script_cursor_state\(editor: EditorInterface\) -> Dictionary:/);
  assert.doesNotMatch(state, /get_open_scripts/);
  assert.doesNotMatch(state, /get_breakpoints/);
  assert.doesNotMatch(state, /get_base_editor/);
  assert.doesNotMatch(state, /get_caret_count/);
  assert.doesNotMatch(state, /static func _error/);

  assert.match(overviewState, /static func script_editor_state\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(overviewState, /get_script_editor/);
  assert.match(overviewState, /get_open_scripts/);
  assert.match(overviewState, /get_breakpoints/);
  assert.match(overviewState, /debugger_breakpoint_summary/);
  assert.match(overviewState, /resource_summary/);

  assert.match(cursorState, /static func script_cursor_state\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(cursorState, /get_current_editor/);
  assert.match(cursorState, /get_base_editor/);
  assert.match(cursorState, /get_caret_count/);
  assert.match(cursorState, /get_caret_line/);
  assert.match(cursorState, /get_selection_from_line/);
  assert.match(cursorState, /get_first_visible_line/);
  assert.match(cursorState, /resource_summary/);
});

test("Godot script editor cursor state delegates context and caret modules", async () => {
  const facade = await readAddonFileExact("niua_mcp_script_editor_cursor_state.gd");
  const context = await readAddonFile("niua_mcp_script_editor_cursor_context.gd");
  const caretSnapshot = await readAddonFile("niua_mcp_script_editor_caret_snapshot.gd");

  assert.match(facade, /preload\("niua_mcp_script_editor_cursor_context\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_script_editor_caret_snapshot\.gd"\)/);
  assert.match(facade, /static func script_cursor_state\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(facade, /NiuaMcpScriptEditorCursorContext\.current_script_summary/);
  assert.match(facade, /NiuaMcpScriptEditorCursorContext\.current_editor_base/);
  assert.match(facade, /NiuaMcpScriptEditorCursorContext\.current_editor_summary/);
  assert.match(facade, /NiuaMcpScriptEditorCursorContext\.unavailable_response/);
  assert.match(facade, /NiuaMcpScriptEditorCaretSnapshot\.line_count/);
  assert.match(facade, /NiuaMcpScriptEditorCaretSnapshot\.visible_range/);
  assert.match(facade, /NiuaMcpScriptEditorCaretSnapshot\.carets/);
  assert.doesNotMatch(facade, /resource_summary/);
  assert.doesNotMatch(facade, /get_selection_from_line/);
  assert.doesNotMatch(facade, /get_line\(line\)/);
  assert.doesNotMatch(facade, /static func _error/);

  assert.match(context, /extends RefCounted/);
  assert.match(context, /preload\("niua_mcp_script_file_operations\.gd"\)/);
  assert.match(context, /static func current_script_summary\(script_editor\):/);
  assert.match(context, /static func current_editor_base\(script_editor\):/);
  assert.match(context, /static func current_editor_summary\(editor_base\):/);
  assert.match(context, /static func unavailable_response\(available: bool, reason: String, current_script = null, current_editor = null\) -> Dictionary:/);
  assert.match(context, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(context, /get_current_script/);
  assert.match(context, /get_current_editor/);
  assert.match(context, /NiuaMcpScriptFileOperations\.resource_summary/);

  assert.match(caretSnapshot, /extends RefCounted/);
  assert.match(caretSnapshot, /static func line_count\(base_editor\) -> int:/);
  assert.match(caretSnapshot, /static func visible_range\(base_editor\):/);
  assert.match(caretSnapshot, /static func carets\(base_editor, line_count: int\) -> Array:/);
  assert.match(caretSnapshot, /static func selection_for_caret\(base_editor, caret_index: int, has_selection: bool\):/);
  assert.match(caretSnapshot, /get_caret_count/);
  assert.match(caretSnapshot, /get_caret_line/);
  assert.match(caretSnapshot, /get_selection_from_line/);
  assert.match(caretSnapshot, /get_first_visible_line/);
  assert.match(caretSnapshot, /get_line\(line\)/);
});

test("Godot script bridge side effects live in script operations", async () => {
  const bridge = await readBridgeWriteSurface();
  const scriptFiles = await readAddonFile("niua_mcp_script_file_operations.gd");
  const scriptFileSideEffects = await readAddonFile("niua_mcp_script_file_side_effects.gd");
  const scriptEditorOperations = await readAddonFile("niua_mcp_script_editor_operations.gd");
  const scriptEditorSideEffects = await readAddonFile("niua_mcp_script_editor_side_effects.gd");

  assert.match(scriptFiles, /static func write_script_with_side_effects\(body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(scriptFiles, /static func replace_in_scripts_with_side_effects\(body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(scriptEditorOperations, /static func create_script_with_side_effects\(body: Dictionary, write_text_file: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(scriptEditorOperations, /static func attach_script_with_side_effects\(editor: EditorInterface, body: Dictionary, resolve_node: Callable, create_script: Callable, save_current_scene: Callable, edited_scene_root: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(scriptEditorOperations, /static func open_script_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(scriptEditorOperations, /static func goto_script_line_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(scriptEditorSideEffects, /Created script %s/);
  assert.match(scriptEditorSideEffects, /Attached script %s to %s/);
  assert.match(scriptEditorSideEffects, /Opened script %s/);
  assert.match(scriptFileSideEffects, /Wrote text file %s/);
  assert.match(scriptFileSideEffects, /Script replace %s: %d replacements across %d file\(s\)/);
  assert.doesNotMatch(scriptFiles, /Wrote text file %s/);
  assert.doesNotMatch(scriptFiles, /Script replace %s:/);
  assert.match(bridge, /NiuaMcpScriptFileOperations\.write_script_with_side_effects/);
  assert.match(bridge, /NiuaMcpScriptFileOperations\.replace_in_scripts_with_side_effects/);
  assert.match(bridge, /NiuaMcpScriptEditorOperations\.create_script_with_side_effects/);
  assert.match(bridge, /NiuaMcpScriptEditorOperations\.attach_script_with_side_effects/);
  assert.match(bridge, /NiuaMcpScriptEditorOperations\.open_script_with_side_effects/);
  assert.match(bridge, /NiuaMcpScriptEditorOperations\.goto_script_line_with_side_effects/);
  assert.doesNotMatch(bridge, /Script replace %s:/);
  assert.doesNotMatch(bridge, /Created script %s/);
  assert.doesNotMatch(bridge, /Attached script %s to %s/);
  assert.doesNotMatch(bridge, /Opened script %s/);
});
