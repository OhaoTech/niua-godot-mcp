import assert from "node:assert/strict";
import test from "node:test";

import {
  readAddonFile,
  readAddonFileExact,
  readBridgeWriteSurface
} from "../helpers/plugin-files.js";

test("Godot editor state operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_editor_state_operations.gd");
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");

  assert.match(readRoutes, /preload\("niua_mcp_editor_state_operations\.gd"\)/);
  assert.match(readRoutes, /NiuaMcpEditorStateOperations\.health/);
  assert.match(readRoutes, /NiuaMcpEditorStateOperations\.project_info/);
  assert.match(readRoutes, /NiuaMcpEditorStateOperations\.editor_state/);
  assert.match(readRoutes, /NiuaMcpEditorStateOperations\.scene_tree/);
  assert.doesNotMatch(bridge, /ProjectSettings\.globalize_path\("res:\/\/"\)/);
  assert.doesNotMatch(bridge, /Engine\.get_version_info/);
  assert.doesNotMatch(bridge, /NiuaMcpNodeSnapshot\.serialize_node/);
  assert.match(operations, /extends RefCounted/);
  assert.match(operations, /preload\("niua_mcp_node_snapshot\.gd"\)/);
  assert.match(operations, /static func health\(running: bool, host: String, port: int, read_endpoints: Array, write_endpoints: Array\) -> Dictionary:/);
  assert.match(operations, /static func project_info\(\) -> Dictionary:/);
  assert.match(operations, /static func editor_state\(current_scene: String, open_scenes: Array, main_screen: Dictionary, selection: Array, logs: Array\) -> Dictionary:/);
  assert.match(operations, /static func scene_tree\(current_scene: String, root: Node\) -> Dictionary:/);
  assert.match(operations, /ProjectSettings\.globalize_path\("res:\/\/"\)/);
  assert.match(operations, /ProjectSettings\.get_setting/);
  assert.match(operations, /Engine\.get_version_info/);
  assert.match(operations, /NiuaMcpNodeSnapshot\.serialize_node/);
});

test("Godot Inspector editor metadata lives in its own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const metadata = await readAddonFileExact("niua_mcp_inspector_metadata.gd");
  const builder = await readAddonFile("niua_mcp_inspector_metadata_builder.gd");
  const control = await readAddonFile("niua_mcp_inspector_metadata_control.gd");
  const hintParser = await readAddonFile("niua_mcp_inspector_metadata_hint_parser.gd");
  const fileMode = await readAddonFile("niua_mcp_inspector_metadata_file_mode.gd");
  const sceneInspectorOperations = await readAddonFile("niua_mcp_scene_inspector_operations.gd");

  assert.doesNotMatch(bridge, /preload\("niua_mcp_inspector_metadata\.gd"\)/);
  assert.match(sceneInspectorOperations, /preload\("niua_mcp_inspector_metadata\.gd"\)/);
  assert.match(sceneInspectorOperations, /NiuaMcpInspectorMetadata\.property_editor_metadata/);
  assert.doesNotMatch(bridge, /func _property_editor_metadata/);
  assert.doesNotMatch(bridge, /func _property_editor_control/);
  assert.doesNotMatch(bridge, /func _parse_property_range_hint/);
  assert.doesNotMatch(bridge, /func _parse_property_options_hint/);
  assert.match(metadata, /extends RefCounted/);
  assert.match(metadata, /preload\("niua_mcp_inspector_metadata_builder\.gd"\)/);
  assert.match(metadata, /preload\("niua_mcp_inspector_metadata_control\.gd"\)/);
  assert.match(metadata, /preload\("niua_mcp_inspector_metadata_hint_parser\.gd"\)/);
  assert.match(metadata, /preload\("niua_mcp_inspector_metadata_file_mode\.gd"\)/);
  assert.match(metadata, /static func property_editor_metadata\(property: Dictionary, section_kind: String\) -> Dictionary:/);
  assert.match(metadata, /static func property_editor_control\(declared_type: int, hint: int, section_kind: String\) -> String:/);
  assert.match(metadata, /static func parse_property_range_hint\(hint_string: String\) -> Dictionary:/);
  assert.match(metadata, /static func parse_property_options_hint\(hint_string: String\) -> Array:/);
  assert.match(metadata, /static func property_file_mode\(hint: int\) -> String:/);
  assert.match(metadata, /static func split_hint_tokens\(hint_string: String\) -> Array:/);
  assert.match(metadata, /NiuaMcpInspectorMetadataBuilder\.property_editor_metadata/);
  assert.match(metadata, /NiuaMcpInspectorMetadataControl\.property_editor_control/);
  assert.match(metadata, /NiuaMcpInspectorMetadataHintParser\.parse_property_range_hint/);
  assert.match(metadata, /NiuaMcpInspectorMetadataHintParser\.parse_property_options_hint/);
  assert.match(metadata, /NiuaMcpInspectorMetadataFileMode\.property_file_mode/);
  assert.match(metadata, /NiuaMcpInspectorMetadataHintParser\.split_hint_tokens/);
  assert.doesNotMatch(metadata, /PROPERTY_HINT_RANGE/);
  assert.doesNotMatch(metadata, /PROPERTY_HINT_ENUM/);
  assert.doesNotMatch(metadata, /PROPERTY_HINT_FLAGS/);
  assert.doesNotMatch(metadata, /PROPERTY_HINT_RESOURCE_TYPE/);
  assert.doesNotMatch(metadata, /PROPERTY_HINT_NODE_PATH_VALID_TYPES/);
  assert.doesNotMatch(metadata, /TYPE_VECTOR2/);
  assert.doesNotMatch(metadata, /to_camel_case/);
  assert.doesNotMatch(metadata, /to_snake_case/);

  assert.match(builder, /extends RefCounted/);
  assert.match(builder, /preload\("niua_mcp_inspector_metadata_control\.gd"\)/);
  assert.match(builder, /preload\("niua_mcp_inspector_metadata_hint_parser\.gd"\)/);
  assert.match(builder, /preload\("niua_mcp_inspector_metadata_file_mode\.gd"\)/);
  assert.match(builder, /static func property_editor_metadata\(property: Dictionary, section_kind: String\) -> Dictionary:/);
  assert.match(builder, /NiuaMcpInspectorMetadataControl\.property_editor_control/);
  assert.match(builder, /NiuaMcpInspectorMetadataHintParser\.parse_property_range_hint/);
  assert.match(builder, /NiuaMcpInspectorMetadataHintParser\.parse_property_options_hint/);
  assert.match(builder, /NiuaMcpInspectorMetadataHintParser\.split_hint_tokens/);
  assert.match(builder, /NiuaMcpInspectorMetadataFileMode\.property_file_mode/);

  assert.match(control, /extends RefCounted/);
  assert.match(control, /static func property_editor_control\(declared_type: int, hint: int, section_kind: String\) -> String:/);
  assert.match(control, /PROPERTY_HINT_RANGE/);
  assert.match(control, /PROPERTY_HINT_ENUM/);
  assert.match(control, /PROPERTY_HINT_FLAGS/);
  assert.match(control, /PROPERTY_HINT_RESOURCE_TYPE/);
  assert.match(control, /PROPERTY_HINT_NODE_PATH_VALID_TYPES/);
  assert.match(control, /TYPE_VECTOR2/);
  assert.match(control, /node_path_picker/);
  assert.match(control, /resource_picker/);
  assert.match(control, /collection/);

  assert.match(hintParser, /extends RefCounted/);
  assert.match(hintParser, /static func parse_property_range_hint\(hint_string: String\) -> Dictionary:/);
  assert.match(hintParser, /static func parse_property_options_hint\(hint_string: String\) -> Array:/);
  assert.match(hintParser, /static func split_hint_tokens\(hint_string: String\) -> Array:/);
  assert.match(hintParser, /to_camel_case/);
  assert.match(hintParser, /to_snake_case/);

  assert.match(fileMode, /extends RefCounted/);
  assert.match(fileMode, /static func property_file_mode\(hint: int\) -> String:/);
  assert.match(fileMode, /PROPERTY_HINT_FILE/);
  assert.match(fileMode, /PROPERTY_HINT_GLOBAL_DIR/);
  assert.match(fileMode, /project_file_open/);
  assert.match(fileMode, /global_directory/);
});

test("Godot InputEvent JSON conversion lives in its own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const codec = await readAddonFile("niua_mcp_input_event_codec.gd");
  const writer = await readAddonFile("niua_mcp_input_event_json_writer.gd");
  const writerShared = await readAddonFile("niua_mcp_input_event_json_writer_shared.gd");
  const writerKeyboardAction = await readAddonFile("niua_mcp_input_event_json_writer_keyboard_action.gd");
  const writerPointer = await readAddonFile("niua_mcp_input_event_json_writer_pointer.gd");
  const writerDevice = await readAddonFile("niua_mcp_input_event_json_writer_device.gd");
  const reader = await readAddonFile("niua_mcp_input_event_json_reader.gd");
  const projectSettingsOperations = await readAddonFile("niua_mcp_project_settings_operations.gd");
  const viewportInputOperations = await readAddonFile("niua_mcp_viewport_input_operations.gd");

  assert.doesNotMatch(bridge, /preload\("niua_mcp_input_event_codec\.gd"\)/);
  assert.match(projectSettingsOperations, /preload\("niua_mcp_input_event_codec\.gd"\)/);
  assert.match(projectSettingsOperations, /NiuaMcpInputEventCodec\.events_to_json/);
  assert.match(projectSettingsOperations, /NiuaMcpInputEventCodec\.event_to_json/);
  assert.match(projectSettingsOperations, /NiuaMcpInputEventCodec\.event_from_json/);
  assert.match(viewportInputOperations, /preload\("niua_mcp_input_event_codec\.gd"\)/);
  assert.match(viewportInputOperations, /NiuaMcpInputEventCodec\.event_from_json/);
  assert.doesNotMatch(bridge, /func _input_events_to_json/);
  assert.doesNotMatch(bridge, /func _input_event_to_json/);
  assert.doesNotMatch(bridge, /func _input_event_from_json/);
  assert.match(codec, /extends RefCounted/);
  assert.match(codec, /preload\("niua_mcp_input_event_json_writer\.gd"\)/);
  assert.match(codec, /preload\("niua_mcp_input_event_json_reader\.gd"\)/);
  assert.match(codec, /static func events_to_json\(events: Array\) -> Array:/);
  assert.match(codec, /static func event_to_json\(event: InputEvent\) -> Dictionary:/);
  assert.match(codec, /static func event_from_json\(spec\) -> InputEvent:/);
  assert.match(codec, /NiuaMcpInputEventJsonWriter\.events_to_json/);
  assert.match(codec, /NiuaMcpInputEventJsonWriter\.event_to_json/);
  assert.match(codec, /NiuaMcpInputEventJsonReader\.event_from_json/);
  assert.doesNotMatch(codec, /InputEventMouseButton/);
  assert.doesNotMatch(codec, /InputEventMouseMotion/);
  assert.doesNotMatch(codec, /InputEventKey/);
  assert.doesNotMatch(codec, /InputEventJoypadButton/);
  assert.doesNotMatch(codec, /InputEventJoypadMotion/);

  assert.match(writer, /extends RefCounted/);
  assert.match(writer, /preload\("niua_mcp_input_event_json_writer_shared\.gd"\)/);
  assert.match(writer, /preload\("niua_mcp_input_event_json_writer_keyboard_action\.gd"\)/);
  assert.match(writer, /preload\("niua_mcp_input_event_json_writer_pointer\.gd"\)/);
  assert.match(writer, /preload\("niua_mcp_input_event_json_writer_device\.gd"\)/);
  assert.match(writer, /static func events_to_json\(events: Array\) -> Array:/);
  assert.match(writer, /static func event_to_json\(event: InputEvent\) -> Dictionary:/);
  assert.match(writer, /NiuaMcpInputEventJsonWriterKeyboardAction\.key_event_to_json/);
  assert.match(writer, /NiuaMcpInputEventJsonWriterKeyboardAction\.action_event_to_json/);
  assert.match(writer, /NiuaMcpInputEventJsonWriterPointer\.mouse_button_event_to_json/);
  assert.match(writer, /NiuaMcpInputEventJsonWriterPointer\.mouse_motion_event_to_json/);
  assert.match(writer, /NiuaMcpInputEventJsonWriterPointer\.screen_touch_event_to_json/);
  assert.match(writer, /NiuaMcpInputEventJsonWriterPointer\.screen_drag_event_to_json/);
  assert.match(writer, /NiuaMcpInputEventJsonWriterDevice\.joypad_button_event_to_json/);
  assert.match(writer, /NiuaMcpInputEventJsonWriterDevice\.joypad_motion_event_to_json/);
  assert.match(writer, /NiuaMcpInputEventJsonWriterDevice\.midi_event_to_json/);
  assert.match(writer, /NiuaMcpInputEventJsonWriterShared\.base_input_event_json/);
  assert.doesNotMatch(writer, /keycode/);
  assert.doesNotMatch(writer, /screen_relative/);
  assert.doesNotMatch(writer, /controller_number/);
  assert.doesNotMatch(writer, /static func vector2_to_json/);

  assert.match(writerShared, /extends RefCounted/);
  assert.match(writerShared, /static func base_input_event_json\(event: InputEvent, kind: String, assignable_to_input_map: bool\) -> Dictionary:/);
  assert.match(writerShared, /static func merge_input_event_json\(target: Dictionary, values: Dictionary\) -> void:/);
  assert.match(writerShared, /static func input_event_window_json\(event: InputEventFromWindow\) -> Dictionary:/);
  assert.match(writerShared, /static func input_event_modifier_json\(event: InputEventWithModifiers\) -> Dictionary:/);
  assert.match(writerShared, /static func input_event_mouse_json\(event: InputEventMouse\) -> Dictionary:/);
  assert.match(writerShared, /static func vector2_to_json\(value: Vector2\) -> Dictionary:/);

  assert.match(writerKeyboardAction, /extends RefCounted/);
  assert.match(writerKeyboardAction, /static func key_event_to_json\(event: InputEventKey\) -> Dictionary:/);
  assert.match(writerKeyboardAction, /static func action_event_to_json\(event: InputEventAction\) -> Dictionary:/);
  assert.match(writerKeyboardAction, /keycode/);
  assert.match(writerKeyboardAction, /event_index/);
  assert.match(writerKeyboardAction, /NiuaMcpInputEventJsonWriterShared\.input_event_modifier_json/);

  assert.match(writerPointer, /extends RefCounted/);
  assert.match(writerPointer, /static func mouse_button_event_to_json\(event: InputEventMouseButton\) -> Dictionary:/);
  assert.match(writerPointer, /static func mouse_motion_event_to_json\(event: InputEventMouseMotion\) -> Dictionary:/);
  assert.match(writerPointer, /static func screen_touch_event_to_json\(event: InputEventScreenTouch\) -> Dictionary:/);
  assert.match(writerPointer, /static func screen_drag_event_to_json\(event: InputEventScreenDrag\) -> Dictionary:/);
  assert.match(writer, /InputEventMouseButton/);
  assert.match(writer, /InputEventMouseMotion/);
  assert.match(writer, /InputEventKey/);
  assert.match(writer, /InputEventJoypadButton/);
  assert.match(writer, /InputEventJoypadMotion/);
  assert.match(writerPointer, /InputEventScreenTouch/);
  assert.match(writerPointer, /InputEventScreenDrag/);
  assert.match(writerPointer, /screen_relative/);
  assert.match(writerPointer, /double_tap/);
  assert.match(writerPointer, /NiuaMcpInputEventJsonWriterShared\.input_event_mouse_json/);
  assert.match(writerPointer, /NiuaMcpInputEventJsonWriterShared\.vector2_to_json/);

  assert.match(writerDevice, /extends RefCounted/);
  assert.match(writerDevice, /static func joypad_button_event_to_json\(event: InputEventJoypadButton\) -> Dictionary:/);
  assert.match(writerDevice, /static func joypad_motion_event_to_json\(event: InputEventJoypadMotion\) -> Dictionary:/);
  assert.match(writerDevice, /static func midi_event_to_json\(event: InputEventMIDI\) -> Dictionary:/);
  assert.match(writerDevice, /axis_value/);
  assert.match(writerDevice, /controller_number/);

  assert.match(reader, /extends RefCounted/);
  assert.match(reader, /static func event_from_json\(spec\) -> InputEvent:/);
  assert.match(reader, /InputEventKey\.new\(\)/);
  assert.match(reader, /InputEventAction\.new\(\)/);
  assert.match(reader, /InputEventMouseButton\.new\(\)/);
  assert.match(reader, /InputEventMouseMotion\.new\(\)/);
  assert.match(reader, /InputEventJoypadButton\.new\(\)/);
  assert.match(reader, /InputEventJoypadMotion\.new\(\)/);
  assert.match(reader, /static func json_vector2\(value\) -> Vector2:/);
});

test("Godot property usage metadata lives in its own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const metadata = await readAddonFile("niua_mcp_property_metadata.gd");
  const sceneInspectorOperations = await readAddonFile("niua_mcp_scene_inspector_operations.gd");

  assert.doesNotMatch(bridge, /preload\("niua_mcp_property_metadata\.gd"\)/);
  assert.match(sceneInspectorOperations, /preload\("niua_mcp_property_metadata\.gd"\)/);
  assert.match(sceneInspectorOperations, /NiuaMcpPropertyMetadata\.usage_flags/);
  assert.doesNotMatch(bridge, /func _property_usage_flags/);
  assert.match(metadata, /extends RefCounted/);
  assert.match(metadata, /static func usage_flags\(usage: int\) -> Array:/);
  assert.match(metadata, /PROPERTY_USAGE_EDITOR/);
  assert.match(metadata, /PROPERTY_USAGE_CATEGORY/);
  assert.match(metadata, /PROPERTY_USAGE_READ_ONLY/);
});

test("Godot editor actions live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const editorActions = await readAddonFileExact("niua_mcp_editor_actions.gd");
  const actionCatalog = await readAddonFile("niua_mcp_editor_action_catalog.gd");
  const actionDispatch = await readAddonFile("niua_mcp_editor_action_dispatch.gd");

  assert.match(bridge, /preload\("niua_mcp_editor_actions\.gd"\)/);
  assert.match(bridge, /NiuaMcpEditorActions\.invoke/);
  assert.doesNotMatch(bridge, /const ALLOWED_EDITOR_ACTIONS/);
  assert.doesNotMatch(bridge, /func _dispatch_editor_action/);
  assert.doesNotMatch(bridge, /func _editor_action_set_distraction_free_mode/);
  assert.doesNotMatch(bridge, /func _editor_action_select_file/);
  assert.match(editorActions, /extends RefCounted/);
  assert.match(editorActions, /preload\("niua_mcp_editor_action_catalog\.gd"\)/);
  assert.match(editorActions, /preload\("niua_mcp_editor_action_dispatch\.gd"\)/);
  assert.match(editorActions, /static func invoke\(editor: EditorInterface, action: String, raw_params\) -> Dictionary:/);
  assert.match(editorActions, /static func allowed_actions\(\) -> Array:/);
  assert.match(editorActions, /NiuaMcpEditorActionCatalog\.has_action/);
  assert.match(editorActions, /NiuaMcpEditorActionCatalog\.allowed_actions/);
  assert.match(editorActions, /NiuaMcpEditorActionDispatch\.dispatch/);
  assert.doesNotMatch(editorActions, /const ALLOWED_EDITOR_ACTIONS :=/);
  assert.doesNotMatch(editorActions, /static func _dispatch/);
  assert.doesNotMatch(editorActions, /static func _filesystem_scan/);
  assert.doesNotMatch(editorActions, /static func _reload_scene_from_path/);
  assert.doesNotMatch(editorActions, /static func _set_distraction_free_mode/);
  assert.match(actionCatalog, /const ALLOWED_EDITOR_ACTIONS :=/);
  assert.match(actionDispatch, /static func dispatch\(editor: EditorInterface, action: String, params: Dictionary\) -> Dictionary:/);
});

test("Godot editor action domains live in focused Godot modules", async () => {
  const actionCatalog = await readAddonFile("niua_mcp_editor_action_catalog.gd");
  const actionDispatch = await readAddonFile("niua_mcp_editor_action_dispatch.gd");
  const actionUtils = await readAddonFile("niua_mcp_editor_action_utils.gd");
  const actionUi = await readAddonFile("niua_mcp_editor_action_ui.gd");
  const actionFilesystem = await readAddonFile("niua_mcp_editor_action_filesystem.gd");
  const actionScene = await readAddonFile("niua_mcp_editor_action_scene.gd");

  assert.match(actionCatalog, /extends RefCounted/);
  assert.match(actionCatalog, /const ALLOWED_EDITOR_ACTIONS :=/);
  assert.match(actionCatalog, /static func has_action\(action: String\) -> bool:/);
  assert.match(actionCatalog, /static func allowed_actions\(\) -> Array:/);
  assert.match(actionCatalog, /set_distraction_free_mode/);
  assert.match(actionCatalog, /select_file/);
  assert.match(actionCatalog, /scan_sources/);
  assert.match(actionCatalog, /update_file/);
  assert.match(actionCatalog, /reload_scene_from_path/);
  assert.match(actionCatalog, /set_movie_maker_enabled/);

  assert.match(actionDispatch, /extends RefCounted/);
  assert.match(actionDispatch, /preload\("niua_mcp_editor_action_ui\.gd"\)/);
  assert.match(actionDispatch, /preload\("niua_mcp_editor_action_filesystem\.gd"\)/);
  assert.match(actionDispatch, /preload\("niua_mcp_editor_action_scene\.gd"\)/);
  assert.match(actionDispatch, /static func dispatch\(editor: EditorInterface, action: String, params: Dictionary\) -> Dictionary:/);
  assert.match(actionDispatch, /NiuaMcpEditorActionUi\.set_distraction_free_mode/);
  assert.match(actionDispatch, /NiuaMcpEditorActionFilesystem\.filesystem_scan_sources/);
  assert.match(actionDispatch, /NiuaMcpEditorActionScene\.reload_scene_from_path/);

  assert.match(actionUtils, /extends RefCounted/);
  assert.match(actionUtils, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(actionUtils, /static func require_editor_method\(editor: EditorInterface, method_name: String\) -> Dictionary:/);
  assert.match(actionUtils, /static func action_res_path\(params: Dictionary, key: String\) -> Dictionary:/);
  assert.match(actionUtils, /static func action_scene_path\(params: Dictionary, key: String\) -> Dictionary:/);
  assert.match(actionUtils, /static func action_data\(params: Dictionary\) -> Dictionary:/);
  assert.match(actionUtils, /static func remember\(remember: Callable, message: String\) -> void:/);
  assert.match(actionUtils, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);

  assert.match(actionUi, /static func set_distraction_free_mode\(editor: EditorInterface, params: Dictionary\) -> Dictionary:/);
  assert.match(actionUi, /static func set_movie_maker_enabled\(editor: EditorInterface, params: Dictionary\) -> Dictionary:/);
  assert.match(actionFilesystem, /static func select_file\(editor: EditorInterface, params: Dictionary\) -> Dictionary:/);
  assert.match(actionFilesystem, /static func filesystem_scan\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(actionFilesystem, /static func filesystem_scan_sources\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(actionFilesystem, /static func filesystem_update_file\(editor: EditorInterface, params: Dictionary\) -> Dictionary:/);
  assert.match(actionScene, /static func reload_scene_from_path\(editor: EditorInterface, params: Dictionary\) -> Dictionary:/);
  assert.match(actionScene, /static func save_scene\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(actionScene, /static func save_all_scenes\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(actionScene, /static func mark_scene_as_unsaved\(editor: EditorInterface\) -> Dictionary:/);
});

test("Godot editor action bridge side effects live in editor actions", async () => {
  const bridge = await readBridgeWriteSurface();
  const editorActions = await readAddonFile("niua_mcp_editor_actions.gd");

  assert.match(editorActions, /static func invoke_with_side_effects\(editor: EditorInterface, action: String, raw_params, remember: Callable\) -> Dictionary:/);
  assert.match(bridge, /NiuaMcpEditorActions\.invoke_with_side_effects/);
  assert.doesNotMatch(bridge, /Invoked editor action %s/);
});

test("Godot editor surface operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_editor_surface_operations.gd");
  const screenshots = await readAddonFile("niua_mcp_editor_surface_screenshot_operations.gd");
  const mainScreen = await readAddonFile("niua_mcp_editor_surface_main_screen_operations.gd");
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");

  assert.match(bridge, /preload\("niua_mcp_editor_surface_operations\.gd"\)/);
  assert.match(readRoutes, /NiuaMcpEditorSurfaceOperations\.capture_editor_screenshot/);
  assert.match(readRoutes, /NiuaMcpEditorSurfaceOperations\.main_screen_state/);
  assert.match(bridge, /NiuaMcpEditorSurfaceOperations\.set_main_screen/);
  assert.doesNotMatch(bridge, /const EDITOR_MAIN_SCREENS/);
  assert.doesNotMatch(bridge, /func _editor_screenshot_unavailable/);
  assert.doesNotMatch(bridge, /func _normalize_editor_main_screen/);
  assert.doesNotMatch(bridge, /get_base_control/);
  assert.doesNotMatch(bridge, /set_main_screen_editor/);
  assert.match(operations, /extends RefCounted/);
  assert.match(operations, /preload\("niua_mcp_editor_surface_screenshot_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_editor_surface_main_screen_operations\.gd"\)/);
  assert.match(operations, /static func capture_editor_screenshot\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(operations, /static func main_screen_state\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(operations, /static func set_main_screen\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(operations, /const EDITOR_MAIN_SCREENS/);
  assert.doesNotMatch(operations, /get_base_control/);
  assert.doesNotMatch(operations, /DisplayServer\.get_name/);
  assert.doesNotMatch(operations, /get_editor_main_screen/);
  assert.doesNotMatch(operations, /set_main_screen_editor/);

  assert.match(screenshots, /static func capture_editor_screenshot\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(screenshots, /static func _editor_screenshot_unavailable\(reason: String\) -> Dictionary:/);
  assert.match(screenshots, /get_base_control/);
  assert.match(screenshots, /get_viewport/);
  assert.match(screenshots, /DisplayServer\.get_name/);
  assert.match(screenshots, /save_png_to_buffer/);
  assert.match(screenshots, /Marshalls\.raw_to_base64/);

  assert.match(mainScreen, /const EDITOR_MAIN_SCREENS := \["2D", "3D", "Script", "Game", "AssetLib"\]/);
  assert.match(mainScreen, /static func main_screen_state\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(mainScreen, /static func set_main_screen_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(mainScreen, /static func set_main_screen\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(mainScreen, /static func _normalize_editor_main_screen\(raw_screen: String\) -> String:/);
  assert.match(mainScreen, /get_editor_main_screen/);
  assert.match(mainScreen, /set_main_screen_editor/);
});

test("Godot viewport state reports headless mode as unavailable", async () => {
  const stateOperations = await readAddonFile("niua_mcp_viewport_state_operations.gd");

  assert.match(stateOperations, /DisplayServer\.get_name\(\) == "headless"/);
  assert.match(stateOperations, /available": false/);
  assert.match(stateOperations, /"reason": "editor viewport state requires a rendered editor; headless mode uses Godot's dummy renderer"/);
});

test("Godot editor surface bridge side effects live in surface operations", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_editor_surface_operations.gd");
  const mainScreen = await readAddonFile("niua_mcp_editor_surface_main_screen_operations.gd");

  assert.match(operations, /static func set_main_screen_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(bridge, /NiuaMcpEditorSurfaceOperations\.set_main_screen_with_side_effects/);
  assert.doesNotMatch(bridge, /Switched editor main screen to %s/);
  assert.doesNotMatch(operations, /Switched editor main screen to %s/);
  assert.match(mainScreen, /Switched editor main screen to %s/);
});

test("Godot editor selection operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_editor_selection_operations.gd");
  const nodeOperations = await readAddonFile("niua_mcp_editor_selection_node_operations.gd");
  const resourceOperations = await readAddonFile("niua_mcp_editor_selection_resource_operations.gd");
  const utils = await readAddonFile("niua_mcp_editor_selection_utils.gd");
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");

  assert.match(bridge, /preload\("niua_mcp_editor_selection_operations\.gd"\)/);
  assert.match(readRoutes, /NiuaMcpEditorSelectionOperations\.selection/);
  assert.match(bridge, /NiuaMcpEditorSelectionOperations\.set_selection/);
  assert.match(bridge, /NiuaMcpEditorSelectionOperations\.focus_node/);
  assert.match(bridge, /NiuaMcpEditorSelectionOperations\.focus_resource/);
  assert.doesNotMatch(bridge, /selection\.clear/);
  assert.doesNotMatch(bridge, /selection\.add_node/);
  assert.doesNotMatch(bridge, /select_file/);
  assert.match(operations, /extends RefCounted/);
  assert.match(operations, /preload\("niua_mcp_editor_selection_node_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_editor_selection_resource_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_editor_selection_utils\.gd"\)/);
  assert.match(operations, /static func selection\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(operations, /static func set_selection\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func focus_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func focus_resource\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /NiuaMcpEditorSelectionNodeOperations\.set_selection/);
  assert.match(operations, /NiuaMcpEditorSelectionNodeOperations\.focus_node/);
  assert.match(operations, /NiuaMcpEditorSelectionResourceOperations\.focus_resource/);
  assert.doesNotMatch(operations, /selection\.clear/);
  assert.doesNotMatch(operations, /selection\.add_node/);
  assert.doesNotMatch(operations, /select_file/);
  assert.doesNotMatch(operations, /ResourceLoader\.load/);
  assert.doesNotMatch(operations, /NiuaMcpNodeSnapshot\.selection_item/);
  assert.match(nodeOperations, /extends RefCounted/);
  assert.match(nodeOperations, /static func selection\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(nodeOperations, /static func set_selection\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(nodeOperations, /static func focus_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(nodeOperations, /selection\.clear/);
  assert.match(nodeOperations, /selection\.add_node/);
  assert.match(nodeOperations, /edit_node/);
  assert.match(nodeOperations, /inspect_object/);
  assert.match(nodeOperations, /NiuaMcpSceneGraphOperations\.resolve_node/);
  assert.match(nodeOperations, /NiuaMcpSceneGraphOperations\.selection_data/);
  assert.match(nodeOperations, /NiuaMcpNodeSnapshot\.selection_item/);
  assert.match(resourceOperations, /extends RefCounted/);
  assert.match(resourceOperations, /static func focus_resource\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(resourceOperations, /select_file/);
  assert.match(resourceOperations, /ResourceLoader\.load/);
  assert.match(resourceOperations, /inspect_object/);
  assert.match(resourceOperations, /edit_resource/);
  assert.match(utils, /extends RefCounted/);
  assert.match(utils, /static func remember\(remember: Callable, message: String\) -> void:/);
  assert.match(utils, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(utils, /errorCode/);
});

test("Godot editor selection bridge side effects live in selection operations", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_editor_selection_operations.gd");
  const utils = await readAddonFile("niua_mcp_editor_selection_utils.gd");

  assert.match(operations, /static func set_selection_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func focus_node_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func focus_resource_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /NiuaMcpEditorSelectionUtils\.remember/);
  assert.match(utils, /static func remember\(remember: Callable, message: String\) -> void:/);
  assert.match(bridge, /NiuaMcpEditorSelectionOperations\.set_selection_with_side_effects/);
  assert.match(bridge, /NiuaMcpEditorSelectionOperations\.focus_node_with_side_effects/);
  assert.match(bridge, /NiuaMcpEditorSelectionOperations\.focus_resource_with_side_effects/);
  assert.doesNotMatch(bridge, /Set editor selection to %d node\(s\)/);
  assert.doesNotMatch(bridge, /Focused node %s/);
  assert.doesNotMatch(bridge, /Focused resource %s/);
});
