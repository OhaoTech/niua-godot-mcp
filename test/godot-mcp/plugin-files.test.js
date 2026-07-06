import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  assertEndpointRoutes,
  readAddonFile,
  readAddonFileExact,
  readBridgeFullRouteSurface,
  readBridgeWriteSurface
} from "./helpers/plugin-files.js";

async function readPluginFileTest(file) {
  return readFile(new URL(file, import.meta.url), "utf8");
}

test("Godot bridge core plugin file tests live in focused plugin bridge core test file", async () => {
  const bridgeCoreTest = await readPluginFileTest("plugin-files/bridge-core.test.js");
  const helper = await readPluginFileTest("helpers/plugin-files.js");
  const rootTest = await readPluginFileTest("plugin-files.test.js");

  assert.match(bridgeCoreTest, /import \{[\s\S]*\} from "\.\.\/helpers\/plugin-files\.js"/);
  assert.match(bridgeCoreTest, /Godot plugin manifest points at the NIUA MCP editor plugin/);
  assert.match(bridgeCoreTest, /Godot bridge read routes live in their own route module/);
  assert.match(bridgeCoreTest, /Godot bridge write scene routes delegate nested scene route modules/);
  assert.match(helper, /export async function readAddonFileExact/);
  assert.match(helper, /export async function readAddonFile/);
  assert.match(helper, /export async function readBridgeWriteSurface/);
  assert.match(helper, /export async function assertEndpointRoutes/);
  assert.doesNotMatch(rootTest, /const readRouteDomainFiles = \[/);
  assert.doesNotMatch(rootTest, /async function readAddonFile\(/);
  assert.doesNotMatch(rootTest, /test\("Godot plugin manifest points at the NIUA MCP editor plugin"/);
  assert.doesNotMatch(rootTest, /test\("Godot bridge TCP server lives in its own Godot module"/);
  assert.doesNotMatch(rootTest, /test\("Godot bridge context helpers live in their own Godot module"/);
});

test("Godot debugger probe plugin file tests live in focused plugin debugger probe test file", async () => {
  const debuggerProbeTest = await readPluginFileTest("plugin-files/debugger-probe.test.js");
  const rootTest = await readPluginFileTest("plugin-files.test.js");

  assert.match(debuggerProbeTest, /import \{[\s\S]*\} from "\.\.\/helpers\/plugin-files\.js"/);
  assert.match(debuggerProbeTest, /Godot debugger probe lives in its own Godot module/);
  assert.match(debuggerProbeTest, /Godot debugger probe store delegates event log and runtime data domains/);
  assert.match(debuggerProbeTest, /Godot debugger probe host owns debugger plugin lifecycle/);
  assert.doesNotMatch(rootTest, /test\("Godot debugger probe lives in its own Godot module"/);
  assert.doesNotMatch(rootTest, /test\("Godot debugger probe store delegates event log and runtime data domains"/);
  assert.doesNotMatch(rootTest, /test\("Godot debugger probe host owns debugger plugin lifecycle"/);
});

test("Godot script plugin file tests live in focused plugin scripts test file", async () => {
  const scriptsTest = await readPluginFileTest("plugin-files/scripts.test.js");
  const rootTest = await readPluginFileTest("plugin-files.test.js");

  assert.match(scriptsTest, /import \{[\s\S]*\} from "\.\.\/helpers\/plugin-files\.js"/);
  assert.match(scriptsTest, /Godot script templates live in their own Godot module/);
  assert.match(scriptsTest, /Godot script file operations delegate focused domain modules/);
  assert.match(scriptsTest, /Godot script editor cursor state delegates context and caret modules/);
  assert.match(scriptsTest, /Godot script bridge side effects live in script operations/);
  assert.doesNotMatch(rootTest, /test\("Godot script templates live in their own Godot module"/);
  assert.doesNotMatch(rootTest, /test\("Godot script file operations delegate focused domain modules"/);
  assert.doesNotMatch(rootTest, /test\("Godot script bridge side effects live in script operations"/);
});

test("Godot editor UI plugin file tests live in focused plugin editor UI test file", async () => {
  const editorUiTest = await readPluginFileTest("plugin-files/editor-ui.test.js");
  const rootTest = await readPluginFileTest("plugin-files.test.js");

  assert.match(editorUiTest, /import \{[\s\S]*\} from "\.\.\/helpers\/plugin-files\.js"/);
  assert.match(editorUiTest, /Godot editor state operations live in their own Godot module/);
  assert.match(editorUiTest, /Godot Inspector editor metadata lives in its own Godot module/);
  assert.match(editorUiTest, /Godot InputEvent JSON conversion lives in its own Godot module/);
  assert.match(editorUiTest, /Godot editor selection operations live in their own Godot module/);
  assert.doesNotMatch(rootTest, /test\("Godot editor state operations live in their own Godot module"/);
  assert.doesNotMatch(rootTest, /test\("Godot editor action domains live in focused Godot modules"/);
  assert.doesNotMatch(rootTest, /test\("Godot editor selection bridge side effects live in selection operations"/);
});

test("Godot viewport operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const viewportOperations = await readAddonFile("niua_mcp_viewport_operations.gd");

  assert.match(bridge, /preload\("niua_mcp_viewport_operations\.gd"\)/);
  assert.match(readRoutes, /NiuaMcpViewportOperations\.viewport_state/);
  assert.match(bridge, /NiuaMcpViewportOperations\.set_viewport_camera/);
  assert.match(bridge, /NiuaMcpViewportOperations\.send_viewport_input/);
  assert.match(readRoutes, /NiuaMcpViewportOperations\.capture_viewport_screenshot/);
  assert.doesNotMatch(bridge, /func _resolve_editor_viewport/);
  assert.doesNotMatch(bridge, /func _camera2d_state/);
  assert.doesNotMatch(bridge, /func _camera3d_state/);
  assert.doesNotMatch(bridge, /func _apply_camera2d_update/);
  assert.doesNotMatch(bridge, /func _apply_camera3d_update/);
  assert.doesNotMatch(bridge, /func _viewport_screenshot_unavailable/);
  assert.match(viewportOperations, /extends RefCounted/);
  assert.match(viewportOperations, /preload\("niua_mcp_viewport_camera_operations\.gd"\)/);
  assert.match(viewportOperations, /preload\("niua_mcp_viewport_input_operations\.gd"\)/);
  assert.match(viewportOperations, /preload\("niua_mcp_viewport_screenshot_operations\.gd"\)/);
  assert.match(viewportOperations, /preload\("niua_mcp_viewport_side_effects\.gd"\)/);
  assert.match(viewportOperations, /preload\("niua_mcp_viewport_state_operations\.gd"\)/);
  assert.match(viewportOperations, /static func viewport_state\(editor: EditorInterface, query: Dictionary\) -> Dictionary:/);
  assert.match(viewportOperations, /static func set_viewport_camera\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(viewportOperations, /static func send_viewport_input\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(viewportOperations, /static func capture_viewport_screenshot\(editor: EditorInterface, query: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(viewportOperations, /get_editor_viewport_2d/);
  assert.doesNotMatch(viewportOperations, /get_editor_viewport_3d/);
  assert.doesNotMatch(viewportOperations, /get_camera_2d/);
  assert.doesNotMatch(viewportOperations, /get_camera_3d/);
  assert.doesNotMatch(viewportOperations, /push_input/);
  assert.doesNotMatch(viewportOperations, /save_png_to_buffer/);
  assert.doesNotMatch(viewportOperations, /Marshalls\.raw_to_base64/);
});

test("Godot viewport operations delegate focused domain modules", async () => {
  const facade = await readAddonFile("niua_mcp_viewport_operations.gd");
  const utils = await readAddonFile("niua_mcp_viewport_utils.gd");
  const resolver = await readAddonFile("niua_mcp_viewport_resolver.gd");
  const state = await readAddonFile("niua_mcp_viewport_state_operations.gd");
  const camera = await readAddonFile("niua_mcp_viewport_camera_operations.gd");
  const input = await readAddonFile("niua_mcp_viewport_input_operations.gd");
  const screenshot = await readAddonFile("niua_mcp_viewport_screenshot_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_viewport_side_effects.gd");

  assert.match(facade, /preload\("niua_mcp_viewport_camera_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_viewport_input_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_viewport_screenshot_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_viewport_side_effects\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_viewport_state_operations\.gd"\)/);
  assert.match(facade, /NiuaMcpViewportStateOperations\.viewport_state/);
  assert.match(facade, /NiuaMcpViewportCameraOperations\.set_viewport_camera/);
  assert.match(facade, /NiuaMcpViewportInputOperations\.send_viewport_input/);
  assert.match(facade, /NiuaMcpViewportScreenshotOperations\.capture_viewport_screenshot/);
  assert.match(facade, /NiuaMcpViewportSideEffects\.set_viewport_camera_with_side_effects/);
  assert.match(facade, /NiuaMcpViewportSideEffects\.send_viewport_input_with_side_effects/);
  assert.doesNotMatch(facade, /func _resolve_editor_viewport/);
  assert.doesNotMatch(facade, /func _remember/);
  assert.doesNotMatch(facade, /func _error/);

  assert.match(utils, /extends RefCounted/);
  assert.match(utils, /static func remember\(remember: Callable, message: String\) -> void:/);
  assert.match(utils, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(utils, /static func screenshot_unavailable\(viewport_kind: String, index: int, reason: String\) -> Dictionary:/);

  assert.match(resolver, /extends RefCounted/);
  assert.match(resolver, /preload\("niua_mcp_viewport_utils\.gd"\)/);
  assert.match(resolver, /static func resolve_editor_viewport\(editor: EditorInterface, viewport_kind: String, index: int\) -> Dictionary:/);
  assert.match(resolver, /get_editor_viewport_2d/);
  assert.match(resolver, /get_editor_viewport_3d/);

  assert.match(state, /extends RefCounted/);
  assert.match(state, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(state, /preload\("niua_mcp_viewport_resolver\.gd"\)/);
  assert.match(state, /preload\("niua_mcp_viewport_utils\.gd"\)/);
  assert.match(state, /static func viewport_state\(editor: EditorInterface, query: Dictionary\) -> Dictionary:/);
  assert.match(state, /static func camera2d_state\(camera: Camera2D\) -> Dictionary:/);
  assert.match(state, /static func camera3d_state\(camera: Camera3D\) -> Dictionary:/);
  assert.match(state, /get_visible_rect/);
  assert.match(state, /get_camera_2d/);
  assert.match(state, /get_camera_3d/);

  assert.match(camera, /extends RefCounted/);
  assert.match(camera, /preload\("niua_mcp_json_args\.gd"\)/);
  assert.match(camera, /preload\("niua_mcp_viewport_resolver\.gd"\)/);
  assert.match(camera, /preload\("niua_mcp_viewport_state_operations\.gd"\)/);
  assert.match(camera, /preload\("niua_mcp_viewport_utils\.gd"\)/);
  assert.match(camera, /static func set_viewport_camera\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(camera, /static func apply_camera2d_update\(camera: Camera2D, body: Dictionary\) -> Dictionary:/);
  assert.match(camera, /static func apply_camera3d_update\(camera: Camera3D, body: Dictionary\) -> Dictionary:/);
  assert.match(camera, /NiuaMcpJsonArgs\.typed_vector2/);
  assert.match(camera, /NiuaMcpJsonArgs\.typed_vector3/);

  assert.match(input, /extends RefCounted/);
  assert.match(input, /preload\("niua_mcp_input_event_codec\.gd"\)/);
  assert.match(input, /preload\("niua_mcp_viewport_resolver\.gd"\)/);
  assert.match(input, /preload\("niua_mcp_viewport_utils\.gd"\)/);
  assert.match(input, /static func send_viewport_input\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(input, /push_input/);
  assert.match(input, /notify_mouse_entered/);
  assert.match(input, /update_mouse_cursor_state/);

  assert.match(screenshot, /extends RefCounted/);
  assert.match(screenshot, /preload\("niua_mcp_viewport_resolver\.gd"\)/);
  assert.match(screenshot, /preload\("niua_mcp_viewport_utils\.gd"\)/);
  assert.match(screenshot, /static func capture_viewport_screenshot\(editor: EditorInterface, query: Dictionary\) -> Dictionary:/);
  assert.match(screenshot, /DisplayServer\.get_name/);
  assert.match(screenshot, /save_png_to_buffer/);
  assert.match(screenshot, /Marshalls\.raw_to_base64/);

  assert.match(sideEffects, /extends RefCounted/);
  assert.match(sideEffects, /preload\("niua_mcp_viewport_camera_operations\.gd"\)/);
  assert.match(sideEffects, /preload\("niua_mcp_viewport_input_operations\.gd"\)/);
  assert.match(sideEffects, /preload\("niua_mcp_viewport_utils\.gd"\)/);
  assert.match(sideEffects, /static func set_viewport_camera_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /static func send_viewport_input_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /Updated %s viewport camera index=%d/);
  assert.match(sideEffects, /Sent %d input event\(s\) to %s viewport index=%d/);
});

test("Godot viewport bridge side effects live in viewport operations", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_viewport_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_viewport_side_effects.gd");

  assert.match(operations, /static func set_viewport_camera_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func send_viewport_input_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(bridge, /NiuaMcpViewportOperations\.set_viewport_camera_with_side_effects/);
  assert.match(bridge, /NiuaMcpViewportOperations\.send_viewport_input_with_side_effects/);
  assert.doesNotMatch(bridge, /Updated %s viewport camera index=%d/);
  assert.doesNotMatch(bridge, /Sent %d input event\(s\) to %s viewport index=%d/);
  assert.match(sideEffects, /Updated %s viewport camera index=%d/);
  assert.match(sideEffects, /Sent %d input event\(s\) to %s viewport index=%d/);
  assert.doesNotMatch(operations, /Updated %s viewport camera index=%d/);
  assert.doesNotMatch(operations, /Sent %d input event\(s\) to %s viewport index=%d/);
});

test("Godot scene tab operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const sceneTabs = await readAddonFile("niua_mcp_scene_tab_operations.gd");
  const sceneTabState = await readAddonFile("niua_mcp_scene_tab_state.gd");
  const sceneTabControl = await readAddonFile("niua_mcp_scene_tab_control.gd");
  const sceneTabUndoRedo = await readAddonFile("niua_mcp_scene_tab_undo_redo.gd");

  assert.match(bridge, /preload\("niua_mcp_scene_tab_operations\.gd"\)/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.open_scene/);
  assert.match(readRoutes, /NiuaMcpSceneTabOperations\.open_scene_tabs/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.switch_scene_tab/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.close_scene_tab/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.mark_scene_unsaved/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.undo_editor_action/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.redo_editor_action/);
  assert.doesNotMatch(bridge, /func _scene_tab_state/);
  assert.doesNotMatch(bridge, /func _scene_tab_metadata/);
  assert.doesNotMatch(bridge, /func _apply_editor_undo_redo/);
  assert.doesNotMatch(bridge, /func _resolve_editor_undo_redo/);
  assert.doesNotMatch(bridge, /func _undo_redo_state/);
  assert.match(sceneTabs, /extends RefCounted/);
  assert.match(sceneTabs, /preload\("niua_mcp_scene_tab_state\.gd"\)/);
  assert.match(sceneTabs, /preload\("niua_mcp_scene_tab_control\.gd"\)/);
  assert.match(sceneTabs, /preload\("niua_mcp_scene_tab_undo_redo\.gd"\)/);
  assert.match(sceneTabs, /static func open_scene\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(sceneTabs, /static func scene_tab_state\(editor: EditorInterface, extra: Dictionary = {}\) -> Dictionary:/);
  assert.match(sceneTabs, /static func open_scene_tabs\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(sceneTabs, /static func switch_scene_tab\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(sceneTabs, /static func close_scene_tab\(editor: EditorInterface, body: Dictionary, save_current_scene: Callable\) -> Dictionary:/);
  assert.match(sceneTabs, /static func mark_scene_unsaved\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(sceneTabs, /static func undo_editor_action\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(sceneTabs, /static func redo_editor_action\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(sceneTabs, /func _scene_tab_metadata/);
  assert.doesNotMatch(sceneTabs, /func _apply_editor_undo_redo/);
  assert.match(sceneTabState, /static func scene_tab_state\(editor: EditorInterface, extra: Dictionary = {}\) -> Dictionary:/);
  assert.match(sceneTabState, /static func open_scene_tabs\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(sceneTabState, /static func current_scene_path\(editor: EditorInterface\) -> String:/);
  assert.match(sceneTabState, /static func edited_scene_root\(editor: EditorInterface\) -> Node:/);
  assert.match(sceneTabState, /get_open_scenes/);
  assert.match(sceneTabState, /get_open_scene_roots/);
  assert.match(sceneTabState, /is_object_edited/);
  assert.match(sceneTabControl, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(sceneTabControl, /static func open_scene\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(sceneTabControl, /static func switch_scene_tab\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(sceneTabControl, /static func close_scene_tab\(editor: EditorInterface, body: Dictionary, save_current_scene: Callable\) -> Dictionary:/);
  assert.match(sceneTabControl, /static func mark_scene_unsaved\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(sceneTabUndoRedo, /static func undo_editor_action\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(sceneTabUndoRedo, /static func redo_editor_action\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(sceneTabUndoRedo, /get_editor_undo_redo/);
  assert.match(sceneTabUndoRedo, /\.undo\(\)/);
  assert.match(sceneTabUndoRedo, /\.redo\(\)/);
});

test("Godot scene tab operations delegate focused domain modules", async () => {
  const sceneTabs = await readAddonFile("niua_mcp_scene_tab_operations.gd");
  const sceneTabState = await readAddonFile("niua_mcp_scene_tab_state.gd");
  const sceneTabControl = await readAddonFile("niua_mcp_scene_tab_control.gd");
  const sceneTabUndoRedo = await readAddonFile("niua_mcp_scene_tab_undo_redo.gd");
  const sceneTabSideEffects = await readAddonFile("niua_mcp_scene_tab_side_effects.gd");
  const sceneTabUtils = await readAddonFile("niua_mcp_scene_tab_utils.gd");

  assert.match(sceneTabs, /NiuaMcpSceneTabSideEffects\.open_scene_with_side_effects/);
  assert.match(sceneTabs, /NiuaMcpSceneTabControl\.open_scene/);
  assert.match(sceneTabs, /NiuaMcpSceneTabState\.open_scene_tabs/);
  assert.match(sceneTabs, /NiuaMcpSceneTabUndoRedo\.undo_editor_action/);
  assert.doesNotMatch(sceneTabs, /Opened scene %s/);
  assert.doesNotMatch(sceneTabs, /get_open_scene_roots/);
  assert.doesNotMatch(sceneTabs, /get_editor_undo_redo/);

  assert.match(sceneTabState, /static func _scene_tab_metadata/);
  assert.match(sceneTabState, /historyVersion/);
  assert.match(sceneTabState, /dirtySource/);
  assert.match(sceneTabState, /unsaved/);
  assert.match(sceneTabControl, /ResourceLoader\.exists/);
  assert.match(sceneTabControl, /open_scene_from_path/);
  assert.match(sceneTabControl, /mark_scene_as_unsaved/);
  assert.match(sceneTabUndoRedo, /static func _apply_editor_undo_redo/);
  assert.match(sceneTabUndoRedo, /static func _resolve_editor_undo_redo/);
  assert.match(sceneTabUndoRedo, /static func _undo_redo_state/);
  assert.match(sceneTabUndoRedo, /UndoRedo/);
  assert.match(sceneTabSideEffects, /Opened scene %s/);
  assert.match(sceneTabSideEffects, /Applied editor undo history=%d applied=%s/);
  assert.match(sceneTabUtils, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(sceneTabUtils, /static func remember\(remember: Callable, message: String\) -> void:/);
});

test("Godot scene tab bridge side effects live in scene tab operations", async () => {
  const bridge = await readBridgeWriteSurface();
  const sceneTabs = await readAddonFile("niua_mcp_scene_tab_operations.gd");
  const sceneTabSideEffects = await readAddonFile("niua_mcp_scene_tab_side_effects.gd");

  assert.match(sceneTabs, /static func open_scene_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(sceneTabs, /static func switch_scene_tab_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(sceneTabs, /static func close_scene_tab_with_side_effects\(editor: EditorInterface, body: Dictionary, save_current_scene: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sceneTabs, /static func mark_scene_unsaved_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(sceneTabs, /static func undo_editor_action_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(sceneTabs, /static func redo_editor_action_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.open_scene_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.switch_scene_tab_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.close_scene_tab_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.mark_scene_unsaved_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.undo_editor_action_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.redo_editor_action_with_side_effects/);
  assert.match(sceneTabSideEffects, /Opened scene %s/);
  assert.match(sceneTabSideEffects, /Switched scene tab %s/);
  assert.match(sceneTabSideEffects, /Closed current scene tab/);
  assert.match(sceneTabSideEffects, /Marked current scene tab as unsaved/);
  assert.match(sceneTabSideEffects, /Applied editor undo history=%d applied=%s/);
  assert.match(sceneTabSideEffects, /Applied editor redo history=%d applied=%s/);
  assert.doesNotMatch(sceneTabs, /Opened scene %s/);
  assert.doesNotMatch(sceneTabs, /Applied editor undo history=%d applied=%s/);
  assert.doesNotMatch(bridge, /Opened scene %s/);
  assert.doesNotMatch(bridge, /Switched scene tab %s/);
  assert.doesNotMatch(bridge, /Closed current scene tab/);
  assert.doesNotMatch(bridge, /Marked current scene tab as unsaved/);
  assert.doesNotMatch(bridge, /Applied editor undo history=%d applied=%s/);
  assert.doesNotMatch(bridge, /Applied editor redo history=%d applied=%s/);
});

test("Godot scene graph operations live in their own Godot module", async () => {
  const bridge = await readBridgeFullRouteSurface();
  const operations = await readAddonFile("niua_mcp_scene_graph_operations.gd");

  assert.match(bridge, /preload\("niua_mcp_scene_graph_operations\.gd"\)/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.create_scene/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.create_node/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.create_node_with_script/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.rename_node/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.delete_node/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.duplicate_node/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.reparent_node/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.reorder_node/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.inspector_properties/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.set_node_property/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.assign_material/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.save_current_scene/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.save_scene_as/);
  assert.match(bridge, /NiuaMcpBridgeContext\.selection_data/);
  assert.match(bridge, /NiuaMcpBridgeContext\.resolve_node/);
  assert.match(bridge, /NiuaMcpBridgeContext\.node_path_for_response/);
  assert.doesNotMatch(bridge, /func _set_owner_recursive/);
  assert.doesNotMatch(bridge, /func _object_has_property/);
  assert.doesNotMatch(bridge, /func _node_for_inspector/);

  assert.match(operations, /extends RefCounted/);
  assert.match(operations, /preload\("niua_mcp_scene_document_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_scene_graph_context\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_scene_inspector_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_scene_property_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_scene_material_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_scene_node_operations\.gd"\)/);
  assert.match(operations, /static func create_scene\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(operations, /static func create_node\(editor: EditorInterface, body: Dictionary, path_validator: Callable\) -> Dictionary:/);
  assert.match(operations, /static func create_node_with_script\(/);
  assert.match(operations, /path_validator: Callable/);
  assert.match(operations, /create_script: Callable/);
  assert.match(operations, /attach_script: Callable/);
  assert.match(operations, /static func rename_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func delete_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func duplicate_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func reparent_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func reorder_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func inspector_properties\(editor: EditorInterface, query: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func set_node_property\(editor: EditorInterface, body: Dictionary, path_validator: Callable\) -> Dictionary:/);
  assert.match(operations, /static func assign_material\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func save_current_scene\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func save_scene_as\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(operations, /static func selection_data\(editor: EditorInterface\) -> Array:/);
  assert.match(operations, /static func resolve_node\(editor: EditorInterface, node_path: String\) -> Node:/);
  assert.match(operations, /static func node_path_for_response\(editor: EditorInterface, node: Node\) -> String:/);
  assert.doesNotMatch(operations, /property_can_revert/);
  assert.doesNotMatch(operations, /property_get_revert/);
  assert.doesNotMatch(operations, /set_surface_override_material/);
  assert.doesNotMatch(operations, /NiuaMcpInspectorMetadata\.property_editor_metadata/);
  assert.doesNotMatch(operations, /NiuaMcpPropertyMetadata\.usage_flags/);
  assert.doesNotMatch(operations, /ResourceLoader\.load/);
  assert.doesNotMatch(operations, /func _object_has_property/);
  assert.doesNotMatch(operations, /func _node_for_inspector/);
});

test("Godot scene graph operations delegate focused domain modules", async () => {
  const facade = await readAddonFile("niua_mcp_scene_graph_operations.gd");
  const context = await readAddonFile("niua_mcp_scene_graph_context.gd");
  const inspector = await readAddonFile("niua_mcp_scene_inspector_operations.gd");
  const property = await readAddonFile("niua_mcp_scene_property_operations.gd");
  const material = await readAddonFile("niua_mcp_scene_material_operations.gd");
  const utils = await readAddonFile("niua_mcp_scene_graph_utils.gd");

  assert.match(facade, /preload\("niua_mcp_scene_graph_context\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_scene_inspector_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_scene_property_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_scene_material_operations\.gd"\)/);
  assert.match(facade, /NiuaMcpSceneGraphContext\.selection_data/);
  assert.match(facade, /NiuaMcpSceneGraphContext\.resolve_node/);
  assert.match(facade, /NiuaMcpSceneGraphContext\.node_path_for_response/);
  assert.match(facade, /NiuaMcpSceneInspectorOperations\.inspector_properties/);
  assert.match(facade, /NiuaMcpScenePropertyOperations\.set_node_property/);
  assert.match(facade, /NiuaMcpScenePropertyOperations\.set_node_property_with_side_effects/);
  assert.match(facade, /NiuaMcpSceneMaterialOperations\.assign_material/);
  assert.match(facade, /NiuaMcpSceneMaterialOperations\.assign_material_with_side_effects/);
  assert.doesNotMatch(facade, /NiuaMcpVariantCodec\.json_to_variant/);
  assert.doesNotMatch(facade, /property_can_revert/);
  assert.doesNotMatch(facade, /ResourceLoader\.load/);
  assert.doesNotMatch(facade, /func _remember/);
  assert.doesNotMatch(facade, /func _error/);

  assert.match(context, /extends RefCounted/);
  assert.match(context, /preload\("niua_mcp_node_snapshot\.gd"\)/);
  assert.match(context, /static func edited_scene_root\(editor: EditorInterface\) -> Node:/);
  assert.match(context, /static func current_scene_path\(editor: EditorInterface\) -> String:/);
  assert.match(context, /static func open_scenes\(editor: EditorInterface\) -> Array:/);
  assert.match(context, /static func selection_data\(editor: EditorInterface\) -> Array:/);
  assert.match(context, /static func resolve_node\(editor: EditorInterface, node_path: String\) -> Node:/);
  assert.match(context, /static func node_path_for_response\(editor: EditorInterface, node: Node\) -> String:/);
  assert.match(context, /static func node_for_inspector\(editor: EditorInterface, node_path: String\) -> Node:/);
  assert.match(context, /NiuaMcpNodeSnapshot\.selection_item/);
  assert.match(context, /NiuaMcpNodeSnapshot\.node_path_for_response/);

  assert.match(inspector, /extends RefCounted/);
  assert.match(inspector, /preload\("niua_mcp_inspector_metadata\.gd"\)/);
  assert.match(inspector, /preload\("niua_mcp_property_metadata\.gd"\)/);
  assert.match(inspector, /preload\("niua_mcp_scene_graph_context\.gd"\)/);
  assert.match(inspector, /preload\("niua_mcp_scene_graph_utils\.gd"\)/);
  assert.match(inspector, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(inspector, /static func inspector_properties\(editor: EditorInterface, query: Dictionary\) -> Dictionary:/);
  assert.match(inspector, /property_can_revert/);
  assert.match(inspector, /property_get_revert/);
  assert.match(inspector, /NiuaMcpInspectorMetadata\.property_editor_metadata/);
  assert.match(inspector, /NiuaMcpPropertyMetadata\.usage_flags/);

  assert.match(property, /extends RefCounted/);
  assert.match(property, /preload\("niua_mcp_scene_graph_context\.gd"\)/);
  assert.match(property, /preload\("niua_mcp_scene_graph_utils\.gd"\)/);
  assert.match(property, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(property, /static func set_node_property_with_side_effects\(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(property, /static func set_node_property\(editor: EditorInterface, body: Dictionary, path_validator: Callable\) -> Dictionary:/);
  assert.match(property, /NiuaMcpVariantCodec\.json_to_variant/);
  assert.match(property, /NiuaMcpVariantCodec\.variant_to_json/);
  assert.match(property, /Set %s on %s/);

  assert.match(material, /extends RefCounted/);
  assert.match(material, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(material, /preload\("niua_mcp_scene_graph_context\.gd"\)/);
  assert.match(material, /preload\("niua_mcp_scene_graph_utils\.gd"\)/);
  assert.match(material, /static func assign_material_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(material, /static func assign_material\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(material, /ResourceLoader\.load/);
  assert.match(material, /Material/);
  assert.match(material, /set_surface_override_material/);
  assert.match(material, /material_override/);
  assert.match(material, /Assigned material %s to %s/);

  assert.match(utils, /extends RefCounted/);
  assert.match(utils, /static func remember\(remember: Callable, message: String\) -> void:/);
  assert.match(utils, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(utils, /static func object_has_property\(object: Object, property_name: String\) -> bool:/);
});

test("Godot scene document operations live in their own Godot module", async () => {
  const sceneGraphOperations = await readAddonFile("niua_mcp_scene_graph_operations.gd");
  const documentOperations = await readAddonFile("niua_mcp_scene_document_operations.gd");
  const documentFacade = await readAddonFileExact("niua_mcp_scene_document_operations.gd");
  const documentCreate = await readAddonFile("niua_mcp_scene_document_create_operations.gd");
  const documentSave = await readAddonFile("niua_mcp_scene_document_save_operations.gd");
  const documentSideEffects = await readAddonFile("niua_mcp_scene_document_side_effects.gd");
  const documentUtils = await readAddonFile("niua_mcp_scene_document_utils.gd");

  assert.match(sceneGraphOperations, /preload\("niua_mcp_scene_document_operations\.gd"\)/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneDocumentOperations\.create_scene_with_side_effects/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneDocumentOperations\.save_current_scene_with_side_effects/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneDocumentOperations\.save_scene_as_with_side_effects/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneDocumentOperations\.create_scene/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneDocumentOperations\.save_current_scene/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneDocumentOperations\.save_scene_as/);
  assert.doesNotMatch(sceneGraphOperations, /PackedScene\.new/);
  assert.doesNotMatch(sceneGraphOperations, /ResourceSaver\.save/);
  assert.match(documentOperations, /extends RefCounted/);
  assert.match(documentOperations, /static func create_scene_with_side_effects\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(documentOperations, /static func save_current_scene_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(documentOperations, /static func save_scene_as_with_side_effects\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(documentOperations, /static func create_scene\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(documentOperations, /static func save_current_scene\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(documentOperations, /static func save_scene_as\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(documentOperations, /PackedScene\.new/);
  assert.match(documentOperations, /ResourceSaver\.save/);
  assert.match(documentOperations, /ClassDB\.instantiate/);

  assert.match(documentFacade, /preload\("niua_mcp_scene_document_create_operations\.gd"\)/);
  assert.match(documentFacade, /preload\("niua_mcp_scene_document_save_operations\.gd"\)/);
  assert.match(documentFacade, /preload\("niua_mcp_scene_document_side_effects\.gd"\)/);
  assert.match(documentFacade, /preload\("niua_mcp_scene_document_utils\.gd"\)/);
  assert.match(documentFacade, /NiuaMcpSceneDocumentCreateOperations\.create_scene/);
  assert.match(documentFacade, /NiuaMcpSceneDocumentSaveOperations\.save_current_scene/);
  assert.match(documentFacade, /NiuaMcpSceneDocumentSaveOperations\.save_scene_as/);
  assert.match(documentFacade, /NiuaMcpSceneDocumentSideEffects\.create_scene_with_side_effects/);
  assert.match(documentFacade, /NiuaMcpSceneDocumentSideEffects\.save_current_scene_with_side_effects/);
  assert.match(documentFacade, /NiuaMcpSceneDocumentSideEffects\.save_scene_as_with_side_effects/);
  assert.match(documentFacade, /NiuaMcpSceneDocumentUtils/);
  assert.doesNotMatch(documentFacade, /PackedScene\.new/);
  assert.doesNotMatch(documentFacade, /ResourceSaver\.save/);
  assert.doesNotMatch(documentFacade, /ClassDB\.instantiate/);
  assert.doesNotMatch(documentFacade, /NiuaMcpPathUtils/);
  assert.doesNotMatch(documentFacade, /_edited_scene_root/);
  assert.doesNotMatch(documentFacade, /func _remember/);
  assert.doesNotMatch(documentFacade, /func _error/);
  assert.doesNotMatch(documentFacade, /Created scene %s/);
  assert.doesNotMatch(documentFacade, /Saved scene as %s/);

  assert.match(documentCreate, /extends RefCounted/);
  assert.match(documentCreate, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(documentCreate, /preload\("niua_mcp_scene_document_utils\.gd"\)/);
  assert.match(documentCreate, /static func create_scene\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(documentCreate, /NiuaMcpPathUtils\.validate_scene_path/);
  assert.match(documentCreate, /NiuaMcpSceneDocumentUtils\.error/);
  assert.match(documentCreate, /ClassDB\.instantiate/);
  assert.match(documentCreate, /PackedScene\.new/);
  assert.match(documentCreate, /ResourceSaver\.save/);
  assert.match(documentCreate, /ensure_parent_directory/);
  assert.match(documentCreate, /open_scene_from_path/);

  assert.match(documentSave, /extends RefCounted/);
  assert.match(documentSave, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(documentSave, /preload\("niua_mcp_scene_document_utils\.gd"\)/);
  assert.match(documentSave, /static func save_current_scene\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(documentSave, /static func save_scene_as\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(documentSave, /NiuaMcpSceneDocumentUtils\.edited_scene_root/);
  assert.match(documentSave, /NiuaMcpSceneDocumentUtils\.error/);
  assert.match(documentSave, /PackedScene\.new/);
  assert.match(documentSave, /ResourceSaver\.save/);
  assert.match(documentSave, /ensure_parent_directory/);

  assert.match(documentSideEffects, /extends RefCounted/);
  assert.match(documentSideEffects, /preload\("niua_mcp_scene_document_create_operations\.gd"\)/);
  assert.match(documentSideEffects, /preload\("niua_mcp_scene_document_save_operations\.gd"\)/);
  assert.match(documentSideEffects, /preload\("niua_mcp_scene_document_utils\.gd"\)/);
  assert.match(documentSideEffects, /static func create_scene_with_side_effects\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(documentSideEffects, /static func save_current_scene_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(documentSideEffects, /static func save_scene_as_with_side_effects\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(documentSideEffects, /NiuaMcpSceneDocumentUtils\.remember/);
  assert.match(documentSideEffects, /Created scene %s/);
  assert.match(documentSideEffects, /Saved scene %s/);
  assert.match(documentSideEffects, /Saved scene as %s/);

  assert.match(documentUtils, /extends RefCounted/);
  assert.match(documentUtils, /static func remember\(remember: Callable, message: String\) -> void:/);
  assert.match(documentUtils, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(documentUtils, /static func edited_scene_root\(editor: EditorInterface\) -> Node:/);
  assert.match(documentUtils, /get_edited_scene_root/);
});

test("Godot scene node operations live in their own Godot module", async () => {
  const sceneGraphOperations = await readAddonFile("niua_mcp_scene_graph_operations.gd");
  const nodeOperations = await readAddonFile("niua_mcp_scene_node_operations.gd");
  const context = await readAddonFile("niua_mcp_scene_node_context.gd");
  const creation = await readAddonFile("niua_mcp_scene_node_creation_operations.gd");
  const instanceCreation = await readAddonFile("niua_mcp_scene_node_instance_creation.gd");
  const scriptCreation = await readAddonFile("niua_mcp_scene_node_script_creation.gd");
  const tree = await readAddonFile("niua_mcp_scene_node_tree_operations.gd");
  const treeBasic = await readAddonFile("niua_mcp_scene_node_tree_basic_operations.gd");
  const treeHierarchy = await readAddonFile("niua_mcp_scene_node_tree_hierarchy_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_scene_node_side_effects.gd");

  assert.match(sceneGraphOperations, /preload\("niua_mcp_scene_node_operations\.gd"\)/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneNodeOperations\.create_node_with_side_effects/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneNodeOperations\.create_node_with_script_with_side_effects/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneNodeOperations\.rename_node_with_side_effects/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneNodeOperations\.delete_node_with_side_effects/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneNodeOperations\.duplicate_node_with_side_effects/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneNodeOperations\.reparent_node_with_side_effects/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneNodeOperations\.reorder_node_with_side_effects/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneNodeOperations\.create_node/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneNodeOperations\.create_node_with_script/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneNodeOperations\.rename_node/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneNodeOperations\.delete_node/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneNodeOperations\.duplicate_node/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneNodeOperations\.reparent_node/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneNodeOperations\.reorder_node/);
  assert.doesNotMatch(sceneGraphOperations, /move_child/);
  assert.doesNotMatch(sceneGraphOperations, /func _set_owner_recursive/);
  assert.match(nodeOperations, /extends RefCounted/);
  assert.match(nodeOperations, /preload\("niua_mcp_scene_node_context\.gd"\)/);
  assert.match(nodeOperations, /preload\("niua_mcp_scene_node_creation_operations\.gd"\)/);
  assert.match(nodeOperations, /preload\("niua_mcp_scene_node_tree_operations\.gd"\)/);
  assert.match(nodeOperations, /preload\("niua_mcp_scene_node_side_effects\.gd"\)/);
  assert.match(nodeOperations, /static func create_node_with_side_effects\(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(nodeOperations, /static func create_node_with_script_with_side_effects\(editor: EditorInterface, body: Dictionary, path_validator: Callable, create_script: Callable, attach_script: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(nodeOperations, /static func rename_node_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(nodeOperations, /static func delete_node_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(nodeOperations, /static func duplicate_node_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(nodeOperations, /static func reparent_node_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(nodeOperations, /static func reorder_node_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(nodeOperations, /static func create_node\(editor: EditorInterface, body: Dictionary, path_validator: Callable\) -> Dictionary:/);
  assert.match(nodeOperations, /static func create_node_with_script\(editor: EditorInterface, body: Dictionary, path_validator: Callable, create_script: Callable, attach_script: Callable\) -> Dictionary:/);
  assert.match(nodeOperations, /static func rename_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(nodeOperations, /static func delete_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(nodeOperations, /static func duplicate_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(nodeOperations, /static func reparent_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(nodeOperations, /static func reorder_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(sideEffects, /static func create_node_with_side_effects\(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(context, /preload\("niua_mcp_node_snapshot\.gd"\)/);
  assert.match(context, /static func set_owner_recursive\(node: Node, owner: Node\) -> void:/);
  assert.match(creation, /preload\("niua_mcp_scene_node_instance_creation\.gd"\)/);
  assert.match(creation, /preload\("niua_mcp_scene_node_script_creation\.gd"\)/);
  assert.match(creation, /NiuaMcpSceneNodeInstanceCreation\.create_node/);
  assert.match(creation, /NiuaMcpSceneNodeScriptCreation\.create_node_with_script/);
  assert.doesNotMatch(creation, /ClassDB\.instantiate/);
  assert.doesNotMatch(creation, /scriptTemplate/);
  assert.match(instanceCreation, /static func create_node\(editor: EditorInterface, body: Dictionary, path_validator: Callable\) -> Dictionary:/);
  assert.match(instanceCreation, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(instanceCreation, /ClassDB\.instantiate/);
  assert.match(scriptCreation, /static func create_node_with_script\(editor: EditorInterface, body: Dictionary, path_validator: Callable, create_script: Callable, attach_script: Callable\) -> Dictionary:/);
  assert.match(scriptCreation, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(scriptCreation, /NiuaMcpSceneNodeTreeOperations\.delete_node/);
  assert.match(scriptCreation, /scriptTemplate/);
  assert.match(tree, /NiuaMcpSceneNodeTreeBasicOperations\.rename_node/);
  assert.match(tree, /NiuaMcpSceneNodeTreeHierarchyOperations\.reorder_node/);
  assert.doesNotMatch(tree, /move_child/);
  assert.doesNotMatch(tree, /NiuaMcpNodeSnapshot\.sibling_order/);
  assert.match(treeBasic, /queue_free/);
  assert.match(treeBasic, /duplicate\(\)/);
  assert.match(treeHierarchy, /move_child/);
  assert.match(treeHierarchy, /NiuaMcpNodeSnapshot\.sibling_order/);
});

test("Godot scene node operations delegate focused domain modules", async () => {
  const facade = await readAddonFile("niua_mcp_scene_node_operations.gd");
  const context = await readAddonFile("niua_mcp_scene_node_context.gd");
  const creation = await readAddonFile("niua_mcp_scene_node_creation_operations.gd");
  const instanceCreation = await readAddonFile("niua_mcp_scene_node_instance_creation.gd");
  const scriptCreation = await readAddonFile("niua_mcp_scene_node_script_creation.gd");
  const tree = await readAddonFile("niua_mcp_scene_node_tree_operations.gd");
  const treeBasic = await readAddonFile("niua_mcp_scene_node_tree_basic_operations.gd");
  const treeHierarchy = await readAddonFile("niua_mcp_scene_node_tree_hierarchy_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_scene_node_side_effects.gd");

  assert.match(facade, /preload\("niua_mcp_scene_node_context\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_scene_node_creation_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_scene_node_tree_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_scene_node_side_effects\.gd"\)/);
  assert.match(facade, /NiuaMcpSceneNodeCreationOperations\.create_node/);
  assert.match(facade, /NiuaMcpSceneNodeTreeOperations\.reparent_node/);
  assert.match(facade, /NiuaMcpSceneNodeContext\.resolve_node/);
  assert.match(facade, /NiuaMcpSceneNodeSideEffects\.create_node_with_side_effects/);
  assert.doesNotMatch(facade, /ClassDB\.instantiate/);
  assert.doesNotMatch(facade, /move_child/);
  assert.doesNotMatch(facade, /func _remember/);

  assert.match(context, /static func edited_scene_root\(editor: EditorInterface\) -> Node:/);
  assert.match(context, /static func resolve_node\(editor: EditorInterface, node_path: String\) -> Node:/);
  assert.match(context, /static func node_path_for_response\(editor: EditorInterface, node: Node\) -> String:/);
  assert.match(context, /static func set_owner_recursive\(node: Node, owner: Node\) -> void:/);
  assert.match(creation, /preload\("niua_mcp_scene_node_instance_creation\.gd"\)/);
  assert.match(creation, /preload\("niua_mcp_scene_node_script_creation\.gd"\)/);
  assert.match(creation, /static func create_node\(editor: EditorInterface, body: Dictionary, path_validator: Callable\) -> Dictionary:/);
  assert.match(creation, /static func create_node_with_script\(editor: EditorInterface, body: Dictionary, path_validator: Callable, create_script: Callable, attach_script: Callable\) -> Dictionary:/);
  assert.match(creation, /NiuaMcpSceneNodeInstanceCreation\.create_node/);
  assert.match(creation, /NiuaMcpSceneNodeScriptCreation\.create_node_with_script/);
  assert.doesNotMatch(creation, /ClassDB\.instantiate/);
  assert.doesNotMatch(creation, /scriptTemplate/);
  assert.match(instanceCreation, /static func create_node\(editor: EditorInterface, body: Dictionary, path_validator: Callable\) -> Dictionary:/);
  assert.match(instanceCreation, /ClassDB\.instantiate/);
  assert.match(instanceCreation, /NiuaMcpVariantCodec\.json_to_variant/);
  assert.match(scriptCreation, /static func create_node_with_script\(editor: EditorInterface, body: Dictionary, path_validator: Callable, create_script: Callable, attach_script: Callable\) -> Dictionary:/);
  assert.match(scriptCreation, /NiuaMcpSceneNodeInstanceCreation\.create_node/);
  assert.match(scriptCreation, /NiuaMcpSceneNodeTreeOperations\.delete_node/);
  assert.match(scriptCreation, /scriptTemplate/);
  assert.match(scriptCreation, /scriptClassName/);
  assert.match(tree, /static func rename_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(tree, /static func delete_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(tree, /static func duplicate_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(tree, /static func reparent_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(tree, /static func reorder_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(tree, /NiuaMcpSceneNodeTreeBasicOperations\.duplicate_node/);
  assert.match(tree, /NiuaMcpSceneNodeTreeHierarchyOperations\.reorder_node/);
  assert.doesNotMatch(tree, /move_child/);
  assert.match(treeBasic, /duplicate\(\)/);
  assert.match(treeBasic, /set_owner_recursive/);
  assert.match(treeHierarchy, /move_child/);
  assert.match(treeHierarchy, /NiuaMcpNodeSnapshot\.sibling_order/);
  assert.match(sideEffects, /static func create_node_with_side_effects\(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /static func reorder_node_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /NiuaMcpSceneNodeCreationOperations\.create_node/);
  assert.match(sideEffects, /NiuaMcpSceneNodeTreeOperations\.reorder_node/);
});

test("Godot scene node tree operations delegate basic and hierarchy modules", async () => {
  const tree = await readAddonFile("niua_mcp_scene_node_tree_operations.gd");
  const basic = await readAddonFile("niua_mcp_scene_node_tree_basic_operations.gd");
  const hierarchy = await readAddonFile("niua_mcp_scene_node_tree_hierarchy_operations.gd");

  assert.match(tree, /preload\("niua_mcp_scene_node_tree_basic_operations\.gd"\)/);
  assert.match(tree, /preload\("niua_mcp_scene_node_tree_hierarchy_operations\.gd"\)/);
  assert.match(tree, /static func rename_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(tree, /static func delete_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(tree, /static func duplicate_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(tree, /static func reparent_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(tree, /static func reorder_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(tree, /move_child/);
  assert.doesNotMatch(tree, /queue_free/);
  assert.doesNotMatch(tree, /duplicate\(\)/);
  assert.doesNotMatch(tree, /global_transform/);
  assert.doesNotMatch(tree, /sibling_order/);

  assert.match(basic, /static func rename_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(basic, /static func delete_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(basic, /static func duplicate_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(basic, /queue_free/);
  assert.match(basic, /duplicate\(\)/);
  assert.match(basic, /set_owner_recursive/);

  assert.match(hierarchy, /static func reparent_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(hierarchy, /static func reorder_node\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(hierarchy, /global_transform/);
  assert.match(hierarchy, /move_child/);
  assert.match(hierarchy, /NiuaMcpNodeSnapshot\.sibling_order/);
});

test("Godot scene graph bridge side effects live in scene graph operations", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_scene_graph_operations.gd");
  const propertyOperations = await readAddonFile("niua_mcp_scene_property_operations.gd");
  const materialOperations = await readAddonFile("niua_mcp_scene_material_operations.gd");

  assert.match(operations, /static func create_scene_with_side_effects\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func create_node_with_side_effects\(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func create_node_with_script_with_side_effects\(editor: EditorInterface, body: Dictionary, path_validator: Callable, create_script: Callable, attach_script: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func rename_node_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func delete_node_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func duplicate_node_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func reparent_node_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func reorder_node_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func set_node_property_with_side_effects\(editor: EditorInterface, body: Dictionary, path_validator: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func assign_material_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func save_current_scene_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func save_scene_as_with_side_effects\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.create_scene_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.create_node_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.create_node_with_script_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.rename_node_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.delete_node_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.duplicate_node_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.reparent_node_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.reorder_node_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.set_node_property_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.assign_material_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.save_current_scene_with_side_effects/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.save_scene_as_with_side_effects/);
  assert.doesNotMatch(bridge, /Created scene %s/);
  assert.doesNotMatch(bridge, /Created %s node at %s/);
  assert.doesNotMatch(bridge, /Created %s with script %s/);
  assert.doesNotMatch(bridge, /Renamed %s to %s/);
  assert.doesNotMatch(bridge, /Deleted node %s/);
  assert.doesNotMatch(bridge, /Duplicated %s to %s/);
  assert.doesNotMatch(bridge, /Reparented %s to %s/);
  assert.doesNotMatch(bridge, /Reordered %s from index %d to %d/);
  assert.doesNotMatch(bridge, /Set %s on %s/);
  assert.doesNotMatch(bridge, /Assigned material %s to %s/);
  assert.doesNotMatch(bridge, /Saved scene %s/);
  assert.doesNotMatch(bridge, /Saved scene as %s/);
  assert.match(propertyOperations, /Set %s on %s/);
  assert.match(materialOperations, /Assigned material %s to %s/);
  assert.doesNotMatch(operations, /Set %s on %s/);
  assert.doesNotMatch(operations, /Assigned material %s to %s/);
});

test("Godot Variant JSON conversion lives in its own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const codec = await readAddonFile("niua_mcp_variant_codec.gd");
  const sceneInspectorOperations = await readAddonFile("niua_mcp_scene_inspector_operations.gd");
  const scenePropertyOperations = await readAddonFile("niua_mcp_scene_property_operations.gd");
  const scriptAnalysisOperations = await readAddonFile("niua_mcp_script_analysis_operations.gd");

  assert.doesNotMatch(bridge, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(sceneInspectorOperations, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(sceneInspectorOperations, /NiuaMcpVariantCodec\.variant_to_json/);
  assert.match(sceneInspectorOperations, /NiuaMcpVariantCodec\.variant_type_name/);
  assert.match(scenePropertyOperations, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(scenePropertyOperations, /NiuaMcpVariantCodec\.json_to_variant/);
  assert.match(scenePropertyOperations, /NiuaMcpVariantCodec\.variant_to_json/);
  assert.match(scriptAnalysisOperations, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(scriptAnalysisOperations, /NiuaMcpVariantCodec\.variant_to_json/);
  assert.doesNotMatch(bridge, /func _json_to_variant/);
  assert.doesNotMatch(bridge, /func _variant_to_json/);
  assert.doesNotMatch(bridge, /func _variant_type_name/);
  assert.match(codec, /extends RefCounted/);
  assert.match(codec, /static func json_to_variant\(value, path_validator: Callable = Callable\(\)\):/);
  assert.match(codec, /static func variant_to_json\(value\):/);
  assert.match(codec, /static func variant_type_name\(value\) -> String:/);
  assert.match(codec, /"Vector2"/);
  assert.match(codec, /"Vector3"/);
  assert.match(codec, /"Color"/);
  assert.match(codec, /"NodePath"/);
  assert.match(codec, /"Resource"/);
  assert.match(codec, /ResourceLoader\.load/);
});

test("Godot ConfigFile JSON conversion lives in its own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const codec = await readAddonFile("niua_mcp_config_file_codec.gd");
  const exportOperations = await readAddonFile("niua_mcp_export_operations.gd");

  assert.doesNotMatch(bridge, /preload\("niua_mcp_config_file_codec\.gd"\)/);
  assert.match(exportOperations, /preload\("niua_mcp_config_file_codec\.gd"\)/);
  assert.match(exportOperations, /NiuaMcpConfigFileCodec\.to_json/);
  assert.doesNotMatch(bridge, /func _config_file_to_json/);
  assert.match(codec, /extends RefCounted/);
  assert.match(codec, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(codec, /static func to_json\(config: ConfigFile\) -> Dictionary:/);
  assert.match(codec, /get_sections\(\)/);
  assert.match(codec, /get_section_keys\(section\)/);
  assert.match(codec, /NiuaMcpVariantCodec\.variant_to_json/);
});

test("Godot export preset metadata lives in its own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const exportPresets = await readAddonFile("niua_mcp_export_presets.gd");
  const exportOperations = await readAddonFile("niua_mcp_export_operations.gd");

  assert.match(exportOperations, /preload\("niua_mcp_export_presets\.gd"\)/);
  assert.match(exportOperations, /NiuaMcpExportPresets\.preset_summaries/);
  assert.match(exportOperations, /NiuaMcpExportPresets\.find_preset_index/);
  assert.match(exportOperations, /NiuaMcpExportPresets\.next_preset_index/);
  assert.match(exportOperations, /NiuaMcpExportPresets\.preset_summary/);
  assert.doesNotMatch(bridge, /func _export_preset_summaries/);
  assert.doesNotMatch(bridge, /func _find_export_preset_index/);
  assert.doesNotMatch(bridge, /func _next_export_preset_index/);
  assert.doesNotMatch(bridge, /func _export_preset_summary/);
  assert.match(exportPresets, /extends RefCounted/);
  assert.match(exportPresets, /static func preset_summaries\(sections: Dictionary\) -> Array:/);
  assert.match(exportPresets, /static func find_preset_index\(config: ConfigFile, name: String, platform: String\) -> int:/);
  assert.match(exportPresets, /static func next_preset_index\(config: ConfigFile\) -> int:/);
  assert.match(exportPresets, /static func preset_summary\(index: int, values: Dictionary, options: Dictionary\) -> Dictionary:/);
  assert.match(exportPresets, /get_sections\(\)/);
  assert.match(exportPresets, /exportPath/);
});

test("Godot export operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_export_operations.gd");
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");

  assert.match(bridge, /preload\("niua_mcp_export_operations\.gd"\)/);
  assert.match(readRoutes, /NiuaMcpExportOperations\.export_presets/);
  assert.match(bridge, /NiuaMcpExportOperations\.upsert_export_preset/);
  assert.doesNotMatch(bridge, /ConfigFile\.new\(\)/);
  assert.doesNotMatch(bridge, /config\.save\(path\)/);
  assert.match(operations, /extends RefCounted/);
  assert.match(operations, /preload\("niua_mcp_config_file_codec\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_export_presets\.gd"\)/);
  assert.match(operations, /static func export_presets\(\) -> Dictionary:/);
  assert.match(operations, /static func upsert_export_preset\(body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /const EXPORT_PRESETS_PATH := "res:\/\/export_presets\.cfg"/);
  assert.match(operations, /ConfigFile\.new\(\)/);
  assert.match(operations, /NiuaMcpConfigFileCodec\.to_json/);
  assert.match(operations, /NiuaMcpExportPresets\.preset_summaries/);
  assert.match(operations, /NiuaMcpExportPresets\.find_preset_index/);
  assert.match(operations, /NiuaMcpExportPresets\.next_preset_index/);
  assert.match(operations, /NiuaMcpExportPresets\.preset_summary/);
  assert.match(operations, /config\.save\(path\)/);
});

test("Godot path utilities live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const context = await readAddonFile("niua_mcp_bridge_context.gd");
  const filesystem = await readAddonFile("niua_mcp_filesystem_operations.gd");
  const filesystemBatchOperations = await readAddonFile("niua_mcp_filesystem_batch_operations.gd");
  const resourceGenericOperations = await readAddonFile("niua_mcp_resource_generic_operations.gd");
  const sceneDocumentOperations = await readAddonFile("niua_mcp_scene_document_operations.gd");
  const sceneMaterialOperations = await readAddonFile("niua_mcp_scene_material_operations.gd");
  const scriptEditorAuthoring = await readAddonFile("niua_mcp_script_editor_authoring_operations.gd");
  const scriptEditorNavigation = await readAddonFile("niua_mcp_script_editor_navigation_operations.gd");
  const pathUtils = await readAddonFile("niua_mcp_path_utils.gd");

  assert.doesNotMatch(bridge, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(context, /NiuaMcpPathUtils\.validate_res_path/);
  assert.match(scriptEditorAuthoring, /NiuaMcpPathUtils\.validate_script_path/);
  assert.match(scriptEditorNavigation, /NiuaMcpPathUtils\.validate_script_path/);
  assert.match(sceneDocumentOperations, /NiuaMcpPathUtils\.validate_scene_path/);
  assert.match(sceneMaterialOperations, /NiuaMcpPathUtils\.validate_res_path/);
  assert.match(resourceGenericOperations, /NiuaMcpPathUtils\.ensure_parent_directory/);
  assert.match(sceneDocumentOperations, /NiuaMcpPathUtils\.ensure_parent_directory/);
  assert.match(filesystemBatchOperations, /NiuaMcpPathUtils\.filesystem_entry_type/);
  assert.match(bridge, /func _validate_res_path\(raw_path: String, allow_root: bool = false\) -> Dictionary:\n\treturn NiuaMcpBridgeContext\.validate_res_path\(raw_path, allow_root\)/);
  assert.doesNotMatch(bridge, /func _validate_script_path/);
  assert.doesNotMatch(bridge, /func _validate_scene_path/);
  assert.doesNotMatch(bridge, /func _import_sidecar_path/);
  assert.doesNotMatch(bridge, /func _join_res_path/);
  assert.doesNotMatch(bridge, /func _ensure_parent_directory/);
  assert.doesNotMatch(bridge, /func _res_relative_path/);
  assert.doesNotMatch(bridge, /func _res_child_prefix/);
  assert.doesNotMatch(bridge, /func _filesystem_entry_exists/);
  assert.doesNotMatch(bridge, /func _filesystem_entry_type/);
  assert.match(pathUtils, /extends RefCounted/);
  assert.match(pathUtils, /static func validate_res_path\(raw_path: String, allow_root: bool = false\) -> Dictionary:/);
  assert.match(pathUtils, /static func validate_script_path\(raw_path: String\) -> Dictionary:/);
  assert.match(pathUtils, /static func validate_scene_path\(raw_path: String\) -> Dictionary:/);
  assert.match(pathUtils, /static func import_sidecar_path\(path: String\) -> String:/);
  assert.match(pathUtils, /static func join_res_path\(base_path: String, name: String\) -> String:/);
  assert.match(pathUtils, /static func ensure_parent_directory\(path: String\) -> int:/);
  assert.match(pathUtils, /static func res_relative_path\(path: String\) -> String:/);
  assert.match(pathUtils, /static func res_child_prefix\(path: String\) -> String:/);
  assert.match(pathUtils, /static func filesystem_entry_exists\(path: String\) -> bool:/);
  assert.match(pathUtils, /static func filesystem_entry_type\(path: String\) -> String:/);
  assert.match(pathUtils, /path traversal is not allowed/);
  assert.match(pathUtils, /script path must end with \.gd/);
  assert.match(pathUtils, /scene path must end with \.tscn or \.scn/);
  assert.match(pathUtils, /ProjectSettings\.globalize_path/);
  assert.match(pathUtils, /DirAccess\.make_dir_recursive_absolute/);
});

test("Godot node snapshots live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const editorStateOperations = await readAddonFile("niua_mcp_editor_state_operations.gd");
  const sceneNodeTreeOperations = await readAddonFile("niua_mcp_scene_node_tree_operations.gd");
  const sceneNodeTreeHierarchyOperations = await readAddonFile("niua_mcp_scene_node_tree_hierarchy_operations.gd");
  const sceneGraphContext = await readAddonFile("niua_mcp_scene_graph_context.gd");
  const snapshots = await readAddonFile("niua_mcp_node_snapshot.gd");

  assert.doesNotMatch(bridge, /preload\("niua_mcp_node_snapshot\.gd"\)/);
  assert.match(editorStateOperations, /preload\("niua_mcp_node_snapshot\.gd"\)/);
  assert.match(sceneGraphContext, /NiuaMcpNodeSnapshot\.selection_item/);
  assert.match(editorStateOperations, /NiuaMcpNodeSnapshot\.serialize_node/);
  assert.doesNotMatch(sceneNodeTreeOperations, /NiuaMcpNodeSnapshot\.sibling_order/);
  assert.match(sceneNodeTreeHierarchyOperations, /NiuaMcpNodeSnapshot\.sibling_order/);
  assert.match(bridge, /func _node_path_for_response\(node: Node\) -> String:\n\treturn NiuaMcpBridgeContext\.node_path_for_response\(_editor, node\)/);
  assert.doesNotMatch(bridge, /func _selection_item/);
  assert.doesNotMatch(bridge, /func _serialize_node/);
  assert.doesNotMatch(bridge, /func _node_groups/);
  assert.doesNotMatch(bridge, /func _node_metadata_keys/);
  assert.doesNotMatch(bridge, /func _sibling_order/);
  assert.match(snapshots, /extends RefCounted/);
  assert.match(snapshots, /static func selection_item\(node: Node, root: Node, selected_index: int = -1\) -> Dictionary:/);
  assert.match(snapshots, /static func node_groups\(node: Node\) -> Array:/);
  assert.match(snapshots, /static func node_metadata_keys\(node: Node\) -> Array:/);
  assert.match(snapshots, /static func node_path_for_response\(node: Node, root: Node\) -> String:/);
  assert.match(snapshots, /static func serialize_node\(node: Node, root: Node, max_depth: int = 0, depth: int = 0\) -> Dictionary:/);
  assert.match(snapshots, /childrenTruncated/);
  assert.match(snapshots, /static func sibling_order\(parent: Node\) -> Array:/);
  assert.match(snapshots, /selectedIndex/);
  assert.match(snapshots, /ownerSceneFilePath/);
  assert.match(snapshots, /metadataKeys/);
  assert.match(snapshots, /uniqueNameInOwner/);
  assert.match(snapshots, /children/);
});

test("Godot node type operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_node_type_operations.gd");
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");

  assert.match(readRoutes, /preload\("niua_mcp_node_type_operations\.gd"\)/);
  assert.match(readRoutes, /NiuaMcpNodeTypeOperations\.search_node_types/);
  assert.doesNotMatch(bridge, /ClassDB\.get_class_list/);
  assert.doesNotMatch(bridge, /func _class_inheritance_chain/);
  assert.match(operations, /extends RefCounted/);
  assert.match(operations, /static func search_node_types\(query: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func class_inheritance_chain\(type_name: String, stop_type: String = ""\) -> Array:/);
  assert.match(operations, /ClassDB\.get_class_list/);
  assert.match(operations, /ClassDB\.get_parent_class/);
  assert.match(operations, /ClassDB\.is_parent_class/);
  assert.match(operations, /ClassDB\.can_instantiate/);
  assert.match(operations, /ClassDB\.is_class_enabled/);
  assert.match(operations, /includeDisabled/);
  assert.match(operations, /enabled/);
  assert.match(operations, /isBaseType/);
});

test("Godot project settings metadata lives in its own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const metadata = await readAddonFileExact("niua_mcp_project_settings_metadata.gd");
  const queryMetadata = await readAddonFile("niua_mcp_project_settings_query_metadata.gd");
  const summaryMetadata = await readAddonFile("niua_mcp_project_settings_summary_metadata.gd");
  const categoryMetadata = await readAddonFile("niua_mcp_project_settings_category_metadata.gd");
  const operations = await readAddonFile("niua_mcp_project_settings_operations.gd");

  assert.match(operations, /preload\("niua_mcp_project_settings_metadata\.gd"\)/);
  assert.match(operations, /NiuaMcpProjectSettingsMetadata\.optional_query_bool/);
  assert.match(operations, /NiuaMcpProjectSettingsMetadata\.optional_filter_value/);
  assert.match(operations, /NiuaMcpProjectSettingsMetadata\.setting_summary/);
  assert.match(operations, /NiuaMcpProjectSettingsMetadata\.setting_matches_filters/);
  assert.match(operations, /NiuaMcpProjectSettingsMetadata\.settings_categories/);
  assert.doesNotMatch(bridge, /func _project_setting_matches_filters/);
  assert.doesNotMatch(bridge, /func _project_setting_matches_query/);
  assert.doesNotMatch(bridge, /func _bool_filter_mismatch/);
  assert.doesNotMatch(bridge, /func _optional_query_bool/);
  assert.doesNotMatch(bridge, /func _optional_filter_value/);
  assert.doesNotMatch(bridge, /func _project_setting_summary/);
  assert.doesNotMatch(bridge, /func _project_settings_categories/);
  assert.doesNotMatch(bridge, /func _project_setting_section/);
  assert.doesNotMatch(bridge, /func _path_segments/);
  assert.match(metadata, /extends RefCounted/);
  assert.match(metadata, /preload\("niua_mcp_project_settings_query_metadata\.gd"\)/);
  assert.match(metadata, /preload\("niua_mcp_project_settings_summary_metadata\.gd"\)/);
  assert.match(metadata, /preload\("niua_mcp_project_settings_category_metadata\.gd"\)/);
  assert.match(metadata, /static func optional_query_bool\(query: Dictionary, key: String\) -> Dictionary:/);
  assert.match(metadata, /static func optional_filter_value\(filter: Dictionary\):/);
  assert.match(metadata, /static func setting_summary\(name: String, property: Dictionary\) -> Dictionary:/);
  assert.match(metadata, /static func setting_matches_filters\(setting: Dictionary, search_text: String, editor_visible_filter: Dictionary, basic_filter: Dictionary, internal_filter: Dictionary, restart_filter: Dictionary\) -> bool:/);
  assert.match(metadata, /static func settings_categories\(settings: Array\) -> Array:/);
  assert.match(metadata, /NiuaMcpProjectSettingsQueryMetadata\.optional_query_bool/);
  assert.match(metadata, /NiuaMcpProjectSettingsQueryMetadata\.optional_filter_value/);
  assert.match(metadata, /NiuaMcpProjectSettingsSummaryMetadata\.setting_summary/);
  assert.match(metadata, /NiuaMcpProjectSettingsQueryMetadata\.setting_matches_filters/);
  assert.match(metadata, /NiuaMcpProjectSettingsCategoryMetadata\.settings_categories/);
  assert.doesNotMatch(metadata, /ProjectSettings\.get_setting/);
  assert.doesNotMatch(metadata, /ProjectSettings\.get_order/);
  assert.doesNotMatch(metadata, /JSON\.stringify/);
  assert.doesNotMatch(metadata, /category_order/);
  assert.doesNotMatch(metadata, /static func _path_segments/);
  assert.doesNotMatch(metadata, /static func _project_setting_section/);
  assert.doesNotMatch(metadata, /static func _project_setting_matches_query/);
  assert.doesNotMatch(metadata, /static func _bool_filter_mismatch/);

  assert.match(queryMetadata, /extends RefCounted/);
  assert.match(queryMetadata, /static func optional_query_bool\(query: Dictionary, key: String\) -> Dictionary:/);
  assert.match(queryMetadata, /static func optional_filter_value\(filter: Dictionary\):/);
  assert.match(queryMetadata, /static func setting_matches_filters\(setting: Dictionary, search_text: String, editor_visible_filter: Dictionary, basic_filter: Dictionary, internal_filter: Dictionary, restart_filter: Dictionary\) -> bool:/);
  assert.match(queryMetadata, /static func _project_setting_matches_query/);
  assert.match(queryMetadata, /static func _bool_filter_mismatch/);
  assert.match(queryMetadata, /JSON\.stringify/);

  assert.match(summaryMetadata, /extends RefCounted/);
  assert.match(summaryMetadata, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(summaryMetadata, /preload\("niua_mcp_property_metadata\.gd"\)/);
  assert.match(summaryMetadata, /static func setting_summary\(name: String, property: Dictionary\) -> Dictionary:/);
  assert.match(summaryMetadata, /static func _path_segments/);
  assert.match(summaryMetadata, /static func _project_setting_section/);
  assert.match(summaryMetadata, /ProjectSettings\.get_setting/);
  assert.match(summaryMetadata, /ProjectSettings\.get_order/);
  assert.match(summaryMetadata, /PROPERTY_USAGE_RESTART_IF_CHANGED/);
  assert.match(summaryMetadata, /NiuaMcpPropertyMetadata\.usage_flags/);
  assert.match(summaryMetadata, /NiuaMcpVariantCodec\.variant_to_json/);

  assert.match(categoryMetadata, /extends RefCounted/);
  assert.match(categoryMetadata, /static func settings_categories\(settings: Array\) -> Array:/);
  assert.match(categoryMetadata, /category_order/);
  assert.match(categoryMetadata, /_sectionOrder/);
  assert.match(categoryMetadata, /_sectionsByPath/);
  assert.match(categoryMetadata, /settingCount/);
});

test("Godot project settings operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_project_settings_operations.gd");
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");

  assert.match(bridge, /preload\("niua_mcp_project_settings_operations\.gd"\)/);
  assert.match(readRoutes, /NiuaMcpProjectSettingsOperations\.project_settings/);
  assert.match(bridge, /NiuaMcpProjectSettingsOperations\.set_project_setting/);
  assert.match(bridge, /NiuaMcpProjectSettingsOperations\.set_project_setting_metadata/);
  assert.match(readRoutes, /NiuaMcpProjectSettingsOperations\.input_map/);
  assert.match(bridge, /NiuaMcpProjectSettingsOperations\.set_input_action/);
  assert.doesNotMatch(bridge, /ProjectSettings\.set_order/);
  assert.doesNotMatch(bridge, /InputMap\.add_action/);
  assert.match(operations, /extends RefCounted/);
  assert.match(operations, /preload\("niua_mcp_input_event_codec\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_project_settings_metadata\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(operations, /static func project_settings\(query: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func set_project_setting\(body: Dictionary, path_validator: Callable, save_project_settings: Callable\) -> Dictionary:/);
  assert.match(operations, /static func set_project_setting_metadata\(body: Dictionary, path_validator: Callable, save_project_settings: Callable\) -> Dictionary:/);
  assert.match(operations, /static func input_map\(\) -> Dictionary:/);
  assert.match(operations, /static func set_input_action\(body: Dictionary, save_project_settings: Callable\) -> Dictionary:/);
  assert.match(operations, /ProjectSettings\.set_setting/);
  assert.match(operations, /ProjectSettings\.set_order/);
  assert.match(operations, /ProjectSettings\.set_initial_value/);
  assert.match(operations, /ProjectSettings\.set_as_basic/);
  assert.match(operations, /ProjectSettings\.set_as_internal/);
  assert.match(operations, /ProjectSettings\.set_restart_if_changed/);
  assert.match(operations, /InputMap\.add_action/);
  assert.match(operations, /NiuaMcpInputEventCodec\.event_from_json/);
  assert.match(operations, /NiuaMcpInputEventCodec\.events_to_json/);
});

test("Godot project settings bridge side effects live in project settings operations", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_project_settings_operations.gd");

  assert.match(operations, /static func set_project_setting_with_side_effects\(body: Dictionary, path_validator: Callable, save_project_settings: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func set_project_setting_metadata_with_side_effects\(body: Dictionary, path_validator: Callable, save_project_settings: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func set_input_action_with_side_effects\(body: Dictionary, save_project_settings: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(bridge, /NiuaMcpProjectSettingsOperations\.set_project_setting_with_side_effects/);
  assert.match(bridge, /NiuaMcpProjectSettingsOperations\.set_project_setting_metadata_with_side_effects/);
  assert.match(bridge, /NiuaMcpProjectSettingsOperations\.set_input_action_with_side_effects/);
  assert.doesNotMatch(bridge, /Set project setting %s/);
  assert.doesNotMatch(bridge, /Set project setting metadata %s/);
  assert.doesNotMatch(bridge, /Set input action %s/);
});

test("Godot project settings operations delegate focused domain modules", async () => {
  const facade = await readAddonFileExact("niua_mcp_project_settings_operations.gd");
  const state = await readAddonFile("niua_mcp_project_settings_state_operations.gd");
  const mutations = await readAddonFile("niua_mcp_project_setting_mutation_operations.gd");
  const inputMap = await readAddonFile("niua_mcp_input_map_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_project_settings_side_effects.gd");
  const utils = await readAddonFile("niua_mcp_project_settings_utils.gd");

  assert.match(facade, /preload\("niua_mcp_project_settings_state_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_project_setting_mutation_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_input_map_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_project_settings_side_effects\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_project_settings_utils\.gd"\)/);
  assert.match(facade, /static func project_settings\(query: Dictionary\) -> Dictionary:/);
  assert.match(facade, /static func set_project_setting\(body: Dictionary, path_validator: Callable, save_project_settings: Callable\) -> Dictionary:/);
  assert.match(facade, /static func set_project_setting_metadata\(body: Dictionary, path_validator: Callable, save_project_settings: Callable\) -> Dictionary:/);
  assert.match(facade, /static func input_map\(\) -> Dictionary:/);
  assert.match(facade, /static func set_input_action\(body: Dictionary, save_project_settings: Callable\) -> Dictionary:/);
  assert.match(facade, /static func set_project_setting_with_side_effects\(body: Dictionary, path_validator: Callable, save_project_settings: Callable, remember: Callable\) -> Dictionary:/);
  assert.doesNotMatch(facade, /ProjectSettings\.set_setting/);
  assert.doesNotMatch(facade, /ProjectSettings\.set_order/);
  assert.doesNotMatch(facade, /InputMap\.add_action/);
  assert.doesNotMatch(facade, /Set project setting %s/);

  assert.match(state, /preload\("niua_mcp_project_settings_metadata\.gd"\)/);
  assert.match(state, /static func project_settings\(query: Dictionary\) -> Dictionary:/);
  assert.match(state, /ProjectSettings\.get_property_list/);
  assert.match(state, /NiuaMcpProjectSettingsMetadata\.optional_query_bool/);
  assert.match(state, /NiuaMcpProjectSettingsMetadata\.setting_matches_filters/);
  assert.match(state, /NiuaMcpProjectSettingsMetadata\.settings_categories/);

  assert.match(mutations, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(mutations, /preload\("niua_mcp_project_settings_utils\.gd"\)/);
  assert.match(mutations, /static func set_project_setting\(body: Dictionary, path_validator: Callable, save_project_settings: Callable\) -> Dictionary:/);
  assert.match(mutations, /static func set_project_setting_metadata\(body: Dictionary, path_validator: Callable, save_project_settings: Callable\) -> Dictionary:/);
  assert.match(mutations, /ProjectSettings\.set_setting/);
  assert.match(mutations, /ProjectSettings\.set_order/);
  assert.match(mutations, /ProjectSettings\.set_initial_value/);
  assert.match(mutations, /ProjectSettings\.set_as_basic/);
  assert.match(mutations, /ProjectSettings\.set_as_internal/);
  assert.match(mutations, /ProjectSettings\.set_restart_if_changed/);
  assert.match(mutations, /save_project_settings\.call/);

  assert.match(inputMap, /preload\("niua_mcp_input_event_codec\.gd"\)/);
  assert.match(inputMap, /preload\("niua_mcp_project_settings_utils\.gd"\)/);
  assert.match(inputMap, /static func input_map\(\) -> Dictionary:/);
  assert.match(inputMap, /static func set_input_action\(body: Dictionary, save_project_settings: Callable\) -> Dictionary:/);
  assert.match(inputMap, /InputMap\.get_actions/);
  assert.match(inputMap, /InputMap\.add_action/);
  assert.match(inputMap, /ProjectSettings\.set_setting\("input\/%s"/);
  assert.match(inputMap, /NiuaMcpInputEventCodec\.event_from_json/);
  assert.match(inputMap, /NiuaMcpInputEventCodec\.events_to_json/);

  assert.match(sideEffects, /preload\("niua_mcp_project_setting_mutation_operations\.gd"\)/);
  assert.match(sideEffects, /preload\("niua_mcp_input_map_operations\.gd"\)/);
  assert.match(sideEffects, /preload\("niua_mcp_project_settings_utils\.gd"\)/);
  assert.match(sideEffects, /static func set_project_setting_with_side_effects\(body: Dictionary, path_validator: Callable, save_project_settings: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /static func set_project_setting_metadata_with_side_effects\(body: Dictionary, path_validator: Callable, save_project_settings: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /static func set_input_action_with_side_effects\(body: Dictionary, save_project_settings: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /Set project setting %s/);
  assert.match(sideEffects, /Set project setting metadata %s/);
  assert.match(sideEffects, /Set input action %s/);

  assert.match(utils, /static func remember\(remember: Callable, message: String\) -> void:/);
  assert.match(utils, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(utils, /errorCode/);
});

test("Godot JSON argument helpers live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const jsonArgs = await readAddonFile("niua_mcp_json_args.gd");
  const jsonArgErrors = await readAddonFile("niua_mcp_json_arg_errors.gd");
  const jsonScalarArgs = await readAddonFile("niua_mcp_json_scalar_args.gd");
  const jsonVector2iArgs = await readAddonFile("niua_mcp_json_vector2i_args.gd");
  const jsonTypedVariantArgs = await readAddonFile("niua_mcp_json_typed_variant_args.gd");
  const tileSetBuilder = await readAddonFile("niua_mcp_tile_set_builder.gd");
  const tileSetTerrainBuilder = await readAddonFile("niua_mcp_tile_set_terrain_builder.gd");
  const tileSetPhysicsBuilder = await readAddonFile("niua_mcp_tile_set_physics_builder.gd");
  const tileMapLayerCells = await readAddonFile("niua_mcp_tile_map_layer_cell_operations.gd");
  const tileMapLayerTerrain = await readAddonFile("niua_mcp_tile_map_layer_terrain_operations.gd");
  const viewportCameraOperations = await readAddonFile("niua_mcp_viewport_camera_operations.gd");

  assert.match(tileSetBuilder, /preload\("niua_mcp_json_args\.gd"\)/);
  assert.match(tileSetBuilder, /NiuaMcpJsonArgs\.vector2i_from_json/);
  assert.match(tileSetTerrainBuilder, /NiuaMcpJsonArgs\.integer/);
  assert.match(tileSetPhysicsBuilder, /NiuaMcpJsonArgs\.integer/);
  assert.match(tileSetPhysicsBuilder, /NiuaMcpJsonArgs\.non_negative_number/);
  assert.match(tileMapLayerCells, /NiuaMcpJsonArgs\.vector2i_from_json/);
  assert.match(tileMapLayerCells, /NiuaMcpJsonArgs\.vector2i_to_json/);
  assert.match(tileMapLayerTerrain, /NiuaMcpJsonArgs\.vector2i_from_json/);
  assert.match(viewportCameraOperations, /NiuaMcpJsonArgs\.typed_vector2/);
  assert.match(viewportCameraOperations, /NiuaMcpJsonArgs\.typed_vector3/);
  assert.match(tileSetTerrainBuilder, /NiuaMcpJsonArgs\.typed_color/);
  assert.doesNotMatch(bridge, /func _json_integer/);
  assert.doesNotMatch(bridge, /func _json_non_negative_number/);
  assert.doesNotMatch(bridge, /func _vector2i_from_json/);
  assert.doesNotMatch(bridge, /func _vector2i_to_json/);
  assert.doesNotMatch(bridge, /func _typed_vector2/);
  assert.doesNotMatch(bridge, /func _typed_vector3/);
  assert.doesNotMatch(bridge, /func _typed_color/);
  assert.match(jsonArgs, /extends RefCounted/);
  assert.match(jsonArgs, /preload\("niua_mcp_json_scalar_args\.gd"\)/);
  assert.match(jsonArgs, /preload\("niua_mcp_json_vector2i_args\.gd"\)/);
  assert.match(jsonArgs, /preload\("niua_mcp_json_typed_variant_args\.gd"\)/);
  assert.match(jsonArgs, /static func integer\(value, field_name: String\) -> Dictionary:/);
  assert.match(jsonArgs, /static func non_negative_number\(value, field_name: String\) -> Dictionary:/);
  assert.match(jsonArgs, /static func vector2i_from_json\(value, field_name: String, fallback: Vector2i = Vector2i.ZERO, positive: bool = false\) -> Dictionary:/);
  assert.match(jsonArgs, /static func vector2i_to_json\(value: Vector2i\) -> Dictionary:/);
  assert.match(jsonArgs, /static func typed_vector2\(value, field_name: String, path_validator: Callable = Callable\(\)\) -> Dictionary:/);
  assert.match(jsonArgs, /static func typed_vector3\(value, field_name: String, path_validator: Callable = Callable\(\)\) -> Dictionary:/);
  assert.match(jsonArgs, /static func typed_color\(value, field_name: String, path_validator: Callable = Callable\(\)\) -> Dictionary:/);
  assert.doesNotMatch(jsonArgs, /must be an integer/);
  assert.doesNotMatch(jsonArgs, /json_to_variant/);

  assert.match(jsonArgErrors, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(jsonArgErrors, /errorCode/);

  assert.match(jsonScalarArgs, /preload\("niua_mcp_json_arg_errors\.gd"\)/);
  assert.match(jsonScalarArgs, /static func integer\(value, field_name: String\) -> Dictionary:/);
  assert.match(jsonScalarArgs, /static func non_negative_number\(value, field_name: String\) -> Dictionary:/);
  assert.match(jsonScalarArgs, /must be an integer/);
  assert.match(jsonScalarArgs, /must be non-negative/);

  assert.match(jsonVector2iArgs, /preload\("niua_mcp_json_scalar_args\.gd"\)/);
  assert.match(jsonVector2iArgs, /preload\("niua_mcp_json_arg_errors\.gd"\)/);
  assert.match(jsonVector2iArgs, /static func vector2i_from_json\(value, field_name: String, fallback: Vector2i = Vector2i.ZERO, positive: bool = false\) -> Dictionary:/);
  assert.match(jsonVector2iArgs, /static func vector2i_to_json\(value: Vector2i\) -> Dictionary:/);
  assert.doesNotMatch(jsonVector2iArgs, /typed_vector2/);

  assert.match(jsonTypedVariantArgs, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(jsonTypedVariantArgs, /preload\("niua_mcp_json_arg_errors\.gd"\)/);
  assert.match(jsonTypedVariantArgs, /static func typed_vector2\(value, field_name: String, path_validator: Callable = Callable\(\)\) -> Dictionary:/);
  assert.match(jsonTypedVariantArgs, /static func typed_vector3\(value, field_name: String, path_validator: Callable = Callable\(\)\) -> Dictionary:/);
  assert.match(jsonTypedVariantArgs, /static func typed_color\(value, field_name: String, path_validator: Callable = Callable\(\)\) -> Dictionary:/);
  assert.match(jsonTypedVariantArgs, /must be a typed Vector2 JSON value/);
});

test("Godot filesystem operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const filesystem = await readAddonFile("niua_mcp_filesystem_operations.gd");
  const filesystemBatchOperations = await readAddonFile("niua_mcp_filesystem_batch_operations.gd");
  const filesystemStateOperations = await readAddonFile("niua_mcp_filesystem_state_operations.gd");
  const filesystemCopyOperations = await readAddonFile("niua_mcp_filesystem_copy_operations.gd");
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");

  assert.match(bridge, /preload\("niua_mcp_filesystem_operations\.gd"\)/);
  assert.match(readRoutes, /NiuaMcpFilesystemOperations\.list_filesystem/);
  assert.match(bridge, /NiuaMcpFilesystemOperations\.create_folder/);
  assert.match(readRoutes, /NiuaMcpFilesystemOperations\.read_text_file/);
  assert.match(bridge, /NiuaMcpFilesystemOperations\.write_text_file/);
  assert.match(bridge, /NiuaMcpFilesystemOperations\.write_binary_file/);
  assert.match(bridge, /NiuaMcpFilesystemOperations\.move_entry/);
  assert.match(bridge, /NiuaMcpFilesystemOperations\.copy_entry/);
  assert.match(bridge, /NiuaMcpFilesystemOperations\.batch_operations/);
  assert.doesNotMatch(bridge, /NiuaMcpFilesystemOperations\.batch_operation_message/);
  assert.match(bridge, /NiuaMcpFilesystemOperations\.delete_entry/);
  assert.match(readRoutes, /NiuaMcpFilesystemOperations\.filesystem_state/);
  assert.doesNotMatch(bridge, /func _list_directory_entries/);
  assert.doesNotMatch(bridge, /func _copy_file_entry/);
  assert.doesNotMatch(bridge, /func _copy_directory_recursive/);
  assert.doesNotMatch(bridge, /func _execute_filesystem_batch_operation/);
  assert.doesNotMatch(bridge, /func _dry_run_filesystem_batch_operation/);
  assert.doesNotMatch(bridge, /func _dry_run_filesystem_copy_operation/);
  assert.doesNotMatch(bridge, /func _dry_run_filesystem_move_operation/);
  assert.doesNotMatch(bridge, /func _dry_run_filesystem_delete_operation/);
  assert.doesNotMatch(bridge, /func _filesystem_batch_result/);
  assert.doesNotMatch(bridge, /func _filesystem_batch_error/);
  assert.doesNotMatch(bridge, /func _filesystem_batch_operation_message/);
  assert.doesNotMatch(bridge, /get_selected_paths/);
  assert.doesNotMatch(bridge, /get_current_path/);
  assert.doesNotMatch(bridge, /get_current_directory/);
  assert.doesNotMatch(bridge, /is_scanning/);
  assert.doesNotMatch(bridge, /get_scanning_progress/);
  assert.match(filesystem, /extends RefCounted/);
  assert.match(filesystem, /preload\("niua_mcp_filesystem_result\.gd"\)/);
  assert.match(filesystem, /preload\("niua_mcp_filesystem_state_operations\.gd"\)/);
  assert.match(filesystem, /preload\("niua_mcp_filesystem_read_operations\.gd"\)/);
  assert.match(filesystem, /preload\("niua_mcp_filesystem_mutation_operations\.gd"\)/);
  assert.match(filesystem, /preload\("niua_mcp_filesystem_copy_operations\.gd"\)/);
  assert.match(filesystem, /preload\("niua_mcp_filesystem_side_effects\.gd"\)/);
  assert.match(filesystem, /static func filesystem_state\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(filesystem, /static func list_filesystem\(query: Dictionary\) -> Dictionary:/);
  assert.match(filesystem, /static func create_folder\(body: Dictionary\) -> Dictionary:/);
  assert.match(filesystem, /static func read_text_file\(query: Dictionary\) -> Dictionary:/);
  assert.match(filesystem, /static func write_text_file\(body: Dictionary\) -> Dictionary:/);
  assert.match(filesystem, /static func write_binary_file\(body: Dictionary\) -> Dictionary:/);
  assert.match(filesystem, /static func move_entry\(body: Dictionary\) -> Dictionary:/);
  assert.match(filesystem, /static func copy_entry\(body: Dictionary\) -> Dictionary:/);
  assert.match(filesystem, /static func batch_operations\(body: Dictionary\) -> Dictionary:/);
  assert.match(filesystem, /static func batch_operation_message\(operation: Dictionary\) -> String:/);
  assert.match(filesystem, /static func delete_entry\(body: Dictionary\) -> Dictionary:/);
  assert.match(filesystem, /static func directory_entries\(path: String, recursive: bool, exclude: PackedStringArray = PackedStringArray\(\), max_depth: int = 0, depth: int = 1\) -> Array:/);
  assert.match(filesystemCopyOperations, /copy_absolute/);
  assert.match(filesystemBatchOperations, /continueOnError/);
  assert.match(filesystemBatchOperations, /dryRun/);
  assert.match(filesystemBatchOperations, /processedCount/);
  assert.match(filesystemCopyOperations, /copiedEntries/);
  assert.match(filesystemCopyOperations, /NiuaMcpPathUtils\.filesystem_entry_exists/);
  assert.match(filesystemStateOperations, /get_selected_paths/);
  assert.match(filesystemStateOperations, /get_current_path/);
  assert.match(filesystemStateOperations, /get_current_directory/);
  assert.match(filesystemStateOperations, /is_scanning/);
  assert.match(filesystemStateOperations, /get_scanning_progress/);
});

test("Godot filesystem operations delegate focused domain modules", async () => {
  const facade = await readAddonFile("niua_mcp_filesystem_operations.gd");
  const result = await readAddonFile("niua_mcp_filesystem_result.gd");
  const state = await readAddonFile("niua_mcp_filesystem_state_operations.gd");
  const read = await readAddonFile("niua_mcp_filesystem_read_operations.gd");
  const mutation = await readAddonFile("niua_mcp_filesystem_mutation_operations.gd");
  const copy = await readAddonFile("niua_mcp_filesystem_copy_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_filesystem_side_effects.gd");
  const batch = await readAddonFile("niua_mcp_filesystem_batch_operations.gd");

  assert.match(facade, /preload\("niua_mcp_filesystem_result\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_filesystem_state_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_filesystem_read_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_filesystem_mutation_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_filesystem_copy_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_filesystem_side_effects\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_filesystem_batch_operations\.gd"\)/);
  assert.match(facade, /NiuaMcpFilesystemStateOperations\.filesystem_state/);
  assert.match(facade, /NiuaMcpFilesystemReadOperations\.list_filesystem/);
  assert.match(facade, /NiuaMcpFilesystemReadOperations\.read_text_file/);
  assert.match(facade, /NiuaMcpFilesystemMutationOperations\.create_folder/);
  assert.match(facade, /NiuaMcpFilesystemMutationOperations\.write_text_file/);
  assert.match(facade, /NiuaMcpFilesystemMutationOperations\.write_binary_file/);
  assert.match(facade, /NiuaMcpFilesystemMutationOperations\.move_entry/);
  assert.match(facade, /NiuaMcpFilesystemMutationOperations\.delete_entry/);
  assert.match(facade, /NiuaMcpFilesystemCopyOperations\.copy_entry/);
  assert.match(facade, /NiuaMcpFilesystemReadOperations\.directory_entries/);
  assert.match(facade, /NiuaMcpFilesystemSideEffects\.batch_operations_with_side_effects/);
  assert.match(facade, /NiuaMcpFilesystemBatchOperations\.batch_operations/);
  assert.match(facade, /static func filesystem_state\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(facade, /static func list_filesystem\(query: Dictionary\) -> Dictionary:/);
  assert.match(facade, /static func create_folder\(body: Dictionary\) -> Dictionary:/);
  assert.match(facade, /static func read_text_file\(query: Dictionary\) -> Dictionary:/);
  assert.match(facade, /static func write_text_file\(body: Dictionary\) -> Dictionary:/);
  assert.match(facade, /static func write_binary_file\(body: Dictionary\) -> Dictionary:/);
  assert.match(facade, /static func move_entry\(body: Dictionary\) -> Dictionary:/);
  assert.match(facade, /static func copy_entry\(body: Dictionary\) -> Dictionary:/);
  assert.match(facade, /static func batch_operations\(body: Dictionary\) -> Dictionary:/);
  assert.match(facade, /static func batch_operation_message\(operation: Dictionary\) -> String:/);
  assert.match(facade, /static func delete_entry\(body: Dictionary\) -> Dictionary:/);
  assert.match(facade, /static func directory_entries\(path: String, recursive: bool, exclude: PackedStringArray = PackedStringArray\(\), max_depth: int = 0, depth: int = 1\) -> Array:/);
  assert.doesNotMatch(facade, /get_selected_paths/);
  assert.doesNotMatch(facade, /directory\.list_dir_begin/);
  assert.doesNotMatch(facade, /FileAccess\.open/);
  assert.doesNotMatch(facade, /DirAccess\.copy_absolute/);
  assert.doesNotMatch(facade, /func _copy_file_entry/);
  assert.doesNotMatch(facade, /func _copy_directory_recursive/);
  assert.doesNotMatch(facade, /func _refresh/);
  assert.doesNotMatch(facade, /func _remember/);

  assert.match(result, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(state, /static func filesystem_state\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(state, /get_selected_paths/);
  assert.match(state, /get_current_path/);
  assert.match(state, /get_current_directory/);
  assert.match(state, /is_scanning/);
  assert.match(state, /get_scanning_progress/);
  assert.match(read, /static func list_filesystem\(query: Dictionary\) -> Dictionary:/);
  assert.match(read, /static func read_text_file\(query: Dictionary\) -> Dictionary:/);
  assert.match(read, /static func directory_entries\(path: String, recursive: bool, exclude: PackedStringArray = PackedStringArray\(\), max_depth: int = 0, depth: int = 1\) -> Array:/);
  assert.match(read, /directory\.list_dir_begin/);
  assert.match(read, /FileAccess\.open\(path, FileAccess\.READ\)/);
  assert.match(mutation, /static func create_folder\(body: Dictionary\) -> Dictionary:/);
  assert.match(mutation, /static func write_text_file\(body: Dictionary\) -> Dictionary:/);
  assert.match(mutation, /static func write_binary_file\(body: Dictionary\) -> Dictionary:/);
  assert.match(mutation, /Marshalls\.base64_to_raw/);
  assert.match(mutation, /static func move_entry\(body: Dictionary\) -> Dictionary:/);
  assert.match(mutation, /static func delete_entry\(body: Dictionary\) -> Dictionary:/);
  assert.match(mutation, /DirAccess\.make_dir_recursive_absolute/);
  assert.match(mutation, /FileAccess\.open\(path, FileAccess\.WRITE\)/);
  assert.match(copy, /static func copy_entry\(body: Dictionary\) -> Dictionary:/);
  assert.match(copy, /static func _copy_file_entry/);
  assert.match(copy, /static func _copy_directory_recursive/);
  assert.match(copy, /DirAccess\.copy_absolute/);
  assert.match(copy, /copiedEntries/);
  assert.match(sideEffects, /static func create_folder_with_side_effects\(body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /static func batch_operations_with_side_effects\(body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /NiuaMcpFilesystemMutationOperations\.create_folder/);
  assert.match(sideEffects, /NiuaMcpFilesystemCopyOperations\.copy_entry/);
  assert.match(sideEffects, /_remember\(remember, "Batch filesystem operations completed: %d"/);
  assert.match(sideEffects, /static func _refresh\(refresh_filesystem: Callable, path: String = ""\) -> void:/);
  assert.match(batch, /static func batch_operations\(body: Dictionary, copy_entry: Callable, move_entry: Callable, delete_entry: Callable\) -> Dictionary:/);
});

test("Godot filesystem batch operations live in their own Godot module", async () => {
  const filesystem = await readAddonFile("niua_mcp_filesystem_operations.gd");
  const batchOperations = await readAddonFile("niua_mcp_filesystem_batch_operations.gd");
  const copyOperations = await readAddonFile("niua_mcp_filesystem_copy_operations.gd");

  assert.match(filesystem, /preload\("niua_mcp_filesystem_batch_operations\.gd"\)/);
  assert.match(filesystem, /NiuaMcpFilesystemBatchOperations\.batch_operations/);
  assert.match(filesystem, /NiuaMcpFilesystemBatchOperations\.batch_operation_message/);
  assert.doesNotMatch(filesystem, /static func _execute_filesystem_batch_operation/);
  assert.doesNotMatch(filesystem, /static func _dry_run_filesystem_batch_operation/);
  assert.doesNotMatch(filesystem, /static func _dry_run_filesystem_copy_operation/);
  assert.doesNotMatch(filesystem, /static func _dry_run_filesystem_move_operation/);
  assert.doesNotMatch(filesystem, /static func _dry_run_filesystem_delete_operation/);
  assert.doesNotMatch(filesystem, /static func _filesystem_batch_result/);
  assert.doesNotMatch(filesystem, /static func _filesystem_batch_error/);
  assert.match(filesystem, /static func copy_entry\(body: Dictionary\) -> Dictionary:/);
  assert.match(filesystem, /static func move_entry\(body: Dictionary\) -> Dictionary:/);
  assert.match(filesystem, /static func delete_entry\(body: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(filesystem, /static func _copy_file_entry/);
  assert.doesNotMatch(filesystem, /static func _copy_directory_recursive/);
  assert.match(copyOperations, /static func _copy_file_entry/);
  assert.match(copyOperations, /static func _copy_directory_recursive/);

  assert.match(batchOperations, /extends RefCounted/);
  assert.match(batchOperations, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(batchOperations, /static func batch_operations\(body: Dictionary, copy_entry: Callable, move_entry: Callable, delete_entry: Callable\) -> Dictionary:/);
  assert.match(batchOperations, /static func batch_operation_message\(operation: Dictionary\) -> String:/);
  assert.match(batchOperations, /copy_entry\.call\(operation\)/);
  assert.match(batchOperations, /move_entry\.call\(operation\)/);
  assert.match(batchOperations, /delete_entry\.call\(operation\)/);
  assert.match(batchOperations, /static func _execute_filesystem_batch_operation/);
  assert.match(batchOperations, /static func _dry_run_filesystem_batch_operation/);
  assert.match(batchOperations, /static func _dry_run_filesystem_copy_operation/);
  assert.match(batchOperations, /static func _dry_run_filesystem_move_operation/);
  assert.match(batchOperations, /static func _dry_run_filesystem_delete_operation/);
  assert.match(batchOperations, /static func _filesystem_batch_result/);
  assert.match(batchOperations, /static func _filesystem_batch_error/);
  assert.match(batchOperations, /continueOnError/);
  assert.match(batchOperations, /dryRun/);
  assert.match(batchOperations, /processedCount/);
});

test("Godot filesystem batch operations delegate focused domain modules", async () => {
  const facade = await readAddonFileExact("niua_mcp_filesystem_batch_operations.gd");
  const runner = await readAddonFile("niua_mcp_filesystem_batch_runner.gd");
  const executor = await readAddonFile("niua_mcp_filesystem_batch_executor.gd");
  const dryRun = await readAddonFile("niua_mcp_filesystem_batch_dry_run.gd");
  const result = await readAddonFile("niua_mcp_filesystem_batch_result.gd");

  assert.match(facade, /preload\("niua_mcp_filesystem_batch_runner\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_filesystem_batch_executor\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_filesystem_batch_dry_run\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_filesystem_batch_result\.gd"\)/);
  assert.match(facade, /static func batch_operations\(body: Dictionary, copy_entry: Callable, move_entry: Callable, delete_entry: Callable\) -> Dictionary:/);
  assert.match(facade, /static func batch_operation_message\(operation: Dictionary\) -> String:/);
  assert.match(facade, /NiuaMcpFilesystemBatchRunner\.batch_operations/);
  assert.match(facade, /NiuaMcpFilesystemBatchResult\.batch_operation_message/);
  assert.doesNotMatch(facade, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.doesNotMatch(facade, /validate_res_path/);
  assert.doesNotMatch(facade, /copy_entry\.call/);
  assert.doesNotMatch(facade, /static func _dry_run_filesystem_batch_operation/);

  assert.match(runner, /preload\("niua_mcp_filesystem_batch_executor\.gd"\)/);
  assert.match(runner, /preload\("niua_mcp_filesystem_batch_result\.gd"\)/);
  assert.match(runner, /static func batch_operations\(body: Dictionary, copy_entry: Callable, move_entry: Callable, delete_entry: Callable\) -> Dictionary:/);
  assert.match(runner, /continueOnError/);
  assert.match(runner, /dryRun/);
  assert.match(runner, /processedCount/);
  assert.match(runner, /NiuaMcpFilesystemBatchExecutor\._execute_filesystem_batch_operation/);

  assert.match(executor, /preload\("niua_mcp_filesystem_batch_dry_run\.gd"\)/);
  assert.match(executor, /preload\("niua_mcp_filesystem_batch_result\.gd"\)/);
  assert.match(executor, /static func _execute_filesystem_batch_operation/);
  assert.match(executor, /copy_entry\.call\(operation\)/);
  assert.match(executor, /move_entry\.call\(operation\)/);
  assert.match(executor, /delete_entry\.call\(operation\)/);
  assert.match(executor, /NiuaMcpFilesystemBatchDryRun\._dry_run_filesystem_batch_operation/);

  assert.match(dryRun, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(dryRun, /preload\("niua_mcp_filesystem_batch_result\.gd"\)/);
  assert.match(dryRun, /static func _dry_run_filesystem_batch_operation/);
  assert.match(dryRun, /static func _dry_run_filesystem_copy_operation/);
  assert.match(dryRun, /static func _dry_run_filesystem_move_operation/);
  assert.match(dryRun, /static func _dry_run_filesystem_delete_operation/);
  assert.match(dryRun, /validate_res_path/);
  assert.match(dryRun, /filesystem_entry_type/);
  assert.match(dryRun, /res_child_prefix/);

  assert.match(result, /static func batch_operation_message\(operation: Dictionary\) -> String:/);
  assert.match(result, /static func _filesystem_batch_result/);
  assert.match(result, /static func _filesystem_batch_error/);
  assert.match(result, /static func _error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(result, /Copied %s to %s/);
  assert.match(result, /Moved %s to %s/);
  assert.match(result, /Deleted filesystem entry %s/);
});

test("Godot filesystem bridge side effects live in filesystem operations", async () => {
  const bridge = await readBridgeWriteSurface();
  const filesystem = await readAddonFile("niua_mcp_filesystem_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_filesystem_side_effects.gd");
  const writeSchema = await readPluginFileTest("../../src/godot-mcp/tools/filesystem/schemas/write.js");
  const writeTextBlock = sideEffects.slice(
    sideEffects.indexOf("static func write_text_file_with_side_effects"),
    sideEffects.indexOf("static func write_binary_file_with_side_effects")
  );

  assert.match(filesystem, /static func create_folder_with_side_effects\(body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(filesystem, /static func write_text_file_with_side_effects\(body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(filesystem, /static func write_binary_file_with_side_effects\(body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(filesystem, /static func move_entry_with_side_effects\(body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(filesystem, /static func copy_entry_with_side_effects\(body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(filesystem, /static func batch_operations_with_side_effects\(body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(filesystem, /static func delete_entry_with_side_effects\(body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /_remember\(remember, "Created folder %s"/);
  assert.match(writeTextBlock, /_refresh\(refresh_filesystem, path\)/);
  assert.match(writeTextBlock, /refreshAfterWrite/);
  assert.match(writeTextBlock, /refreshRequested/);
  assert.match(writeTextBlock, /refreshPath/);
  assert.match(sideEffects, /_refresh\(refresh_filesystem, path\)/);
  assert.match(sideEffects, /refreshAfterWrite/);
  assert.match(sideEffects, /refreshRequested/);
  assert.match(sideEffects, /refreshPath/);
  assert.match(writeSchema, /refreshAfterWrite/);
  assert.match(sideEffects, /_remember\(remember, "Batch filesystem operations completed: %d"/);
  assert.doesNotMatch(bridge, /Created folder %s/);
  assert.doesNotMatch(bridge, /Moved %s to %s/);
  assert.doesNotMatch(bridge, /Copied %s to %s/);
  assert.doesNotMatch(bridge, /Deleted filesystem entry %s/);
  assert.doesNotMatch(bridge, /Batch filesystem operations completed: %d/);
});

test("Godot SpriteFrames builder lives in its own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const builder = await readAddonFile("niua_mcp_sprite_frames_builder.gd");
  const animationBuilder = await readAddonFile("niua_mcp_sprite_frames_animation_builder.gd");
  const frameBuilder = await readAddonFile("niua_mcp_sprite_frames_frame_builder.gd");
  const sheetBuilder = await readAddonFile("niua_mcp_sprite_frames_sheet_builder.gd");
  const spriteFramesOperations = await readAddonFile("niua_mcp_resource_sprite_frames_operations.gd");

  assert.doesNotMatch(bridge, /preload\("niua_mcp_sprite_frames_builder\.gd"\)/);
  assert.match(spriteFramesOperations, /preload\("niua_mcp_sprite_frames_builder\.gd"\)/);
  assert.match(spriteFramesOperations, /NiuaMcpSpriteFramesBuilder\.build/);
  assert.doesNotMatch(bridge, /func _sprite_frames_animation_frames/);
  assert.doesNotMatch(bridge, /func _expand_sprite_sheet_frames/);
  assert.doesNotMatch(bridge, /func _infer_sprite_sheet_grid/);
  assert.doesNotMatch(bridge, /func _sprite_frame_texture_from_frame/);
  assert.match(builder, /extends RefCounted/);
  assert.match(builder, /preload\("niua_mcp_sprite_frames_animation_builder\.gd"\)/);
  assert.match(builder, /static func build\(body: Dictionary\) -> Dictionary:/);
  assert.match(builder, /SpriteFrames\.new\(\)/);
  assert.doesNotMatch(builder, /AtlasTexture\.new\(\)/);
  assert.doesNotMatch(builder, /typed_vector2/);
  assert.doesNotMatch(builder, /variant_to_json/);
  assert.match(animationBuilder, /add_animation/);
  assert.match(animationBuilder, /add_frame/);
  assert.match(animationBuilder, /frameCount/);
  assert.match(frameBuilder, /AtlasTexture\.new\(\)/);
  assert.match(frameBuilder, /set_atlas/);
  assert.match(frameBuilder, /set_region/);
  assert.match(frameBuilder, /set_filter_clip/);
  assert.match(sheetBuilder, /typed_vector2/);
  assert.match(sheetBuilder, /variant_to_json/);
  assert.match(sheetBuilder, /frameSize/);
  assert.match(sheetBuilder, /frameCount/);
});

test("Godot SpriteFrames builder delegates focused domain modules", async () => {
  const builder = await readAddonFile("niua_mcp_sprite_frames_builder.gd");
  const animationBuilder = await readAddonFile("niua_mcp_sprite_frames_animation_builder.gd");
  const frameBuilder = await readAddonFile("niua_mcp_sprite_frames_frame_builder.gd");
  const sheetBuilder = await readAddonFileExact("niua_mcp_sprite_frames_sheet_builder.gd");
  const sheetGrid = await readAddonFile("niua_mcp_sprite_frames_sheet_grid.gd");
  const sheetExpander = await readAddonFile("niua_mcp_sprite_frames_sheet_expander.gd");
  const utils = await readAddonFile("niua_mcp_sprite_frames_utils.gd");

  assert.match(builder, /preload\("niua_mcp_sprite_frames_animation_builder\.gd"\)/);
  assert.match(builder, /NiuaMcpSpriteFramesAnimationBuilder\.add_animation/);
  assert.doesNotMatch(builder, /static func _expand_sprite_sheet_frames/);
  assert.doesNotMatch(builder, /static func _frame_texture_from_frame/);

  assert.match(animationBuilder, /static func add_animation\(sprite_frames: SpriteFrames, animation: Dictionary, seen_animation_names: Dictionary\) -> Dictionary:/);
  assert.match(animationBuilder, /NiuaMcpSpriteFramesFrameBuilder\.animation_frames/);
  assert.match(animationBuilder, /NiuaMcpSpriteFramesFrameBuilder\.frame_texture_from_frame/);
  assert.match(frameBuilder, /static func animation_frames\(animation: Dictionary, animation_name: String\) -> Dictionary:/);
  assert.match(frameBuilder, /static func frame_texture_from_frame/);
  assert.match(frameBuilder, /NiuaMcpSpriteFramesSheetBuilder\.expand_sprite_sheet_frames/);
  assert.match(sheetBuilder, /preload\("niua_mcp_sprite_frames_sheet_grid\.gd"\)/);
  assert.match(sheetBuilder, /preload\("niua_mcp_sprite_frames_sheet_expander\.gd"\)/);
  assert.match(sheetBuilder, /static func expand_sprite_sheet_frames/);
  assert.match(sheetBuilder, /static func infer_sprite_sheet_grid/);
  assert.match(sheetBuilder, /NiuaMcpSpriteFramesSheetExpander\.expand_sprite_sheet_frames/);
  assert.match(sheetBuilder, /NiuaMcpSpriteFramesSheetGrid\.infer_sprite_sheet_grid/);
  assert.doesNotMatch(sheetBuilder, /NiuaMcpJsonArgs\.typed_vector2/);
  assert.doesNotMatch(sheetBuilder, /NiuaMcpVariantCodec\.variant_to_json/);
  assert.doesNotMatch(sheetBuilder, /NiuaMcpSpriteFramesUtils\.load_texture2d/);
  assert.doesNotMatch(sheetBuilder, /Texture2D/);
  assert.doesNotMatch(sheetBuilder, /floor/);
  assert.doesNotMatch(sheetBuilder, /exceeds texture bounds/);
  assert.match(sheetGrid, /static func infer_sprite_sheet_grid\(sheet: Dictionary, texture: Texture2D, animation_name: String\) -> Dictionary:/);
  assert.match(sheetGrid, /NiuaMcpJsonArgs\.typed_vector2/);
  assert.match(sheetGrid, /columns/);
  assert.match(sheetGrid, /rows/);
  assert.match(sheetGrid, /frameCount/);
  assert.match(sheetGrid, /exceeds texture bounds/);
  assert.match(sheetGrid, /textureSize/);
  assert.match(sheetExpander, /static func expand_sprite_sheet_frames\(raw_sheet, animation_name: String\) -> Dictionary:/);
  assert.match(sheetExpander, /NiuaMcpSpriteFramesUtils\.load_texture2d/);
  assert.match(sheetExpander, /NiuaMcpSpriteFramesSheetGrid\.infer_sprite_sheet_grid/);
  assert.match(sheetExpander, /NiuaMcpVariantCodec\.variant_to_json/);
  assert.match(sheetExpander, /"region"/);
  assert.match(sheetExpander, /"sheet"/);
  assert.match(utils, /static func load_texture2d/);
  assert.match(utils, /static func error/);
});

test("Godot TileSet builder lives in its own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const builder = await readAddonFile("niua_mcp_tile_set_builder.gd");
  const sourceBuilder = await readAddonFile("niua_mcp_tile_set_source_builder.gd");
  const tileBuilder = await readAddonFile("niua_mcp_tile_set_tile_builder.gd");
  const terrainBuilder = await readAddonFileExact("niua_mcp_tile_set_terrain_builder.gd");
  const physicsBuilder = await readAddonFile("niua_mcp_tile_set_physics_builder.gd");
  const tileSetOperations = await readAddonFile("niua_mcp_resource_tile_set_operations.gd");

  assert.doesNotMatch(bridge, /preload\("niua_mcp_tile_set_builder\.gd"\)/);
  assert.match(tileSetOperations, /preload\("niua_mcp_tile_set_builder\.gd"\)/);
  assert.match(tileSetOperations, /NiuaMcpTileSetBuilder\.build/);
  assert.doesNotMatch(bridge, /func _apply_tile_set_terrain_sets/);
  assert.doesNotMatch(bridge, /func _apply_tile_terrain/);
  assert.doesNotMatch(bridge, /func _apply_tile_set_physics_layers/);
  assert.doesNotMatch(bridge, /func _apply_tile_collision_polygons/);
  assert.match(builder, /extends RefCounted/);
  assert.match(builder, /preload\("niua_mcp_json_args\.gd"\)/);
  assert.match(builder, /preload\("niua_mcp_tile_set_source_builder\.gd"\)/);
  assert.match(builder, /preload\("niua_mcp_tile_set_terrain_builder\.gd"\)/);
  assert.match(builder, /preload\("niua_mcp_tile_set_physics_builder\.gd"\)/);
  assert.match(builder, /static func build\(body: Dictionary\) -> Dictionary:/);
  assert.match(builder, /TileSet\.new\(\)/);
  assert.match(builder, /NiuaMcpTileSetSourceBuilder\.build_source/);
  assert.doesNotMatch(builder, /ResourceLoader\.load/);
  assert.doesNotMatch(builder, /TileSetAtlasSource\.new\(\)/);
  assert.doesNotMatch(builder, /create_tile/);
  assert.match(builder, /NiuaMcpTileSetTerrainBuilder\.apply_terrain_sets/);
  assert.match(builder, /NiuaMcpTileSetPhysicsBuilder\.apply_physics_layers/);
  assert.doesNotMatch(builder, /NiuaMcpTileSetTerrainBuilder\.apply_tile_terrain/);
  assert.doesNotMatch(builder, /NiuaMcpTileSetPhysicsBuilder\.apply_collision_polygons/);
  assert.doesNotMatch(builder, /static func _apply_terrain_sets/);
  assert.doesNotMatch(builder, /static func _apply_tile_terrain/);
  assert.doesNotMatch(builder, /static func _apply_physics_layers/);
  assert.doesNotMatch(builder, /static func _apply_collision_polygons/);
  assert.match(sourceBuilder, /extends RefCounted/);
  assert.match(sourceBuilder, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(sourceBuilder, /preload\("niua_mcp_tile_set_tile_builder\.gd"\)/);
  assert.match(sourceBuilder, /static func build_source\(tile_set: TileSet, source: Dictionary, source_index: int, tile_size: Vector2i\) -> Dictionary:/);
  assert.match(sourceBuilder, /ResourceLoader\.load/);
  assert.match(sourceBuilder, /TileSetAtlasSource\.new\(\)/);
  assert.match(sourceBuilder, /NiuaMcpTileSetTileBuilder\.build_tile/);
  assert.match(sourceBuilder, /add_source/);
  assert.match(sourceBuilder, /sourceId/);
  assert.match(tileBuilder, /extends RefCounted/);
  assert.match(tileBuilder, /static func build_tile/);
  assert.match(tileBuilder, /create_tile/);
  assert.match(tileBuilder, /NiuaMcpTileSetTerrainBuilder\.apply_tile_terrain/);
  assert.match(tileBuilder, /NiuaMcpTileSetPhysicsBuilder\.apply_collision_polygons/);
  assert.match(terrainBuilder, /extends RefCounted/);
  assert.match(terrainBuilder, /preload\("niua_mcp_tile_set_terrain_sets_builder\.gd"\)/);
  assert.match(terrainBuilder, /preload\("niua_mcp_tile_set_tile_terrain_builder\.gd"\)/);
  assert.match(terrainBuilder, /static func apply_terrain_sets\(tile_set: TileSet, raw_terrain_sets\) -> Dictionary:/);
  assert.match(terrainBuilder, /static func apply_tile_terrain/);
  assert.match(terrainBuilder, /NiuaMcpTileSetTerrainSetsBuilder\.apply_terrain_sets/);
  assert.match(terrainBuilder, /NiuaMcpTileSetTileTerrainBuilder\.apply_tile_terrain/);
  assert.doesNotMatch(terrainBuilder, /add_terrain_set/);
  assert.doesNotMatch(terrainBuilder, /set_terrain_set_mode/);
  assert.doesNotMatch(terrainBuilder, /set_terrain_name/);
  assert.doesNotMatch(terrainBuilder, /set_terrain_color/);
  assert.doesNotMatch(terrainBuilder, /set_terrain_peering_bit/);
  assert.doesNotMatch(terrainBuilder, /is_valid_terrain_peering_bit/);
  assert.doesNotMatch(terrainBuilder, /typed_color/);
  assert.match(physicsBuilder, /extends RefCounted/);
  assert.match(physicsBuilder, /static func apply_physics_layers\(tile_set: TileSet, raw_layers\) -> Dictionary:/);
  assert.match(physicsBuilder, /static func apply_collision_polygons/);
  assert.match(physicsBuilder, /add_physics_layer/);
  assert.match(physicsBuilder, /set_physics_layer_collision_layer/);
  assert.match(physicsBuilder, /set_physics_layer_collision_mask/);
  assert.match(physicsBuilder, /set_physics_layer_physics_material/);
  assert.match(physicsBuilder, /add_collision_polygon/);
  assert.match(physicsBuilder, /set_collision_polygon_points/);
  assert.match(physicsBuilder, /typed_vector2/);
});

test("Godot TileSet builder delegates terrain and physics helpers", async () => {
  const builder = await readAddonFile("niua_mcp_tile_set_builder.gd");
  const sourceBuilder = await readAddonFile("niua_mcp_tile_set_source_builder.gd");
  const tileBuilder = await readAddonFile("niua_mcp_tile_set_tile_builder.gd");
  const terrainBuilder = await readAddonFile("niua_mcp_tile_set_terrain_builder.gd");
  const physicsBuilder = await readAddonFile("niua_mcp_tile_set_physics_builder.gd");

  assert.match(builder, /preload\("niua_mcp_tile_set_source_builder\.gd"\)/);
  assert.match(builder, /preload\("niua_mcp_tile_set_terrain_builder\.gd"\)/);
  assert.match(builder, /preload\("niua_mcp_tile_set_physics_builder\.gd"\)/);
  assert.match(builder, /NiuaMcpTileSetSourceBuilder\.build_source/);
  assert.match(builder, /NiuaMcpTileSetTerrainBuilder\.apply_terrain_sets/);
  assert.match(builder, /NiuaMcpTileSetPhysicsBuilder\.apply_physics_layers/);
  assert.doesNotMatch(builder, /NiuaMcpTileSetTerrainBuilder\.apply_tile_terrain/);
  assert.doesNotMatch(builder, /NiuaMcpTileSetPhysicsBuilder\.apply_collision_polygons/);
  assert.doesNotMatch(builder, /static func _apply_terrain_sets/);
  assert.doesNotMatch(builder, /static func _apply_tile_terrain/);
  assert.doesNotMatch(builder, /static func _apply_physics_layers/);
  assert.doesNotMatch(builder, /static func _apply_collision_polygons/);
  assert.match(sourceBuilder, /NiuaMcpTileSetTileBuilder\.build_tile/);
  assert.match(tileBuilder, /NiuaMcpTileSetTerrainBuilder\.apply_tile_terrain/);
  assert.match(tileBuilder, /NiuaMcpTileSetPhysicsBuilder\.apply_collision_polygons/);
  assert.match(terrainBuilder, /static func apply_terrain_sets/);
  assert.match(terrainBuilder, /static func apply_tile_terrain/);
  assert.match(terrainBuilder, /set_terrain_peering_bit/);
  assert.match(terrainBuilder, /typed_color/);
  assert.match(physicsBuilder, /static func apply_physics_layers/);
  assert.match(physicsBuilder, /static func apply_collision_polygons/);
  assert.match(physicsBuilder, /set_collision_polygon_points/);
  assert.match(physicsBuilder, /typed_vector2/);
});

test("Godot TileSet physics builder delegates focused domain modules", async () => {
  const facade = await readAddonFileExact("niua_mcp_tile_set_physics_builder.gd");
  const layerBuilder = await readAddonFile("niua_mcp_tile_set_physics_layer_builder.gd");
  const collisionBuilder = await readAddonFile("niua_mcp_tile_set_collision_polygon_builder.gd");
  const collisionSettings = await readAddonFile("niua_mcp_tile_set_collision_polygon_settings.gd");
  const collisionPoints = await readAddonFile("niua_mcp_tile_set_collision_polygon_points.gd");
  const utils = await readAddonFile("niua_mcp_tile_set_physics_utils.gd");

  assert.match(facade, /preload\("niua_mcp_tile_set_physics_layer_builder\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_tile_set_collision_polygon_builder\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_tile_set_physics_utils\.gd"\)/);
  assert.match(facade, /static func apply_physics_layers\(tile_set: TileSet, raw_layers\) -> Dictionary:/);
  assert.match(facade, /static func apply_collision_polygons/);
  assert.match(facade, /NiuaMcpTileSetPhysicsLayerBuilder\.apply_physics_layers/);
  assert.match(facade, /NiuaMcpTileSetCollisionPolygonBuilder\.apply_collision_polygons/);
  assert.doesNotMatch(facade, /add_physics_layer/);
  assert.doesNotMatch(facade, /add_collision_polygon/);
  assert.doesNotMatch(facade, /validate_res_path/);
  assert.doesNotMatch(facade, /typed_vector2/);

  assert.match(layerBuilder, /preload\("niua_mcp_json_args\.gd"\)/);
  assert.match(layerBuilder, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(layerBuilder, /preload\("niua_mcp_tile_set_physics_utils\.gd"\)/);
  assert.match(layerBuilder, /static func apply_physics_layers\(tile_set: TileSet, raw_layers\) -> Dictionary:/);
  assert.match(layerBuilder, /add_physics_layer/);
  assert.match(layerBuilder, /set_physics_layer_collision_layer/);
  assert.match(layerBuilder, /set_physics_layer_collision_mask/);
  assert.match(layerBuilder, /set_physics_layer_collision_priority/);
  assert.match(layerBuilder, /set_physics_layer_physics_material/);
  assert.match(layerBuilder, /validate_res_path/);
  assert.match(layerBuilder, /PhysicsMaterial/);

  assert.doesNotMatch(collisionBuilder, /preload\("niua_mcp_json_args\.gd"\)/);
  assert.match(collisionBuilder, /preload\("niua_mcp_tile_set_collision_polygon_settings\.gd"\)/);
  assert.match(collisionBuilder, /preload\("niua_mcp_tile_set_collision_polygon_points\.gd"\)/);
  assert.match(collisionBuilder, /preload\("niua_mcp_tile_set_physics_utils\.gd"\)/);
  assert.match(collisionBuilder, /static func apply_collision_polygons/);
  assert.match(collisionBuilder, /NiuaMcpTileSetCollisionPolygonSettings\.parse_layer/);
  assert.match(collisionBuilder, /NiuaMcpTileSetCollisionPolygonSettings\.parse_one_way_margin/);
  assert.match(collisionBuilder, /NiuaMcpTileSetCollisionPolygonPoints\.parse_points/);
  assert.match(collisionBuilder, /add_collision_polygon/);
  assert.match(collisionBuilder, /set_collision_polygon_points/);
  assert.match(collisionBuilder, /set_collision_polygon_one_way/);
  assert.doesNotMatch(collisionBuilder, /typed_vector2/);
  assert.doesNotMatch(collisionBuilder, /variant_to_json/);

  assert.match(collisionSettings, /static func parse_layer/);
  assert.match(collisionSettings, /static func parse_one_way_margin/);
  assert.match(collisionSettings, /preload\("niua_mcp_json_args\.gd"\)/);
  assert.match(collisionSettings, /get_physics_layers_count/);
  assert.match(collisionSettings, /non_negative_number/);

  assert.match(collisionPoints, /static func parse_points/);
  assert.match(collisionPoints, /preload\("niua_mcp_json_args\.gd"\)/);
  assert.match(collisionPoints, /PackedVector2Array/);
  assert.match(collisionPoints, /typed_vector2/);
  assert.match(collisionPoints, /variant_to_json/);

  assert.match(utils, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(utils, /errorCode/);
});

test("Godot TileSet terrain builder delegates focused terrain modules", async () => {
  const terrainFacade = await readAddonFileExact("niua_mcp_tile_set_terrain_builder.gd");
  const terrainSets = await readAddonFile("niua_mcp_tile_set_terrain_sets_builder.gd");
  const tileTerrain = await readAddonFile("niua_mcp_tile_set_tile_terrain_builder.gd");
  const peering = await readAddonFile("niua_mcp_tile_set_terrain_peering_builder.gd");
  const utils = await readAddonFile("niua_mcp_tile_set_terrain_utils.gd");

  assert.match(terrainFacade, /preload\("niua_mcp_tile_set_terrain_sets_builder\.gd"\)/);
  assert.match(terrainFacade, /preload\("niua_mcp_tile_set_tile_terrain_builder\.gd"\)/);
  assert.match(terrainFacade, /NiuaMcpTileSetTerrainSetsBuilder\.apply_terrain_sets/);
  assert.match(terrainFacade, /NiuaMcpTileSetTileTerrainBuilder\.apply_tile_terrain/);
  assert.doesNotMatch(terrainFacade, /set_terrain_peering_bit/);
  assert.doesNotMatch(terrainFacade, /is_valid_terrain_peering_bit/);
  assert.doesNotMatch(terrainFacade, /typed_color/);

  assert.match(terrainSets, /extends RefCounted/);
  assert.match(terrainSets, /preload\("niua_mcp_json_args\.gd"\)/);
  assert.match(terrainSets, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(terrainSets, /static func apply_terrain_sets\(tile_set: TileSet, raw_terrain_sets\) -> Dictionary:/);
  assert.match(terrainSets, /add_terrain_set/);
  assert.match(terrainSets, /set_terrain_set_mode/);
  assert.match(terrainSets, /set_terrain_name/);
  assert.match(terrainSets, /set_terrain_color/);
  assert.match(terrainSets, /typed_color/);

  assert.match(tileTerrain, /extends RefCounted/);
  assert.match(tileTerrain, /preload\("niua_mcp_tile_set_terrain_peering_builder\.gd"\)/);
  assert.match(tileTerrain, /static func apply_tile_terrain/);
  assert.match(tileTerrain, /get_tile_data/);
  assert.match(tileTerrain, /set_terrain_set/);
  assert.match(tileTerrain, /set_terrain/);
  assert.match(tileTerrain, /NiuaMcpTileSetTerrainPeeringBuilder\.apply_peering_bits/);

  assert.match(peering, /extends RefCounted/);
  assert.match(peering, /static func apply_peering_bits/);
  assert.match(peering, /is_valid_terrain_peering_bit/);
  assert.match(peering, /set_terrain_peering_bit/);
  assert.match(peering, /neighbor must be between 0 and 15/);

  assert.match(utils, /extends RefCounted/);
  assert.match(utils, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
});

test("Godot TileMapLayer operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const tileMapLayerOperations = await readAddonFile("niua_mcp_tile_map_layer_operations.gd");
  const tileMapLayerCells = await readAddonFile("niua_mcp_tile_map_layer_cell_operations.gd");
  const tileMapLayerTerrain = await readAddonFile("niua_mcp_tile_map_layer_terrain_operations.gd");

  assert.match(bridge, /preload\("niua_mcp_tile_map_layer_operations\.gd"\)/);
  assert.match(bridge, /NiuaMcpTileMapLayerOperations\.set_cells/);
  assert.match(bridge, /NiuaMcpTileMapLayerOperations\.paint_terrain/);
  assert.doesNotMatch(bridge, /set_cell\(/);
  assert.doesNotMatch(bridge, /erase_cell\(/);
  assert.doesNotMatch(bridge, /set_cells_terrain_connect/);
  assert.doesNotMatch(bridge, /set_cells_terrain_path/);
  assert.match(tileMapLayerOperations, /extends RefCounted/);
  assert.match(tileMapLayerOperations, /static func set_cells\(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary\) -> Dictionary:/);
  assert.match(tileMapLayerOperations, /static func paint_terrain\(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(tileMapLayerOperations, /preload\("niua_mcp_json_args\.gd"\)/);
  assert.doesNotMatch(tileMapLayerOperations, /set_cell\(/);
  assert.doesNotMatch(tileMapLayerOperations, /erase_cell\(/);
  assert.doesNotMatch(tileMapLayerOperations, /set_cells_terrain_connect/);
  assert.doesNotMatch(tileMapLayerOperations, /set_cells_terrain_path/);
  assert.match(tileMapLayerCells, /set_cell/);
  assert.match(tileMapLayerCells, /erase_cell/);
  assert.match(tileMapLayerTerrain, /set_cells_terrain_connect/);
  assert.match(tileMapLayerTerrain, /set_cells_terrain_path/);
  assert.match(tileMapLayerCells, /notify_layer_update/);
  assert.match(tileMapLayerTerrain, /notify_layer_update/);
});

test("Godot TileMapLayer operations delegate context cell and terrain modules", async () => {
  const operations = await readAddonFile("niua_mcp_tile_map_layer_operations.gd");
  const context = await readAddonFile("niua_mcp_tile_map_layer_context.gd");
  const cells = await readAddonFile("niua_mcp_tile_map_layer_cell_operations.gd");
  const terrain = await readAddonFile("niua_mcp_tile_map_layer_terrain_operations.gd");

  assert.match(operations, /preload\("niua_mcp_tile_map_layer_context\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_tile_map_layer_cell_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_tile_map_layer_terrain_operations\.gd"\)/);
  assert.match(operations, /static func set_cells\(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func paint_terrain\(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(operations, /NiuaMcpJsonArgs/);
  assert.doesNotMatch(operations, /set_cell\(/);
  assert.doesNotMatch(operations, /erase_cell\(/);
  assert.doesNotMatch(operations, /set_cells_terrain_connect/);
  assert.doesNotMatch(operations, /set_cells_terrain_path/);
  assert.doesNotMatch(operations, /static func _error/);

  assert.match(context, /static func resolve_layer\(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary\) -> Dictionary:/);
  assert.match(context, /static func notify_layer_update\(layer: TileMapLayer\) -> void:/);
  assert.match(context, /static func remember\(remember: Callable, message: String\) -> void:/);
  assert.match(context, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(context, /node is not a TileMapLayer/);

  assert.match(cells, /static func set_cells\(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary\) -> Dictionary:/);
  assert.match(cells, /preload\("niua_mcp_json_args\.gd"\)/);
  assert.match(cells, /preload\("niua_mcp_tile_map_layer_context\.gd"\)/);
  assert.match(cells, /set_cell/);
  assert.match(cells, /erase_cell/);
  assert.match(cells, /vector2i_from_json/);
  assert.match(cells, /vector2i_to_json/);
  assert.match(cells, /notify_layer_update/);

  assert.match(terrain, /static func paint_terrain\(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary\) -> Dictionary:/);
  assert.match(terrain, /preload\("niua_mcp_json_args\.gd"\)/);
  assert.match(terrain, /preload\("niua_mcp_tile_map_layer_context\.gd"\)/);
  assert.match(terrain, /set_cells_terrain_connect/);
  assert.match(terrain, /set_cells_terrain_path/);
  assert.match(terrain, /mode must be connect or path/);
  assert.match(terrain, /notify_layer_update/);
});

test("Godot TileMapLayer bridge side effects live in TileMapLayer operations", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_tile_map_layer_operations.gd");

  assert.match(operations, /static func set_cells_with_side_effects\(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func paint_terrain_with_side_effects\(resolve_node: Callable, node_path_for_response: Callable, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(bridge, /NiuaMcpTileMapLayerOperations\.set_cells_with_side_effects/);
  assert.match(bridge, /NiuaMcpTileMapLayerOperations\.paint_terrain_with_side_effects/);
  assert.doesNotMatch(bridge, /Updated TileMapLayer cells at %s/);
  assert.doesNotMatch(bridge, /Painted TileMapLayer terrain at %s/);
});

test("Godot ShaderMaterial builder lives in its own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const builder = await readAddonFile("niua_mcp_shader_material_builder.gd");
  const shaderOperations = await readAddonFile("niua_mcp_resource_shader_material_operations.gd");

  assert.doesNotMatch(bridge, /preload\("niua_mcp_shader_material_builder\.gd"\)/);
  assert.match(shaderOperations, /preload\("niua_mcp_shader_material_builder\.gd"\)/);
  assert.match(shaderOperations, /NiuaMcpShaderMaterialBuilder\.build/);
  assert.doesNotMatch(bridge, /Shader\.new\(\)/);
  assert.doesNotMatch(bridge, /ShaderMaterial\.new\(\)/);
  assert.doesNotMatch(bridge, /set_shader_parameter/);
  assert.match(builder, /extends RefCounted/);
  assert.match(builder, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(builder, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(builder, /static func build\(body: Dictionary\) -> Dictionary:/);
  assert.match(builder, /Shader\.new\(\)/);
  assert.match(builder, /ShaderMaterial\.new\(\)/);
  assert.match(builder, /set_shader_parameter/);
  assert.match(builder, /json_to_variant/);
  assert.match(builder, /parameterNames/);
});

test("Godot generic resource builder lives in its own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const builder = await readAddonFile("niua_mcp_resource_builder.gd");
  const genericOperations = await readAddonFile("niua_mcp_resource_generic_operations.gd");

  assert.doesNotMatch(bridge, /preload\("niua_mcp_resource_builder\.gd"\)/);
  assert.match(genericOperations, /preload\("niua_mcp_resource_builder\.gd"\)/);
  assert.match(genericOperations, /NiuaMcpResourceBuilder\.build/);
  assert.match(genericOperations, /NiuaMcpResourceBuilder\.apply_properties/);
  assert.doesNotMatch(bridge, /func _instantiate_resource/);
  assert.doesNotMatch(bridge, /func _apply_resource_properties/);
  assert.match(builder, /extends RefCounted/);
  assert.match(builder, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(builder, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(builder, /static func build\(body: Dictionary\) -> Dictionary:/);
  assert.match(builder, /static func instantiate_resource\(resource_class_name: String\) -> Dictionary:/);
  assert.match(builder, /static func apply_properties\(resource: Resource, raw_properties\) -> Dictionary:/);
  assert.match(builder, /ClassDB\.instantiate/);
  assert.match(builder, /ClassDB\.is_parent_class/);
  assert.match(builder, /NiuaMcpVariantCodec\.json_to_variant/);
  assert.match(builder, /NiuaMcpVariantCodec\.variant_to_json/);
});

test("Godot resource operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_resource_operations.gd");
  const generic = await readAddonFile("niua_mcp_resource_generic_operations.gd");
  const shader = await readAddonFile("niua_mcp_resource_shader_material_operations.gd");
  const spriteFrames = await readAddonFile("niua_mcp_resource_sprite_frames_operations.gd");
  const tileSet = await readAddonFile("niua_mcp_resource_tile_set_operations.gd");

  assert.match(bridge, /preload\("niua_mcp_resource_operations\.gd"\)/);
  assert.match(bridge, /NiuaMcpResourceOperations\.open_resource/);
  assert.match(bridge, /NiuaMcpResourceOperations\.create_resource/);
  assert.match(bridge, /NiuaMcpResourceOperations\.save_resource/);
  assert.match(bridge, /NiuaMcpResourceOperations\.create_shader_material_resource/);
  assert.match(bridge, /NiuaMcpResourceOperations\.create_sprite_frames_resource/);
  assert.match(bridge, /NiuaMcpResourceOperations\.create_tile_set_resource/);
  assert.doesNotMatch(bridge, /NiuaMcpResourceBuilder\.build/);
  assert.doesNotMatch(bridge, /NiuaMcpResourceBuilder\.apply_properties/);
  assert.doesNotMatch(bridge, /NiuaMcpShaderMaterialBuilder\.build/);
  assert.doesNotMatch(bridge, /NiuaMcpSpriteFramesBuilder\.build/);
  assert.doesNotMatch(bridge, /NiuaMcpTileSetBuilder\.build/);

  assert.match(operations, /extends RefCounted/);
  assert.match(operations, /preload\("niua_mcp_resource_generic_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_resource_shader_material_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_resource_sprite_frames_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_resource_tile_set_operations\.gd"\)/);
  assert.match(operations, /static func open_resource\(editor: EditorInterface, body: Dictionary, open_scene: Callable\) -> Dictionary:/);
  assert.match(operations, /static func create_resource\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(operations, /static func save_resource\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(operations, /static func create_shader_material_resource\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(operations, /static func create_sprite_frames_resource\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(operations, /static func create_tile_set_resource\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(generic, /ResourceLoader\.load/);
  assert.match(generic, /ResourceSaver\.save/);
  assert.match(generic, /edit_resource/);
  assert.match(generic, /NiuaMcpPathUtils\.validate_res_path/);
  assert.match(generic, /NiuaMcpPathUtils\.ensure_parent_directory/);
  assert.match(generic, /NiuaMcpResourceBuilder\.build/);
  assert.match(generic, /NiuaMcpResourceBuilder\.apply_properties/);
  assert.match(shader, /NiuaMcpShaderMaterialBuilder\.build/);
  assert.match(spriteFrames, /NiuaMcpSpriteFramesBuilder\.build/);
  assert.match(tileSet, /NiuaMcpTileSetBuilder\.build/);
});

test("Godot resource operations delegate focused domain modules", async () => {
  const operations = await readAddonFile("niua_mcp_resource_operations.gd");
  const generic = await readAddonFile("niua_mcp_resource_generic_operations.gd");
  const shader = await readAddonFile("niua_mcp_resource_shader_material_operations.gd");
  const spriteFrames = await readAddonFile("niua_mcp_resource_sprite_frames_operations.gd");
  const tileSet = await readAddonFile("niua_mcp_resource_tile_set_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_resource_side_effects.gd");
  const utils = await readAddonFile("niua_mcp_resource_operation_utils.gd");

  assert.match(operations, /preload\("niua_mcp_resource_generic_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_resource_shader_material_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_resource_sprite_frames_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_resource_tile_set_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_resource_side_effects\.gd"\)/);
  assert.match(operations, /NiuaMcpResourceGenericOperations\.open_resource/);
  assert.match(operations, /NiuaMcpResourceShaderMaterialOperations\.create_shader_material_resource/);
  assert.match(operations, /NiuaMcpResourceSpriteFramesOperations\.create_sprite_frames_resource/);
  assert.match(operations, /NiuaMcpResourceTileSetOperations\.create_tile_set_resource/);
  assert.doesNotMatch(operations, /NiuaMcpResourceBuilder\.build/);

  assert.match(generic, /static func open_resource\(editor: EditorInterface, body: Dictionary, open_scene: Callable\) -> Dictionary:/);
  assert.match(generic, /static func create_resource\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(generic, /static func save_resource\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(generic, /NiuaMcpResourceBuilder\.build/);
  assert.match(generic, /NiuaMcpResourceBuilder\.apply_properties/);
  assert.match(shader, /NiuaMcpShaderMaterialBuilder\.build/);
  assert.match(spriteFrames, /NiuaMcpSpriteFramesBuilder\.build/);
  assert.match(tileSet, /NiuaMcpTileSetBuilder\.build/);
  assert.match(sideEffects, /static func open_resource_with_side_effects\(editor: EditorInterface, body: Dictionary, open_scene: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /NiuaMcpResourceGenericOperations\.open_resource/);
  assert.match(sideEffects, /NiuaMcpResourceOperationUtils\.remember/);
  assert.match(utils, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(utils, /static func refresh\(refresh_filesystem: Callable\) -> void:/);
  assert.match(utils, /static func remember\(remember: Callable, message: String\) -> void:/);
});

test("Godot resource bridge side effects live in resource operations", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_resource_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_resource_side_effects.gd");

  assert.match(operations, /NiuaMcpResourceSideEffects\.open_resource_with_side_effects/);
  assert.match(sideEffects, /static func open_resource_with_side_effects\(editor: EditorInterface, body: Dictionary, open_scene: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /static func create_resource_with_side_effects\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /static func save_resource_with_side_effects\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /static func create_shader_material_resource_with_side_effects\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /static func create_sprite_frames_resource_with_side_effects\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /static func create_tile_set_resource_with_side_effects\(editor: EditorInterface, body: Dictionary, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /NiuaMcpResourceOperationUtils\.remember\(remember, "Opened resource %s"/);
  assert.match(sideEffects, /NiuaMcpResourceOperationUtils\.remember\(remember, "Created ShaderMaterial resource %s"/);
  assert.doesNotMatch(bridge, /Opened resource %s/);
  assert.doesNotMatch(bridge, /Created resource %s/);
  assert.doesNotMatch(bridge, /Saved resource %s/);
  assert.doesNotMatch(bridge, /Created ShaderMaterial resource %s/);
  assert.doesNotMatch(bridge, /Created SpriteFrames resource %s/);
  assert.doesNotMatch(bridge, /Created TileSet resource %s/);
});

test("Godot import metadata lives in its own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const importMetadata = await readAddonFile("niua_mcp_import_metadata.gd");
  const assetListing = await readAddonFile("niua_mcp_import_asset_listing.gd");
  const metadataQueries = await readAddonFileExact("niua_mcp_import_metadata_queries.gd");
  const queryReader = await readAddonFile("niua_mcp_import_metadata_query_reader.gd");
  const metadataLoader = await readAddonFile("niua_mcp_import_metadata_loader.gd");
  const metadataSummary = await readAddonFile("niua_mcp_import_metadata_summary.gd");
  const metadataDiagnostics = await readAddonFile("niua_mcp_import_metadata_diagnostics.gd");
  const eventSummary = await readAddonFile("niua_mcp_import_event_summary.gd");
  const importOperations = await readAddonFile("niua_mcp_import_operations.gd");

  assert.match(importOperations, /preload\("niua_mcp_import_metadata\.gd"\)/);
  assert.match(importOperations, /NiuaMcpImportMetadata\.list_imported_assets/);
  assert.match(importOperations, /NiuaMcpImportMetadata\.get_metadata/);
  assert.match(importOperations, /NiuaMcpImportMetadata\.get_diagnostics/);
  assert.match(importOperations, /NiuaMcpImportMetadata\.summary/);
  assert.match(importOperations, /NiuaMcpImportMetadata\.event_summary/);
  assert.doesNotMatch(bridge, /func _collect_imported_assets/);
  assert.doesNotMatch(bridge, /func _load_import_metadata/);
  assert.doesNotMatch(bridge, /func _string_values/);
  assert.doesNotMatch(bridge, /func _invalid_import_paths/);
  assert.doesNotMatch(bridge, /func _import_summary/);
  assert.doesNotMatch(bridge, /func _import_diagnostic_issues/);
  assert.match(importMetadata, /extends RefCounted/);
  assert.match(importMetadata, /preload\("niua_mcp_import_asset_listing\.gd"\)/);
  assert.match(importMetadata, /preload\("niua_mcp_import_metadata_queries\.gd"\)/);
  assert.match(importMetadata, /preload\("niua_mcp_import_event_summary\.gd"\)/);
  assert.match(importMetadata, /NiuaMcpImportAssetListing\.list_imported_assets/);
  assert.match(importMetadata, /NiuaMcpImportMetadataQueries\.get_metadata/);
  assert.match(importMetadata, /NiuaMcpImportMetadataQueries\.get_diagnostics/);
  assert.match(importMetadata, /NiuaMcpImportMetadataQueries\.summary/);
  assert.match(importMetadata, /NiuaMcpImportMetadataQueries\.diagnostic_issues/);
  assert.match(importMetadata, /NiuaMcpImportEventSummary\.event_summary/);
  assert.match(importMetadata, /static func list_imported_assets\(query: Dictionary\) -> Dictionary:/);
  assert.match(importMetadata, /static func get_metadata\(query: Dictionary\) -> Dictionary:/);
  assert.match(importMetadata, /static func get_diagnostics\(query: Dictionary\) -> Dictionary:/);
  assert.match(importMetadata, /static func summary\(source_path: String, metadata_path: String, metadata: Dictionary\) -> Dictionary:/);
  assert.match(importMetadata, /static func diagnostic_issues\(source_path: String, metadata_path: String, metadata: Dictionary, metadata_exists: bool, metadata_load_error: int\) -> Array:/);
  assert.match(importMetadata, /static func event_summary\(kind: String, raw_paths, extra: Dictionary, resource_filesystem\) -> Dictionary:/);
  assert.doesNotMatch(importMetadata, /DirAccess\.open/);
  assert.doesNotMatch(importMetadata, /FileAccess\.get_modified_time/);
  assert.doesNotMatch(importMetadata, /get_filesystem_path/);

  assert.match(assetListing, /extends RefCounted/);
  assert.match(assetListing, /preload\("niua_mcp_import_metadata_queries\.gd"\)/);
  assert.match(assetListing, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(assetListing, /static func list_imported_assets\(query: Dictionary\) -> Dictionary:/);
  assert.match(assetListing, /DirAccess\.open/);
  assert.match(assetListing, /NiuaMcpImportMetadataQueries\.load_metadata/);
  assert.match(assetListing, /NiuaMcpImportMetadataQueries\.summary/);

  assert.match(metadataQueries, /extends RefCounted/);
  assert.match(metadataQueries, /preload\("niua_mcp_import_metadata_query_reader\.gd"\)/);
  assert.match(metadataQueries, /preload\("niua_mcp_import_metadata_loader\.gd"\)/);
  assert.match(metadataQueries, /preload\("niua_mcp_import_metadata_summary\.gd"\)/);
  assert.match(metadataQueries, /preload\("niua_mcp_import_metadata_diagnostics\.gd"\)/);
  assert.match(metadataQueries, /static func get_metadata\(query: Dictionary\) -> Dictionary:/);
  assert.match(metadataQueries, /static func get_diagnostics\(query: Dictionary\) -> Dictionary:/);
  assert.match(metadataQueries, /static func summary\(source_path: String, metadata_path: String, metadata: Dictionary\) -> Dictionary:/);
  assert.match(metadataQueries, /static func diagnostic_issues\(source_path: String, metadata_path: String, metadata: Dictionary, metadata_exists: bool, metadata_load_error: int\) -> Array:/);
  assert.match(metadataQueries, /static func load_metadata\(path: String\) -> Dictionary:/);
  assert.match(metadataQueries, /NiuaMcpImportMetadataQueryReader\.get_metadata/);
  assert.match(metadataQueries, /NiuaMcpImportMetadataQueryReader\.get_diagnostics/);
  assert.match(metadataQueries, /NiuaMcpImportMetadataSummary\.summary/);
  assert.match(metadataQueries, /NiuaMcpImportMetadataDiagnostics\.diagnostic_issues/);
  assert.match(metadataQueries, /NiuaMcpImportMetadataLoader\.load_metadata/);
  assert.doesNotMatch(metadataQueries, /ConfigFile/);
  assert.doesNotMatch(metadataQueries, /NiuaMcpConfigFileCodec/);
  assert.doesNotMatch(metadataQueries, /FileAccess\.get_modified_time/);
  assert.doesNotMatch(metadataQueries, /ResourceLoader\.exists/);
  assert.doesNotMatch(metadataQueries, /source_newer_than_metadata/);
  assert.doesNotMatch(metadataQueries, /missing_import_target/);
  assert.doesNotMatch(metadataQueries, /static func _error/);

  assert.match(queryReader, /extends RefCounted/);
  assert.match(queryReader, /preload\("niua_mcp_import_metadata_loader\.gd"\)/);
  assert.match(queryReader, /preload\("niua_mcp_import_metadata_summary\.gd"\)/);
  assert.match(queryReader, /preload\("niua_mcp_import_metadata_diagnostics\.gd"\)/);
  assert.match(queryReader, /preload\("niua_mcp_import_utils\.gd"\)/);
  assert.match(queryReader, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(queryReader, /static func get_metadata\(query: Dictionary\) -> Dictionary:/);
  assert.match(queryReader, /static func get_diagnostics\(query: Dictionary\) -> Dictionary:/);
  assert.match(queryReader, /NiuaMcpPathUtils\.import_sidecar_path/);
  assert.match(queryReader, /NiuaMcpImportMetadataLoader\.load_config_metadata/);
  assert.match(queryReader, /NiuaMcpImportMetadataSummary\.summary/);
  assert.match(queryReader, /NiuaMcpImportMetadataDiagnostics\.diagnostic_issues/);
  assert.match(queryReader, /NiuaMcpImportUtils\.error/);

  assert.match(metadataLoader, /extends RefCounted/);
  assert.match(metadataLoader, /preload\("niua_mcp_config_file_codec\.gd"\)/);
  assert.match(metadataLoader, /preload\("niua_mcp_import_utils\.gd"\)/);
  assert.match(metadataLoader, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(metadataLoader, /static func load_metadata\(path: String\) -> Dictionary:/);
  assert.match(metadataLoader, /static func load_config_metadata\(metadata_path: String\) -> Dictionary:/);
  assert.match(metadataLoader, /ConfigFile\.new/);
  assert.match(metadataLoader, /NiuaMcpConfigFileCodec\.to_json/);

  assert.match(metadataSummary, /extends RefCounted/);
  assert.match(metadataSummary, /static func summary\(source_path: String, metadata_path: String, metadata: Dictionary\) -> Dictionary:/);
  assert.match(metadataSummary, /importMetadataPath/);
  assert.match(metadataSummary, /sourceExists/);
  assert.match(metadataSummary, /importedPath/);
  assert.match(metadataSummary, /importer/);

  assert.match(metadataDiagnostics, /extends RefCounted/);
  assert.match(metadataDiagnostics, /static func diagnostic_issues\(source_path: String, metadata_path: String, metadata: Dictionary, metadata_exists: bool, metadata_load_error: int\) -> Array:/);
  assert.match(metadataDiagnostics, /source_newer_than_metadata/);
  assert.match(metadataDiagnostics, /missing_import_target/);
  assert.match(metadataDiagnostics, /missing_dependency_dest/);
  assert.match(metadataDiagnostics, /FileAccess\.get_modified_time/);
  assert.match(metadataDiagnostics, /ResourceLoader\.exists/);

  assert.match(eventSummary, /extends RefCounted/);
  assert.match(eventSummary, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(eventSummary, /static func event_summary\(kind: String, raw_paths, extra: Dictionary, resource_filesystem\) -> Dictionary:/);
  assert.match(eventSummary, /get_filesystem_path/);
  assert.match(eventSummary, /get_file_import_is_valid/);
});

test("Godot import operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_import_operations.gd");
  const eventTracker = await readAddonFile("niua_mcp_import_event_tracker.gd");
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");

  assert.match(bridge, /preload\("niua_mcp_import_operations\.gd"\)/);
  assert.match(bridge, /preload\("niua_mcp_import_event_tracker\.gd"\)/);
  assert.match(readRoutes, /NiuaMcpImportOperations\.list_imported_assets/);
  assert.match(readRoutes, /NiuaMcpImportOperations\.get_import_metadata/);
  assert.match(readRoutes, /NiuaMcpImportOperations\.get_import_diagnostics/);
  assert.match(readRoutes, /_context\.import_event_tracker\.response/);
  assert.match(bridge, /NiuaMcpImportOperations\.set_import_options/);
  assert.match(bridge, /NiuaMcpImportOperations\.reimport_assets/);
  assert.doesNotMatch(bridge, /NiuaMcpImportOperations\.record_event/);
  assert.doesNotMatch(bridge, /NiuaMcpImportOperations\.import_events_response/);
  assert.doesNotMatch(bridge, /set_value\("params"/);
  assert.doesNotMatch(bridge, /config\.save\(metadata_path\)/);
  assert.doesNotMatch(bridge, /reimport_files/);
  assert.match(operations, /extends RefCounted/);
  assert.match(operations, /preload\("niua_mcp_config_file_codec\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_import_metadata\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(operations, /static func list_imported_assets\(query: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func get_import_metadata\(query: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func get_import_diagnostics\(query: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func import_events_response\(query: Dictionary, import_events: Array, events_available: bool, max_events: int\) -> Dictionary:/);
  assert.match(operations, /static func set_import_options\(body: Dictionary, path_validator: Callable, reimport_assets: Callable\) -> Dictionary:/);
  assert.match(operations, /static func reimport_assets\(body: Dictionary, resource_filesystem, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(operations, /static func record_event\(import_events: Array, max_events: int, kind: String, raw_paths = \[\], extra: Dictionary = \{\}, resource_filesystem = null\) -> void:/);
  assert.match(operations, /NiuaMcpImportMetadata\.list_imported_assets/);
  assert.match(operations, /NiuaMcpImportMetadata\.get_metadata/);
  assert.match(operations, /NiuaMcpImportMetadata\.get_diagnostics/);
  assert.match(operations, /NiuaMcpImportMetadata\.summary/);
  assert.match(operations, /NiuaMcpImportMetadata\.event_summary/);
  assert.match(operations, /set_value\("params"/);
  assert.match(operations, /config\.save\(metadata_path\)/);
  assert.match(operations, /reimport_files/);
  assert.match(eventTracker, /preload\("niua_mcp_import_operations\.gd"\)/);
  assert.match(eventTracker, /NiuaMcpImportOperations\.import_events_response/);
  assert.match(eventTracker, /NiuaMcpImportOperations\.record_event/);
});

test("Godot import bridge side effects live in import operations", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_import_operations.gd");

  assert.match(operations, /static func set_import_options_with_side_effects\(body: Dictionary, path_validator: Callable, reimport_assets: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func reimport_assets_with_side_effects\(body: Dictionary, resource_filesystem, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(bridge, /NiuaMcpImportOperations\.set_import_options_with_side_effects/);
  assert.match(bridge, /NiuaMcpImportOperations\.reimport_assets_with_side_effects/);
  assert.doesNotMatch(bridge, /Updated import options for %s/);
  assert.doesNotMatch(bridge, /Requested asset reimport for %s/);
});

test("Godot import operations delegate focused domain modules", async () => {
  const facade = await readAddonFileExact("niua_mcp_import_operations.gd");
  const queries = await readAddonFile("niua_mcp_import_query_operations.gd");
  const events = await readAddonFile("niua_mcp_import_event_operations.gd");
  const options = await readAddonFile("niua_mcp_import_option_operations.gd");
  const reimport = await readAddonFile("niua_mcp_import_reimport_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_import_side_effects.gd");
  const utils = await readAddonFile("niua_mcp_import_utils.gd");

  assert.match(facade, /preload\("niua_mcp_import_query_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_import_event_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_import_option_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_import_reimport_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_import_side_effects\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_import_utils\.gd"\)/);
  assert.match(facade, /static func list_imported_assets\(query: Dictionary\) -> Dictionary:/);
  assert.match(facade, /static func import_events_response\(query: Dictionary, import_events: Array, events_available: bool, max_events: int\) -> Dictionary:/);
  assert.match(facade, /static func set_import_options\(body: Dictionary, path_validator: Callable, reimport_assets: Callable\) -> Dictionary:/);
  assert.match(facade, /static func reimport_assets\(body: Dictionary, resource_filesystem, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(facade, /static func record_event\(import_events: Array, max_events: int, kind: String, raw_paths = \[\], extra: Dictionary = \{\}, resource_filesystem = null\) -> void:/);
  assert.doesNotMatch(facade, /ConfigFile\.new\(\)/);
  assert.doesNotMatch(facade, /config\.save\(metadata_path\)/);
  assert.doesNotMatch(facade, /reimport_files/);
  assert.doesNotMatch(facade, /for event in import_events/);
  assert.doesNotMatch(facade, /Updated import options for %s/);

  assert.match(queries, /preload\("niua_mcp_import_metadata\.gd"\)/);
  assert.match(queries, /static func list_imported_assets\(query: Dictionary\) -> Dictionary:/);
  assert.match(queries, /static func get_import_metadata\(query: Dictionary\) -> Dictionary:/);
  assert.match(queries, /static func get_import_diagnostics\(query: Dictionary\) -> Dictionary:/);
  assert.match(queries, /NiuaMcpImportMetadata\.list_imported_assets/);
  assert.match(queries, /NiuaMcpImportMetadata\.get_metadata/);
  assert.match(queries, /NiuaMcpImportMetadata\.get_diagnostics/);

  assert.match(events, /preload\("niua_mcp_import_metadata\.gd"\)/);
  assert.match(events, /static func import_events_response\(query: Dictionary, import_events: Array, events_available: bool, max_events: int\) -> Dictionary:/);
  assert.match(events, /static func record_event\(import_events: Array, max_events: int, kind: String, raw_paths = \[\], extra: Dictionary = \{\}, resource_filesystem = null\) -> void:/);
  assert.match(events, /sinceMsec/);
  assert.match(events, /totalMatched/);
  assert.match(events, /NiuaMcpImportMetadata\.event_summary/);

  assert.match(options, /preload\("niua_mcp_config_file_codec\.gd"\)/);
  assert.match(options, /preload\("niua_mcp_import_metadata\.gd"\)/);
  assert.match(options, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(options, /preload\("niua_mcp_variant_codec\.gd"\)/);
  assert.match(options, /preload\("niua_mcp_import_utils\.gd"\)/);
  assert.match(options, /static func set_import_options\(body: Dictionary, path_validator: Callable, reimport_assets: Callable\) -> Dictionary:/);
  assert.match(options, /ConfigFile\.new\(\)/);
  assert.match(options, /set_value\("params"/);
  assert.match(options, /config\.save\(metadata_path\)/);
  assert.match(options, /updatedOptions/);
  assert.match(options, /previousOptions/);
  assert.match(options, /reimport_assets\.call/);

  assert.match(reimport, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(reimport, /preload\("niua_mcp_import_utils\.gd"\)/);
  assert.match(reimport, /static func reimport_assets\(body: Dictionary, resource_filesystem, refresh_filesystem: Callable\) -> Dictionary:/);
  assert.match(reimport, /validate_res_path/);
  assert.match(reimport, /reimport_files/);
  assert.match(reimport, /tree\.process_frame\.connect\(callback, CONNECT_ONE_SHOT\)/);
  assert.match(reimport, /resource_filesystem\.reimport_files\(packed_paths\)/);
  assert.doesNotMatch(reimport, /call_deferred\("reimport_files"/);
  assert.match(reimport, /resource_filesystem\.scan\(\)/);
  assert.doesNotMatch(reimport, /call_deferred\("scan"/);
  assert.match(reimport, /refresh_filesystem\.call/);

  assert.match(sideEffects, /preload\("niua_mcp_import_option_operations\.gd"\)/);
  assert.match(sideEffects, /preload\("niua_mcp_import_reimport_operations\.gd"\)/);
  assert.match(sideEffects, /preload\("niua_mcp_import_utils\.gd"\)/);
  assert.match(sideEffects, /static func set_import_options_with_side_effects\(body: Dictionary, path_validator: Callable, reimport_assets: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /static func reimport_assets_with_side_effects\(body: Dictionary, resource_filesystem, refresh_filesystem: Callable, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /Updated import options for %s/);
  assert.match(sideEffects, /Requested asset reimport for %s/);

  assert.match(utils, /static func remember\(remember: Callable, message: String\) -> void:/);
  assert.match(utils, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(utils, /errorCode/);
});

test("Godot import event tracker owns signal lifecycle and buffering", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const tracker = await readAddonFile("niua_mcp_import_event_tracker.gd");

  assert.match(bridge, /preload\("niua_mcp_import_event_tracker\.gd"\)/);
  assert.match(bridge, /NiuaMcpImportEventTracker\.new\(\)/);
  assert.match(bridge, /_import_event_tracker\.start\(_editor_resource_filesystem\(\)\)/);
  assert.match(bridge, /_import_event_tracker\.stop\(\)/);
  assert.match(readRoutes, /return _context\.import_event_tracker\.response\(query\)/);
  assert.doesNotMatch(bridge, /MAX_IMPORT_EVENTS/);
  assert.match(tracker, /extends RefCounted/);
  assert.match(tracker, /preload\("niua_mcp_import_operations\.gd"\)/);
  assert.match(tracker, /const MAX_EVENTS := 200/);
  assert.match(tracker, /var _events: Array\[Dictionary\] = \[\]/);
  assert.match(tracker, /var _signal_source = null/);
  assert.match(tracker, /func start\(resource_filesystem\) -> void:/);
  assert.match(tracker, /func stop\(\) -> void:/);
  assert.match(tracker, /func response\(query: Dictionary\) -> Dictionary:/);
  assert.match(tracker, /func record\(kind: String, raw_paths = \[\], extra: Dictionary = \{\}\) -> void:/);
  assert.match(tracker, /func _connect_signal\(signal_name: String, callback: Callable\) -> void:/);
  assert.match(tracker, /func _disconnect_signal\(signal_name: String, callback: Callable\) -> void:/);
  assert.match(tracker, /resources_reimporting/);
  assert.match(tracker, /resources_reimported/);
  assert.match(tracker, /resources_reload/);
  assert.match(tracker, /sources_changed/);
  assert.match(tracker, /filesystem_changed/);
  assert.match(tracker, /NiuaMcpImportOperations\.import_events_response/);
  assert.match(tracker, /NiuaMcpImportOperations\.record_event/);
  assert.doesNotMatch(bridge, /var _import_events/);
  assert.doesNotMatch(bridge, /var _import_signal_source/);
  assert.doesNotMatch(bridge, /func _connect_import_signal/);
  assert.doesNotMatch(bridge, /func _disconnect_import_signal/);
  assert.doesNotMatch(bridge, /func _on_import_resources_reimporting/);
  assert.doesNotMatch(bridge, /func _record_import_event/);
});

test("Godot bridge exposes Milestone 1A scene and inspector write endpoints", async () => {
  const bridge = await readBridgeWriteSurface();
  const http = await readAddonFile("niua_mcp_bridge_http.gd");
  const documentOperations = await readAddonFile("niua_mcp_scene_document_operations.gd");
  const nodeCreationOperations = await readAddonFile("niua_mcp_scene_node_creation_operations.gd");
  const nodeInstanceCreationOperations = await readAddonFile("niua_mcp_scene_node_instance_creation.gd");
  const inspectorOperations = await readAddonFile("niua_mcp_scene_inspector_operations.gd");
  const propertyOperations = await readAddonFile("niua_mcp_scene_property_operations.gd");
  const materialOperations = await readAddonFile("niua_mcp_scene_material_operations.gd");

  await assertEndpointRoutes([
    "/scene/open",
    "/scene/node/create",
    "/inspector/properties",
    "/inspector/property/set",
    "/node/material/assign",
    "/scene/save"
  ]);

  assert.match(http, /JSON\.parse_string/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.open_scene/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.create_node/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.inspector_properties/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.set_node_property/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.assign_material/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.save_current_scene/);
  assert.match(nodeCreationOperations, /NiuaMcpSceneNodeInstanceCreation\.create_node/);
  assert.match(nodeInstanceCreationOperations, /ClassDB\.instantiate/);
  assert.match(documentOperations, /ResourceSaver\.save/);
  assert.match(bridge, /_assign_material/);
  assert.match(materialOperations, /NiuaMcpSceneGraphUtils\.object_has_property/);
  assert.match(materialOperations, /set_surface_override_material/);
  assert.match(materialOperations, /material_override/);
  assert.match(materialOperations, /ResourceLoader\.load/);
  assert.match(materialOperations, /Material/);
  assert.match(propertyOperations, /NiuaMcpVariantCodec\.json_to_variant/);
  // A bare res:// string coerces for Object/Resource properties through the
  // same validated loader as the { type: "Resource", path } wrapper.
  assert.match(propertyOperations, /declared_type == TYPE_OBJECT and typeof\(decoded\) == TYPE_STRING/);
  assert.match(propertyOperations, /NiuaMcpVariantCodec\.resource_from_json\(\{ "path": decoded \}, path_validator\)/);
  assert.match(inspectorOperations, /property_can_revert/);
  assert.match(inspectorOperations, /property_get_revert/);
  assert.match(inspectorOperations, /canRevert/);
  assert.match(inspectorOperations, /revertValue/);
  assert.match(inspectorOperations, /NiuaMcpPropertyMetadata\.usage_flags/);
  assert.match(inspectorOperations, /usageFlags/);
  assert.match(inspectorOperations, /sectionKind/);
  assert.match(inspectorOperations, /isCategory/);
  assert.match(inspectorOperations, /isGroup/);
  assert.match(inspectorOperations, /isSubgroup/);
  assert.match(inspectorOperations, /isReadOnly/);
  assert.match(inspectorOperations, /NiuaMcpInspectorMetadata\.property_editor_metadata/);
  assert.match(inspectorOperations, /"editor": NiuaMcpInspectorMetadata\.property_editor_metadata/);
});

test("Godot bridge exposes Milestone 7C scene creation and save-as endpoints", async () => {
  const bridge = await readBridgeWriteSurface();
  const documentOperations = await readAddonFile("niua_mcp_scene_document_operations.gd");
  const operations = await readAddonFile("niua_mcp_scene_graph_operations.gd");

  await assertEndpointRoutes([
    "/scene/create",
    "/scene/save-as"
  ]);

  assert.match(bridge, /_create_scene/);
  assert.match(bridge, /_save_scene_as/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.create_scene/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.save_scene_as/);
  assert.match(operations, /NiuaMcpSceneDocumentOperations\.create_scene/);
  assert.match(operations, /NiuaMcpSceneDocumentOperations\.save_scene_as/);
  assert.match(documentOperations, /PackedScene\.new/);
  assert.match(documentOperations, /ClassDB\.instantiate/);
  assert.match(documentOperations, /ResourceSaver\.save/);
});

test("Godot bridge exposes Milestone 1B scene node mutation endpoints", async () => {
  const bridge = await readBridgeWriteSurface();
  const sceneNodeTreeOperations = await readAddonFile("niua_mcp_scene_node_tree_operations.gd");
  const sceneNodeTreeHierarchy = await readAddonFile("niua_mcp_scene_node_tree_hierarchy_operations.gd");
  const sceneGraphOperations = await readAddonFile("niua_mcp_scene_graph_operations.gd");
  const tileMapLayerCells = await readAddonFile("niua_mcp_tile_map_layer_cell_operations.gd");
  const tileMapLayerTerrain = await readAddonFile("niua_mcp_tile_map_layer_terrain_operations.gd");

  await assertEndpointRoutes([
    "/scene/node/rename",
    "/scene/node/delete",
    "/scene/node/duplicate",
    "/scene/node/reparent",
    "/scene/node/reorder",
    "/scene/tile-map-layer/cells/set",
    "/scene/tile-map-layer/terrain/paint"
  ]);

  assert.match(bridge, /_rename_node/);
  assert.match(bridge, /_delete_node/);
  assert.match(bridge, /_duplicate_node/);
  assert.match(bridge, /_reparent_node/);
  assert.match(bridge, /_reorder_node/);
  assert.match(bridge, /_set_tile_map_layer_cells/);
  assert.match(bridge, /_paint_tile_map_layer_terrain/);
  assert.match(bridge, /NiuaMcpTileMapLayerOperations\.set_cells/);
  assert.match(bridge, /NiuaMcpTileMapLayerOperations\.paint_terrain/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.rename_node/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.delete_node/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.duplicate_node/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.reparent_node/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.reorder_node/);
  assert.match(sceneGraphOperations, /NiuaMcpSceneNodeOperations\.reorder_node/);
  assert.match(sceneNodeTreeOperations, /NiuaMcpSceneNodeTreeHierarchyOperations\.reorder_node/);
  assert.match(sceneNodeTreeHierarchy, /move_child/);
  assert.match(tileMapLayerCells, /set_cell/);
  assert.match(tileMapLayerCells, /erase_cell/);
  assert.match(tileMapLayerTerrain, /set_cells_terrain_connect/);
  assert.match(tileMapLayerTerrain, /set_cells_terrain_path/);
});

test("Godot bridge exposes Milestone 2A filesystem dock endpoints", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const filesystem = await readAddonFile("niua_mcp_filesystem_operations.gd");
  const filesystemBatchOperations = await readAddonFile("niua_mcp_filesystem_batch_operations.gd");
  const filesystemStateOperations = await readAddonFile("niua_mcp_filesystem_state_operations.gd");
  const filesystemReadOperations = await readAddonFile("niua_mcp_filesystem_read_operations.gd");
  const filesystemMutationOperations = await readAddonFile("niua_mcp_filesystem_mutation_operations.gd");
  const filesystemCopyOperations = await readAddonFile("niua_mcp_filesystem_copy_operations.gd");
  const resourceOperations = await readAddonFile("niua_mcp_resource_operations.gd");
  const resourceGenericOperations = await readAddonFile("niua_mcp_resource_generic_operations.gd");
  const resourceSpriteFramesOperations = await readAddonFile("niua_mcp_resource_sprite_frames_operations.gd");
  const resourceTileSetOperations = await readAddonFile("niua_mcp_resource_tile_set_operations.gd");
  const resourceBuilder = await readAddonFile("niua_mcp_resource_builder.gd");
  const spriteFramesBuilder = await readAddonFile("niua_mcp_sprite_frames_builder.gd");
  const spriteFramesAnimationBuilder = await readAddonFile("niua_mcp_sprite_frames_animation_builder.gd");
  const spriteFramesFrameBuilder = await readAddonFile("niua_mcp_sprite_frames_frame_builder.gd");
  const spriteFramesSheetBuilder = await readAddonFile("niua_mcp_sprite_frames_sheet_builder.gd");
  const tileSetBuilder = await readAddonFile("niua_mcp_tile_set_builder.gd");
  const tileSetSourceBuilder = await readAddonFile("niua_mcp_tile_set_source_builder.gd");
  const tileSetTileBuilder = await readAddonFile("niua_mcp_tile_set_tile_builder.gd");
  const tileSetTerrainBuilder = await readAddonFile("niua_mcp_tile_set_terrain_builder.gd");
  const tileSetPhysicsBuilder = await readAddonFile("niua_mcp_tile_set_physics_builder.gd");

  await assertEndpointRoutes([
    "/filesystem/state",
    "/filesystem/list",
    "/filesystem/folder/create",
    "/filesystem/file/read",
    "/filesystem/file/write",
    "/filesystem/file/write-binary",
    "/filesystem/move",
    "/filesystem/copy",
    "/filesystem/batch",
    "/filesystem/delete",
    "/resource/open",
    "/resource/create",
    "/resource/save",
    "/resource/sprite-frames/create",
    "/resource/tile-set/create"
  ]);

  assert.match(readRoutes, /NiuaMcpFilesystemOperations\.list_filesystem/);
  assert.match(bridge, /NiuaMcpFilesystemOperations\.create_folder/);
  assert.match(readRoutes, /NiuaMcpFilesystemOperations\.read_text_file/);
  assert.match(bridge, /NiuaMcpFilesystemOperations\.write_text_file/);
  assert.match(bridge, /NiuaMcpFilesystemOperations\.write_binary_file/);
  assert.match(bridge, /NiuaMcpFilesystemOperations\.move_entry/);
  assert.match(bridge, /NiuaMcpFilesystemOperations\.copy_entry/);
  assert.match(bridge, /NiuaMcpFilesystemOperations\.batch_operations/);
  assert.doesNotMatch(bridge, /NiuaMcpFilesystemOperations\.batch_operation_message/);
  assert.match(bridge, /NiuaMcpFilesystemOperations\.delete_entry/);
  assert.match(readRoutes, /NiuaMcpFilesystemOperations\.filesystem_state/);
  assert.match(filesystemReadOperations, /DirAccess/);
  assert.match(filesystemReadOperations, /FileAccess/);
  assert.match(filesystemMutationOperations, /DirAccess/);
  assert.match(filesystemMutationOperations, /FileAccess/);
  assert.match(bridge, /_validate_res_path/);
  assert.match(bridge, /_refresh_filesystem/);
  assert.match(bridge, /_copy_filesystem_entry/);
  assert.match(bridge, /_batch_filesystem_operations/);
  assert.match(filesystemBatchOperations, /continueOnError/);
  assert.match(filesystemBatchOperations, /dryRun/);
  assert.match(filesystemBatchOperations, /processedCount/);
  assert.match(filesystemCopyOperations, /NiuaMcpPathUtils\.filesystem_entry_exists/);
  assert.match(filesystemCopyOperations, /copy_absolute/);
  assert.match(filesystemCopyOperations, /overwrite/);
  assert.match(filesystemCopyOperations, /copiedEntries/);
  assert.match(readRoutes, /_filesystem_state/);
  assert.match(filesystemStateOperations, /get_selected_paths/);
  assert.match(filesystemStateOperations, /get_current_path/);
  assert.match(filesystemStateOperations, /get_current_directory/);
  assert.match(filesystemStateOperations, /is_scanning/);
  assert.match(filesystemStateOperations, /get_scanning_progress/);
  assert.match(bridge, /_create_resource/);
  assert.match(bridge, /_save_resource/);
  assert.match(bridge, /_create_sprite_frames_resource/);
  assert.match(bridge, /NiuaMcpResourceOperations\.create_sprite_frames_resource/);
  assert.match(resourceSpriteFramesOperations, /NiuaMcpSpriteFramesBuilder\.build/);
  assert.match(bridge, /_create_tile_set_resource/);
  assert.match(bridge, /NiuaMcpResourceOperations\.open_resource/);
  assert.match(bridge, /NiuaMcpResourceOperations\.create_resource/);
  assert.match(bridge, /NiuaMcpResourceOperations\.save_resource/);
  assert.match(bridge, /NiuaMcpResourceOperations\.create_tile_set_resource/);
  assert.match(resourceOperations, /NiuaMcpResourceGenericOperations\.create_resource/);
  assert.match(resourceGenericOperations, /NiuaMcpResourceBuilder\.build/);
  assert.match(resourceGenericOperations, /NiuaMcpResourceBuilder\.apply_properties/);
  assert.match(resourceBuilder, /ClassDB\.instantiate/);
  assert.match(resourceBuilder, /ClassDB\.is_parent_class/);
  assert.match(resourceBuilder, /ClassDB\.can_instantiate/);
  assert.match(resourceBuilder, /json_to_variant/);
  assert.match(resourceBuilder, /variant_to_json/);
  assert.match(spriteFramesBuilder, /SpriteFrames\.new/);
  assert.match(spriteFramesBuilder, /NiuaMcpSpriteFramesAnimationBuilder\.add_animation/);
  assert.match(spriteFramesAnimationBuilder, /add_animation/);
  assert.match(spriteFramesAnimationBuilder, /add_frame/);
  assert.match(spriteFramesFrameBuilder, /AtlasTexture\.new/);
  assert.match(spriteFramesFrameBuilder, /set_atlas/);
  assert.match(spriteFramesFrameBuilder, /set_region/);
  assert.match(spriteFramesFrameBuilder, /set_filter_clip/);
  assert.match(spriteFramesSheetBuilder, /get_width/);
  assert.match(spriteFramesSheetBuilder, /get_height/);
  assert.match(spriteFramesSheetBuilder, /frameSize/);
  assert.match(spriteFramesSheetBuilder, /frameCount/);
  assert.match(resourceTileSetOperations, /NiuaMcpTileSetBuilder\.build/);
  assert.match(tileSetBuilder, /TileSet\.new/);
  assert.match(tileSetSourceBuilder, /TileSetAtlasSource\.new/);
  assert.match(tileSetTileBuilder, /create_tile/);
  assert.match(tileSetPhysicsBuilder, /add_physics_layer/);
  assert.match(tileSetPhysicsBuilder, /set_physics_layer_collision_layer/);
  assert.match(tileSetPhysicsBuilder, /set_physics_layer_collision_mask/);
  assert.match(tileSetPhysicsBuilder, /get_tile_data/);
  assert.match(tileSetPhysicsBuilder, /add_collision_polygon/);
  assert.match(tileSetPhysicsBuilder, /set_collision_polygon_points/);
  assert.match(tileSetTerrainBuilder, /add_terrain_set/);
  assert.match(tileSetTerrainBuilder, /set_terrain_set_mode/);
  assert.match(tileSetTerrainBuilder, /set_terrain_name/);
  assert.match(tileSetTerrainBuilder, /set_terrain_color/);
  assert.match(tileSetTerrainBuilder, /set_terrain_peering_bit/);
  assert.match(tileSetTerrainBuilder, /is_valid_terrain_peering_bit/);
  assert.match(tileSetSourceBuilder, /Texture2D/);
  assert.match(resourceGenericOperations, /ResourceSaver\.save/);
  assert.match(resourceSpriteFramesOperations, /ResourceSaver\.save/);
  assert.match(resourceTileSetOperations, /ResourceSaver\.save/);
});

test("Godot bridge exposes ShaderMaterial resource authoring endpoint", async () => {
  const bridge = await readBridgeWriteSurface();
  const resourceShaderOperations = await readAddonFile("niua_mcp_resource_shader_material_operations.gd");
  const shaderMaterialBuilder = await readAddonFile("niua_mcp_shader_material_builder.gd");

  await assertEndpointRoutes(["/resource/shader-material/create"]);
  assert.match(bridge, /_create_shader_material_resource/);
  assert.match(bridge, /NiuaMcpResourceOperations\.create_shader_material_resource/);
  assert.match(resourceShaderOperations, /NiuaMcpShaderMaterialBuilder\.build/);
  assert.match(shaderMaterialBuilder, /Shader\.new/);
  assert.match(shaderMaterialBuilder, /ShaderMaterial\.new/);
  assert.match(shaderMaterialBuilder, /set_shader_parameter/);
  assert.match(resourceShaderOperations, /ResourceSaver\.save/);
});

test("Godot bridge exposes Milestone 7A editor selection and focus endpoints", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_editor_selection_operations.gd");
  const nodeOperations = await readAddonFile("niua_mcp_editor_selection_node_operations.gd");
  const resourceOperations = await readAddonFile("niua_mcp_editor_selection_resource_operations.gd");
  const snapshots = await readAddonFile("niua_mcp_node_snapshot.gd");

  await assertEndpointRoutes([
    "/selection/set",
    "/selection/focus/node",
    "/resource/focus"
  ]);

  assert.match(bridge, /NiuaMcpEditorSelectionOperations\.set_selection/);
  assert.match(bridge, /NiuaMcpEditorSelectionOperations\.focus_node/);
  assert.match(bridge, /NiuaMcpEditorSelectionOperations\.focus_resource/);
  assert.match(operations, /NiuaMcpEditorSelectionNodeOperations\.set_selection/);
  assert.match(operations, /NiuaMcpEditorSelectionResourceOperations\.focus_resource/);
  assert.match(nodeOperations, /selection\.clear/);
  assert.match(nodeOperations, /selection\.add_node/);
  assert.match(snapshots, /selectedIndex/);
  assert.match(snapshots, /parentPath/);
  assert.match(snapshots, /ownerPath/);
  assert.match(snapshots, /ownerSceneFilePath/);
  assert.match(snapshots, /childCount/);
  assert.match(snapshots, /metadataKeys/);
  assert.match(snapshots, /uniqueNameInOwner/);
  assert.match(nodeOperations, /NiuaMcpNodeSnapshot\.selection_item/);
  assert.match(nodeOperations, /edit_node/);
  assert.match(resourceOperations, /select_file/);
  assert.match(resourceOperations, /inspect_object/);
});

test("Godot bridge exposes Milestone 2B project settings and input map endpoints", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const codec = await readAddonFile("niua_mcp_input_event_codec.gd");
  const codecWriter = await readAddonFile("niua_mcp_input_event_json_writer.gd");
  const codecWriterShared = await readAddonFile("niua_mcp_input_event_json_writer_shared.gd");
  const codecWriterKeyboardAction = await readAddonFile("niua_mcp_input_event_json_writer_keyboard_action.gd");
  const codecWriterPointer = await readAddonFile("niua_mcp_input_event_json_writer_pointer.gd");
  const codecWriterDevice = await readAddonFile("niua_mcp_input_event_json_writer_device.gd");
  const codecReader = await readAddonFile("niua_mcp_input_event_json_reader.gd");
  const codecSurface = `${codec}\n${codecWriter}\n${codecWriterShared}\n${codecWriterKeyboardAction}\n${codecWriterPointer}\n${codecWriterDevice}\n${codecReader}`;
  const metadata = await readAddonFile("niua_mcp_project_settings_metadata.gd");
  const queryMetadata = await readAddonFile("niua_mcp_project_settings_query_metadata.gd");
  const summaryMetadata = await readAddonFile("niua_mcp_project_settings_summary_metadata.gd");
  const categoryMetadata = await readAddonFile("niua_mcp_project_settings_category_metadata.gd");
  const metadataSurface = `${metadata}\n${queryMetadata}\n${summaryMetadata}\n${categoryMetadata}`;
  const operations = await readAddonFile("niua_mcp_project_settings_operations.gd");

  await assertEndpointRoutes([
    "/project/settings",
    "/project/setting/set",
    "/project/setting/metadata/set",
    "/input/map",
    "/input/action/set"
  ]);

  assert.match(readRoutes, /NiuaMcpProjectSettingsOperations\.project_settings/);
  assert.match(bridge, /NiuaMcpProjectSettingsOperations\.set_project_setting/);
  assert.match(bridge, /NiuaMcpProjectSettingsOperations\.set_project_setting_metadata/);
  assert.match(readRoutes, /NiuaMcpProjectSettingsOperations\.input_map/);
  assert.match(bridge, /NiuaMcpProjectSettingsOperations\.set_input_action/);
  assert.match(operations, /ProjectSettings\.set_setting/);
  assert.match(bridge, /_set_project_setting_metadata/);
  assert.match(operations, /ProjectSettings\.set_order/);
  assert.match(operations, /ProjectSettings\.set_initial_value/);
  assert.match(operations, /ProjectSettings\.set_as_basic/);
  assert.match(operations, /ProjectSettings\.set_as_internal/);
  assert.match(operations, /ProjectSettings\.set_restart_if_changed/);
  assert.match(operations, /NiuaMcpProjectSettingsMetadata\.setting_summary/);
  assert.match(operations, /NiuaMcpProjectSettingsMetadata\.settings_categories/);
  assert.match(operations, /NiuaMcpProjectSettingsMetadata\.setting_matches_filters/);
  assert.match(operations, /NiuaMcpProjectSettingsMetadata\.optional_query_bool/);
  assert.match(operations, /NiuaMcpProjectSettingsMetadata\.optional_filter_value/);
  assert.match(metadataSurface, /pathSegments/);
  assert.match(metadataSurface, /usageFlags/);
  assert.match(metadataSurface, /PROPERTY_USAGE_EDITOR_BASIC_SETTING/);
  assert.match(metadataSurface, /restartIfChanged/);
  assert.match(operations, /settingCount/);
  assert.match(operations, /editorVisible/);
  assert.match(operations, /InputMap\.add_action/);
  assert.match(operations, /NiuaMcpInputEventCodec\.event_from_json/);
  assert.match(operations, /NiuaMcpInputEventCodec\.events_to_json/);
  assert.match(codec, /NiuaMcpInputEventJsonWriter\.event_to_json/);
  assert.match(codec, /NiuaMcpInputEventJsonReader\.event_from_json/);
  assert.match(codecSurface, /InputEventScreenTouch/);
  assert.match(codecSurface, /InputEventScreenDrag/);
  assert.match(codecSurface, /InputEventMIDI/);
  assert.match(codecWriterShared, /base_input_event_json/);
  assert.match(codecWriterShared, /input_event_modifier_json/);
  assert.match(codecWriterShared, /input_event_window_json/);
  assert.match(codecWriterShared, /input_event_mouse_json/);
  assert.match(codecSurface, /event_index/);
  assert.match(codecSurface, /button_index/);
  assert.match(codecSurface, /axis_value/);
  assert.match(codecSurface, /controller_number/);
  assert.match(codecSurface, /double_tap/);
  assert.match(codecSurface, /screen_relative/);
});

test("Godot bridge exposes Milestone 2C script editor endpoints", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const scriptEditorOperations = await readAddonFile("niua_mcp_script_editor_operations.gd");
  const scriptEditorNavigation = await readAddonFile("niua_mcp_script_editor_navigation_operations.gd");
  const scriptEditorState = await readAddonFile("niua_mcp_script_editor_state_operations.gd");
  const scriptEditorOverviewState = await readAddonFile("niua_mcp_script_editor_overview_state.gd");
  const scriptEditorCursorState = await readAddonFile("niua_mcp_script_editor_cursor_state.gd");
  const scriptReplaceOperations = await readAddonFile("niua_mcp_script_replace_operations.gd");
  const scriptAnalysisOperations = await readAddonFile("niua_mcp_script_analysis_operations.gd");

  await assertEndpointRoutes([
    "/script/read",
    "/script/write",
    "/script/open",
    "/script/validate",
    "/script/symbols",
    "/script/editor/state",
    "/script/cursor/state",
    "/script/goto-line",
    "/script/refactor/replace"
  ]);

  assert.match(readRoutes, /_script_editor_state/);
  assert.match(bridge, /_goto_script_line/);
  assert.match(bridge, /NiuaMcpScriptFileOperations\.replace_in_scripts/);
  assert.match(readRoutes, /NiuaMcpScriptFileOperations\.script_symbols/);
  assert.match(readRoutes, /_script_cursor_state/);
  assert.match(readRoutes, /NiuaMcpScriptEditorOperations\.script_editor_state/);
  assert.match(readRoutes, /NiuaMcpScriptEditorOperations\.script_cursor_state/);
  assert.match(bridge, /NiuaMcpScriptEditorOperations\.goto_script_line/);
  assert.match(scriptEditorOperations, /NiuaMcpScriptEditorNavigationOperations\.goto_script_line/);
  assert.match(scriptEditorNavigation, /GDScript/);
  assert.match(scriptEditorNavigation, /NiuaMcpPathUtils\.validate_script_path/);
  assert.match(scriptEditorState, /NiuaMcpScriptEditorOverviewState\.script_editor_state/);
  assert.match(scriptEditorState, /NiuaMcpScriptEditorCursorState\.script_cursor_state/);
  assert.match(scriptEditorOverviewState, /get_script_editor/);
  assert.match(scriptEditorCursorState, /get_base_editor/);
  assert.match(scriptEditorOverviewState, /get_current_script/);
  assert.match(scriptEditorOverviewState, /get_open_scripts/);
  assert.match(scriptEditorOverviewState, /get_breakpoints/);
  assert.match(scriptEditorNavigation, /edit_script/);
  assert.match(scriptReplaceOperations, /maxReplacements/);
  assert.match(scriptReplaceOperations, /dryRun/);
  assert.match(scriptAnalysisOperations, /get_script_method_list/);
  assert.match(scriptAnalysisOperations, /get_script_property_list/);
  assert.match(scriptAnalysisOperations, /get_script_signal_list/);
  assert.match(scriptAnalysisOperations, /get_script_constant_map/);
  assert.match(scriptEditorCursorState, /get_base_editor/);
  assert.match(scriptEditorCursorState, /get_caret_count/);
  assert.match(scriptEditorCursorState, /get_caret_line/);
  assert.match(scriptEditorCursorState, /get_caret_column/);
  assert.match(scriptEditorCursorState, /get_selection_from_line/);
  assert.match(scriptEditorCursorState, /get_first_visible_line/);
  assert.match(scriptEditorCursorState, /get_last_full_visible_line/);
});

test("Godot bridge exposes Milestone 7B script creation and attachment endpoints", async () => {
  const bridge = await readBridgeWriteSurface();
  const scriptEditorOperations = await readAddonFile("niua_mcp_script_editor_operations.gd");
  const scriptEditorAuthoring = await readAddonFile("niua_mcp_script_editor_authoring_operations.gd");
  const templates = await readAddonFile("niua_mcp_script_templates.gd");

  await assertEndpointRoutes([
    "/script/create",
    "/script/attach"
  ]);

  assert.match(bridge, /_create_script/);
  assert.match(bridge, /NiuaMcpScriptEditorOperations\.create_script/);
  assert.match(scriptEditorOperations, /NiuaMcpScriptEditorAuthoringOperations\.create_script/);
  assert.match(scriptEditorAuthoring, /NiuaMcpScriptTemplates\.template_content/);
  assert.match(templates, /SCRIPT_TEMPLATES/);
  assert.match(templates, /class_name %s/);
  assert.match(templates, /node_lifecycle/);
  assert.match(templates, /node_process/);
  assert.match(templates, /tool_node/);
  assert.match(templates, /func _process\(delta: float\) -> void:/);
  assert.match(bridge, /_attach_script/);
  assert.match(bridge, /NiuaMcpScriptEditorOperations\.attach_script/);
  assert.match(scriptEditorAuthoring, /set_script/);
  assert.match(scriptEditorAuthoring, /ResourceLoader\.load/);
  assert.match(scriptEditorAuthoring, /GDScript/);
});

test("Godot bridge exposes Milestone 7E create-node-with-script endpoint", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_scene_graph_operations.gd");
  const nodeCreationOperations = await readAddonFile("niua_mcp_scene_node_creation_operations.gd");
  const nodeScriptCreationOperations = await readAddonFile("niua_mcp_scene_node_script_creation.gd");

  await assertEndpointRoutes(["/scene/node/create-with-script"]);
  assert.match(bridge, /_create_node_with_script/);
  assert.match(bridge, /NiuaMcpSceneGraphOperations\.create_node_with_script/);
  assert.match(operations, /create_node\(editor, body, path_validator\)/);
  assert.match(bridge, /_create_script/);
  assert.match(bridge, /_attach_script/);
  assert.match(operations, /NiuaMcpSceneNodeOperations\.create_node_with_script/);
  assert.match(nodeCreationOperations, /NiuaMcpSceneNodeScriptCreation\.create_node_with_script/);
  assert.match(nodeScriptCreationOperations, /scriptTemplate/);
  assert.match(nodeScriptCreationOperations, /scriptClassName/);
  assert.match(nodeScriptCreationOperations, /create_body\["template"\]/);
  assert.match(nodeScriptCreationOperations, /create_body\["className"\]/);
});

test("Godot bridge exposes Milestone 7F node type search endpoint", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const operations = await readAddonFile("niua_mcp_node_type_operations.gd");

  await assertEndpointRoutes(["/node-types/search"]);
  assert.match(readRoutes, /_search_node_types/);
  assert.match(readRoutes, /NiuaMcpNodeTypeOperations\.search_node_types/);
  assert.match(operations, /ClassDB\.get_class_list/);
  assert.match(operations, /ClassDB\.get_parent_class/);
  assert.match(operations, /ClassDB\.is_parent_class/);
  assert.match(operations, /ClassDB\.can_instantiate/);
  assert.match(operations, /ClassDB\.is_class_enabled/);
  assert.match(operations, /includeDisabled/);
  assert.match(operations, /enabled/);
  assert.match(operations, /isBaseType/);
  assert.match(operations, /inheritanceDepth/);
  assert.match(operations, /inheritanceChain/);
  assert.match(operations, /class_inheritance_chain/);
});

test("Godot bridge exposes Milestone 2D import dock endpoints", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const importMetadata = await readAddonFile("niua_mcp_import_metadata.gd");
  const metadataQueries = await readAddonFile("niua_mcp_import_metadata_queries.gd");
  const importOperations = await readAddonFile("niua_mcp_import_operations.gd");
  const importEventTracker = await readAddonFile("niua_mcp_import_event_tracker.gd");

  await assertEndpointRoutes([
    "/import/assets",
    "/import/metadata",
    "/import/diagnostics",
    "/import/events",
    "/import/options/set",
    "/import/reimport"
  ]);

  assert.match(importOperations, /ConfigFile/);
  assert.match(importOperations, /reimport_files/);
  assert.match(importMetadata, /NiuaMcpImportMetadataQueries\.get_metadata/);
  assert.match(metadataQueries, /NiuaMcpPathUtils\.import_sidecar_path/);
  assert.match(readRoutes, /NiuaMcpImportOperations\.list_imported_assets/);
  assert.match(readRoutes, /NiuaMcpImportOperations\.get_import_metadata/);
  assert.match(readRoutes, /NiuaMcpImportOperations\.get_import_diagnostics/);
  assert.match(bridge, /NiuaMcpImportEventTracker/);
  assert.match(readRoutes, /_context\.import_event_tracker\.response/);
  assert.match(bridge, /NiuaMcpImportOperations\.set_import_options/);
  assert.match(bridge, /NiuaMcpImportOperations\.reimport_assets/);
  assert.match(importOperations, /NiuaMcpImportMetadata\.list_imported_assets/);
  assert.match(importOperations, /NiuaMcpImportMetadata\.get_metadata/);
  assert.match(importOperations, /NiuaMcpImportMetadata\.get_diagnostics/);
  assert.match(importOperations, /NiuaMcpImportMetadata\.summary/);
  assert.match(importOperations, /NiuaMcpImportMetadata\.event_summary/);
  assert.match(bridge, /_set_import_options/);
  assert.match(readRoutes, /_get_import_diagnostics/);
  assert.doesNotMatch(bridge, /var _import_events/);
  assert.doesNotMatch(bridge, /func _record_import_event/);
  assert.doesNotMatch(bridge, /resources_reimporting/);
  assert.doesNotMatch(bridge, /resources_reimported/);
  assert.doesNotMatch(bridge, /sources_changed/);
  assert.match(importEventTracker, /resources_reimporting/);
  assert.match(importEventTracker, /resources_reimported/);
  assert.match(importEventTracker, /sources_changed/);
  assert.match(metadataQueries, /source_newer_than_metadata/);
  assert.match(metadataQueries, /missing_import_target/);
  assert.match(metadataQueries, /FileAccess\.get_modified_time/);
  assert.match(importOperations, /set_value\("params"/);
  assert.match(importOperations, /config\.save\(metadata_path\)/);
});

test("Godot bridge exposes Milestone 3A run control endpoints", async () => {
	const bridge = await readBridgeWriteSurface();
	const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
	const operations = await readAddonFile("niua_mcp_run_operations.gd");
	const runSettings = await readAddonFile("niua_mcp_run_settings_operations.gd");
	const runControl = await readAddonFile("niua_mcp_run_control_operations.gd");
	const runUtils = await readAddonFile("niua_mcp_run_utils.gd");

  await assertEndpointRoutes([
    "/run/settings",
    "/run/main-scene/set",
    "/run/status",
    "/run/main",
    "/run/current",
    "/run/custom",
    "/run/stop",
    "/run/reload"
  ]);

  for (const method of ["run_settings", "run_status"]) {
    assert.match(readRoutes, new RegExp("NiuaMcpRunOperations\\." + method));
  }

  for (const method of [
    "set_main_scene",
    "run_main_scene",
    "run_current_scene",
    "run_custom_scene",
    "stop_running_scene",
    "reload_running_scene"
  ]) {
    assert.match(bridge, new RegExp("NiuaMcpRunOperations\\." + method));
  }

	for (const method of [
		"play_main_scene",
		"play_current_scene",
		"play_custom_scene",
		"stop_playing_scene",
		"is_playing_scene",
		"get_playing_scene"
	]) {
		assert.match(runControl, new RegExp(method));
	}
	assert.match(runUtils, /application\/run\/main_scene/);
	assert.match(runSettings, /MAIN_SCENE_SETTING/);
	assert.doesNotMatch(operations, /play_main_scene/);
	assert.doesNotMatch(operations, /application\/run\/main_scene/);

	assert.match(readRoutes, /_run_settings/);
	assert.match(bridge, /_set_main_scene/);
	assert.match(bridge, /_reload_running_scene/);
});

test("Godot run operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const operations = await readAddonFile("niua_mcp_run_operations.gd");

  assert.match(bridge, /preload\("niua_mcp_run_operations\.gd"\)/);
  assert.match(readRoutes, /NiuaMcpRunOperations\.run_settings/);
  assert.match(bridge, /NiuaMcpRunOperations\.set_main_scene/);
  assert.match(readRoutes, /NiuaMcpRunOperations\.run_status/);
  assert.match(bridge, /NiuaMcpRunOperations\.run_main_scene/);
  assert.match(bridge, /NiuaMcpRunOperations\.run_current_scene/);
  assert.match(bridge, /NiuaMcpRunOperations\.run_custom_scene/);
  assert.match(bridge, /NiuaMcpRunOperations\.stop_running_scene/);
  assert.match(bridge, /NiuaMcpRunOperations\.reload_running_scene/);
	assert.doesNotMatch(bridge, /func _run_status_data/);
	assert.doesNotMatch(bridge, /func _run_result_data/);
	assert.doesNotMatch(bridge, /func _save_before_run_if_requested/);
	assert.match(operations, /extends RefCounted/);
	assert.match(operations, /preload\("niua_mcp_run_settings_operations\.gd"\)/);
	assert.match(operations, /preload\("niua_mcp_run_control_operations\.gd"\)/);
	assert.match(operations, /preload\("niua_mcp_run_side_effects\.gd"\)/);
	assert.match(operations, /static func run_settings\(editor: EditorInterface\) -> Dictionary:/);
	assert.match(operations, /static func set_main_scene\(editor: EditorInterface, body: Dictionary, save_project_settings: Callable\) -> Dictionary:/);
	assert.match(operations, /static func run_status\(editor: EditorInterface\) -> Dictionary:/);
  assert.match(operations, /static func run_main_scene\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func run_current_scene\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
	assert.match(operations, /static func run_custom_scene\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
	assert.match(operations, /static func stop_running_scene\(editor: EditorInterface\) -> Dictionary:/);
	assert.match(operations, /static func reload_running_scene\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
	assert.doesNotMatch(operations, /play_main_scene/);
	assert.doesNotMatch(operations, /play_current_scene/);
	assert.doesNotMatch(operations, /play_custom_scene/);
	assert.doesNotMatch(operations, /stop_playing_scene/);
	assert.doesNotMatch(operations, /save_all_scenes/);
});

test("Godot run operations delegate focused domain modules", async () => {
	const bridge = await readAddonFile("niua_mcp_bridge.gd");
	const facade = await readAddonFile("niua_mcp_run_operations.gd");
	const utils = await readAddonFile("niua_mcp_run_utils.gd");
	const settings = await readAddonFile("niua_mcp_run_settings_operations.gd");
	const control = await readAddonFile("niua_mcp_run_control_operations.gd");
	const sideEffects = await readAddonFile("niua_mcp_run_side_effects.gd");

	assert.doesNotMatch(bridge, /ensure_headless_run_args/);
	assert.match(facade, /preload\("niua_mcp_run_settings_operations\.gd"\)/);
	assert.match(facade, /preload\("niua_mcp_run_control_operations\.gd"\)/);
	assert.match(facade, /preload\("niua_mcp_run_side_effects\.gd"\)/);
	assert.match(facade, /NiuaMcpRunSettingsOperations\.run_settings/);
	assert.match(facade, /NiuaMcpRunSettingsOperations\.set_main_scene/);
	assert.match(facade, /NiuaMcpRunSettingsOperations\.run_status/);
	assert.match(facade, /NiuaMcpRunControlOperations\.run_main_scene/);
	assert.match(facade, /NiuaMcpRunControlOperations\.run_current_scene/);
	assert.match(facade, /NiuaMcpRunControlOperations\.run_custom_scene/);
	assert.match(facade, /NiuaMcpRunControlOperations\.stop_running_scene/);
	assert.match(facade, /NiuaMcpRunControlOperations\.reload_running_scene/);
	assert.match(facade, /NiuaMcpRunSideEffects\.set_main_scene_with_side_effects/);
	assert.match(facade, /NiuaMcpRunSideEffects\.reload_running_scene_with_side_effects/);
	assert.doesNotMatch(facade, /ProjectSettings\.set_setting/);
	assert.doesNotMatch(facade, /play_custom_scene/);
	assert.doesNotMatch(facade, /func _remember/);
	assert.doesNotMatch(facade, /func _error/);

	assert.match(utils, /const MAIN_SCENE_SETTING := "application\/run\/main_scene"/);
	assert.doesNotMatch(utils, /MAIN_RUN_ARGS_SETTING/);
	assert.doesNotMatch(utils, /editor\/run\/main_run_args/);
	assert.doesNotMatch(utils, /ProjectSettings\.set_setting\([^)]*main_run_args/);
	assert.doesNotMatch(utils, /--headless/);
	assert.match(utils, /static func run_result_data\(editor: EditorInterface, mode: String\) -> Dictionary:/);
	assert.match(utils, /static func run_status_data\(editor: EditorInterface\) -> Dictionary:/);
	assert.match(utils, /ProjectSettings\.globalize_path\("res:\/\/"\)/);
	assert.match(utils, /DisplayServer\.get_name\(\)/);
	assert.match(utils, /OS\.get_process_id\(\)/);
	assert.match(utils, /"interactive": display_server != "headless"/);
	assert.match(utils, /static func require_editor_method\(editor: EditorInterface, method_name: String\) -> Dictionary:/);
	assert.match(utils, /static func save_before_run_if_requested\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
	assert.match(utils, /static func remember\(remember: Callable, message: String\) -> void:/);
	assert.match(utils, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
	assert.match(utils, /save_all_scenes/);

	assert.match(settings, /preload\("niua_mcp_path_utils\.gd"\)/);
	assert.match(settings, /preload\("niua_mcp_run_utils\.gd"\)/);
	assert.match(settings, /static func run_settings\(editor: EditorInterface\) -> Dictionary:/);
	assert.match(settings, /static func set_main_scene\(editor: EditorInterface, body: Dictionary, save_project_settings: Callable\) -> Dictionary:/);
	assert.match(settings, /static func run_status\(editor: EditorInterface\) -> Dictionary:/);
	assert.match(settings, /ProjectSettings\.get_setting/);
	assert.match(settings, /ProjectSettings\.set_setting/);

	assert.match(control, /preload\("niua_mcp_path_utils\.gd"\)/);
	assert.match(control, /preload\("niua_mcp_run_utils\.gd"\)/);
	assert.match(control, /static func run_main_scene\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
	assert.match(control, /static func run_current_scene\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
	assert.match(control, /static func run_custom_scene\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
	assert.match(control, /static func stop_running_scene\(editor: EditorInterface\) -> Dictionary:/);
	assert.match(control, /static func reload_running_scene\(editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
	assert.match(control, /play_main_scene/);
	assert.match(control, /play_current_scene/);
	assert.match(control, /play_custom_scene/);
	assert.match(control, /stop_playing_scene/);
	assert.doesNotMatch(control, /ensure_headless_run_args/);
	assert.match(control, /_schedule_play_custom_scene_after_stop/);
	assert.match(control, /create_timer\(0\.25\)/);

	assert.match(sideEffects, /preload\("niua_mcp_run_settings_operations\.gd"\)/);
	assert.match(sideEffects, /preload\("niua_mcp_run_control_operations\.gd"\)/);
	assert.match(sideEffects, /preload\("niua_mcp_run_utils\.gd"\)/);
	assert.match(sideEffects, /static func set_main_scene_with_side_effects\(editor: EditorInterface, body: Dictionary, save_project_settings: Callable, remember: Callable\) -> Dictionary:/);
	assert.match(sideEffects, /static func run_main_scene_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
	assert.match(sideEffects, /static func reload_running_scene_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
	assert.match(sideEffects, /Set main scene %s/);
	assert.match(sideEffects, /Requested run main scene/);
	assert.match(sideEffects, /Requested reload running scene %s/);
});

test("Godot run bridge side effects live in run operations", async () => {
	const bridge = await readBridgeWriteSurface();
	const operations = await readAddonFile("niua_mcp_run_operations.gd");
	const sideEffects = await readAddonFile("niua_mcp_run_side_effects.gd");

	assert.match(operations, /static func set_main_scene_with_side_effects\(editor: EditorInterface, body: Dictionary, save_project_settings: Callable, remember: Callable\) -> Dictionary:/);
	assert.match(operations, /static func run_main_scene_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func run_current_scene_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
	assert.match(operations, /static func run_custom_scene_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
	assert.match(operations, /static func stop_running_scene_with_side_effects\(editor: EditorInterface, remember: Callable\) -> Dictionary:/);
	assert.match(operations, /static func reload_running_scene_with_side_effects\(editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
	assert.match(operations, /NiuaMcpRunSideEffects\.set_main_scene_with_side_effects/);
	assert.match(operations, /NiuaMcpRunSideEffects\.run_main_scene_with_side_effects/);
	assert.match(operations, /NiuaMcpRunSideEffects\.reload_running_scene_with_side_effects/);
	assert.match(sideEffects, /NiuaMcpRunUtils\.remember\(remember, "Set main scene %s"/);
	assert.match(sideEffects, /NiuaMcpRunUtils\.remember\(remember, "Requested run main scene"/);
	assert.match(sideEffects, /NiuaMcpRunUtils\.remember\(remember, "Requested reload running scene %s"/);
	assert.doesNotMatch(operations, /Set main scene %s/);
	assert.doesNotMatch(operations, /Requested run main scene/);
	assert.doesNotMatch(operations, /Requested reload running scene %s/);
	assert.doesNotMatch(bridge, /Set main scene %s/);
	assert.doesNotMatch(bridge, /Requested run main scene/);
  assert.doesNotMatch(bridge, /Requested run current scene/);
  assert.doesNotMatch(bridge, /Requested run custom scene %s/);
  assert.doesNotMatch(bridge, /Requested stop running scene/);
  assert.doesNotMatch(bridge, /Requested reload running scene %s/);
});

test("Godot bridge exposes Milestone 7S scene tab control endpoints", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const sceneTabs = await readAddonFile("niua_mcp_scene_tab_operations.gd");
  const sceneTabState = await readAddonFile("niua_mcp_scene_tab_state.gd");
  const sceneTabControl = await readAddonFile("niua_mcp_scene_tab_control.gd");
  const sceneTabUndoRedo = await readAddonFile("niua_mcp_scene_tab_undo_redo.gd");

  await assertEndpointRoutes(["/scene/tabs"]);
  await assertEndpointRoutes(["/scene/switch"]);
  await assertEndpointRoutes(["/scene/close"]);
  await assertEndpointRoutes(["/scene/mark-unsaved"]);
  await assertEndpointRoutes(["/editor/undo"]);
  await assertEndpointRoutes(["/editor/redo"]);
  assert.match(readRoutes, /NiuaMcpSceneTabOperations\.open_scene_tabs/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.switch_scene_tab/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.close_scene_tab/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.mark_scene_unsaved/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.undo_editor_action/);
  assert.match(bridge, /NiuaMcpSceneTabOperations\.redo_editor_action/);
  assert.match(sceneTabs, /NiuaMcpSceneTabState\.open_scene_tabs/);
  assert.match(sceneTabs, /NiuaMcpSceneTabControl\.switch_scene_tab/);
  assert.match(sceneTabs, /NiuaMcpSceneTabUndoRedo\.undo_editor_action/);
  assert.match(sceneTabState, /currentIndex/);
  assert.match(sceneTabState, /tabs/);
  assert.match(sceneTabState, /get_open_scenes/);
  assert.match(sceneTabState, /_scene_tab_metadata/);
  assert.match(sceneTabState, /get_open_scene_roots/);
  assert.match(sceneTabState, /is_object_edited/);
  assert.match(sceneTabState, /historyVersion/);
  assert.match(sceneTabState, /dirtySource/);
  assert.match(sceneTabState, /unsaved/);
  assert.match(sceneTabControl, /open_scene_from_path/);
  assert.match(sceneTabControl, /close_scene/);
  assert.match(sceneTabControl, /mark_scene_as_unsaved/);
  assert.match(sceneTabUndoRedo, /get_editor_undo_redo/);
  assert.match(sceneTabUndoRedo, /_apply_editor_undo_redo/);
  assert.match(sceneTabUndoRedo, /_resolve_editor_undo_redo/);
  assert.match(sceneTabUndoRedo, /_undo_redo_state/);
  assert.match(sceneTabUndoRedo, /UndoRedo/);
  assert.match(sceneTabUndoRedo, /\.undo\(\)/);
  assert.match(sceneTabUndoRedo, /\.redo\(\)/);
});

test("Godot bridge exposes Milestone 4A export preset endpoint", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const operations = await readAddonFile("niua_mcp_export_operations.gd");

  await assertEndpointRoutes(["/export/presets"]);
  await assertEndpointRoutes(["/export/preset/upsert"]);
  assert.match(operations, /export_presets\.cfg/);
  assert.match(readRoutes, /_export_presets/);
  assert.match(bridge, /_upsert_export_preset/);
  assert.match(readRoutes, /NiuaMcpExportOperations\.export_presets/);
  assert.match(bridge, /NiuaMcpExportOperations\.upsert_export_preset/);
  assert.match(operations, /NiuaMcpExportPresets\.preset_summaries/);
  assert.match(operations, /NiuaMcpExportPresets\.find_preset_index/);
  assert.match(operations, /NiuaMcpExportPresets\.next_preset_index/);
  assert.match(operations, /NiuaMcpExportPresets\.preset_summary/);
  assert.match(operations, /config\.save/);
});

test("Godot bridge exposes Milestone 5A viewport screenshot endpoint", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const viewportResolver = await readAddonFile("niua_mcp_viewport_resolver.gd");
  const viewportScreenshots = await readAddonFile("niua_mcp_viewport_screenshot_operations.gd");
  const viewportUtils = await readAddonFile("niua_mcp_viewport_utils.gd");

  await assertEndpointRoutes(["/viewport/screenshot"]);
  assert.match(readRoutes, /NiuaMcpViewportOperations\.capture_viewport_screenshot/);
  assert.match(viewportResolver, /get_editor_viewport_2d/);
  assert.match(viewportResolver, /get_editor_viewport_3d/);
  assert.match(viewportScreenshots, /DisplayServer\.get_name/);
  assert.match(viewportScreenshots, /save_png_to_buffer/);
  assert.match(viewportScreenshots, /Marshalls\.raw_to_base64/);
  assert.match(viewportScreenshots, /screenshot_unavailable/);
  assert.match(viewportScreenshots, /"available": true/);
  assert.match(viewportUtils, /"available": false/);
});

test("Godot bridge exposes Milestone 8A viewport state and main-screen endpoints", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const codec = await readAddonFile("niua_mcp_input_event_codec.gd");
  const codecReader = await readAddonFile("niua_mcp_input_event_json_reader.gd");
  const editorSurfaceOperations = await readAddonFile("niua_mcp_editor_surface_operations.gd");
  const editorMainScreenOperations = await readAddonFile("niua_mcp_editor_surface_main_screen_operations.gd");
  const viewportCameraOperations = await readAddonFile("niua_mcp_viewport_camera_operations.gd");
  const viewportInputOperations = await readAddonFile("niua_mcp_viewport_input_operations.gd");
  const viewportStateOperations = await readAddonFile("niua_mcp_viewport_state_operations.gd");

  await assertEndpointRoutes([
    "/viewport/state",
    "/viewport/camera/set",
    "/viewport/input/send",
    "/editor/main-screen/set"
  ]);

  assert.match(readRoutes, /NiuaMcpViewportOperations\.viewport_state/);
  assert.match(bridge, /NiuaMcpViewportOperations\.set_viewport_camera/);
  assert.match(bridge, /NiuaMcpViewportOperations\.send_viewport_input/);
  assert.match(bridge, /NiuaMcpEditorSurfaceOperations\.set_main_screen/);
  assert.match(editorSurfaceOperations, /NiuaMcpEditorSurfaceMainScreenOperations\.set_main_screen/);
  assert.match(editorMainScreenOperations, /set_main_screen_editor/);
  assert.match(editorMainScreenOperations, /get_editor_main_screen/);
  assert.match(viewportStateOperations, /get_visible_rect/);
  assert.match(viewportStateOperations, /get_camera_3d/);
  assert.match(viewportStateOperations, /get_camera_2d/);
  assert.match(viewportStateOperations, /global_position/);
  assert.match(viewportCameraOperations, /global_rotation/);
  assert.match(viewportCameraOperations, /global_rotation_degrees/);
  assert.match(viewportCameraOperations, /zoom/);
  assert.match(viewportCameraOperations, /fov/);
  assert.match(viewportInputOperations, /push_input/);
  assert.match(viewportInputOperations, /notify_mouse_entered/);
  assert.match(viewportInputOperations, /update_mouse_cursor_state/);
  assert.match(viewportInputOperations, /NiuaMcpInputEventCodec\.event_from_json/);
  assert.match(codec, /NiuaMcpInputEventJsonReader\.event_from_json/);
  assert.match(codecReader, /InputEventMouseMotion/);
});

test("Godot bridge exposes Milestone 8D allowlisted editor actions", async () => {
  const bridge = await readBridgeWriteSurface();
  const editorActions = await readAddonFile("niua_mcp_editor_actions.gd");

  await assertEndpointRoutes(["/editor/action/invoke"]);
  assert.match(bridge, /_invoke_editor_action/);
  assert.match(bridge, /NiuaMcpEditorActions\.invoke/);
  assert.match(editorActions, /static func allowed_actions\(\) -> Array:/);
  assert.match(editorActions, /set_distraction_free_mode/);
  assert.match(editorActions, /select_file/);
  assert.match(editorActions, /scan_sources/);
  assert.match(editorActions, /update_file/);
  assert.match(editorActions, /reload_scene_from_path/);
  assert.match(editorActions, /set_movie_maker_enabled/);
});

test("Godot bridge exposes Milestone 5D editor screenshot endpoint", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const editorSurfaceOperations = await readAddonFile("niua_mcp_editor_surface_operations.gd");
  const editorScreenshotOperations = await readAddonFile("niua_mcp_editor_surface_screenshot_operations.gd");

  await assertEndpointRoutes(["/editor/screenshot"]);
  assert.match(readRoutes, /NiuaMcpEditorSurfaceOperations\.capture_editor_screenshot/);
  assert.match(editorSurfaceOperations, /NiuaMcpEditorSurfaceScreenshotOperations\.capture_editor_screenshot/);
  assert.match(editorScreenshotOperations, /get_base_control/);
  assert.match(editorScreenshotOperations, /get_viewport/);
  assert.match(editorScreenshotOperations, /save_png_to_buffer/);
  assert.match(editorScreenshotOperations, /"available": true/);
  assert.match(editorScreenshotOperations, /"available": false/);
});

test("Godot bridge exposes Milestone 5B debugger state endpoint", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const operations = await readAddonFile("niua_mcp_debugger_runtime_operations.gd");
  const controls = await readAddonFile("niua_mcp_debugger_control_operations.gd");
  const debuggerProbe = await readAddonFile("niua_mcp_debugger_probe.gd");
  const debuggerProbeCommands = await readAddonFile("niua_mcp_debugger_probe_session_commands.gd");
  const debuggerProbeHost = await readAddonFile("niua_mcp_debugger_probe_host.gd");

  await assertEndpointRoutes(["/debugger/state"]);
  await assertEndpointRoutes(["/debugger/breakpoint/set"]);
  await assertEndpointRoutes(["/debugger/profiler/toggle"]);
  await assertEndpointRoutes(["/debugger/message/send"]);
  assert.match(debuggerProbe, /EditorDebuggerPlugin/);
  assert.match(bridge, /_debugger_probe_host\.probe\(\)/);
  assert.doesNotMatch(bridge, /add_debugger_plugin/);
  assert.doesNotMatch(bridge, /remove_debugger_plugin/);
  assert.match(debuggerProbeHost, /add_debugger_plugin/);
  assert.match(debuggerProbeHost, /remove_debugger_plugin/);
  assert.match(readRoutes, /NiuaMcpDebuggerRuntimeOperations\.debugger_state/);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.set_debugger_breakpoint/);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.toggle_debugger_profiler/);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.send_debugger_message/);
  assert.match(operations, /NiuaMcpDebuggerControlOperations\.debugger_state/);
  assert.match(controls, /get_breakpoints/);
  assert.match(debuggerProbeCommands, /session\.set_breakpoint/);
  assert.match(controls, /toggle_profiler_for_sessions/);
  assert.match(debuggerProbeCommands, /session\.toggle_profiler/);
  assert.match(controls, /requestedProfiler/);
  assert.match(debuggerProbeCommands, /profiler_toggled/);
  assert.match(controls, /send_message_for_sessions/);
  assert.match(debuggerProbeCommands, /session\.send_message/);
  assert.match(controls, /requestedMessage/);
  assert.match(debuggerProbeCommands, /debugger_message_sent/);
  assert.match(controls, /Performance\.get_monitor/);
});

test("Godot debugger runtime operations live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const operations = await readAddonFile("niua_mcp_debugger_runtime_operations.gd");
  const controls = await readAddonFile("niua_mcp_debugger_control_operations.gd");
  const runtimeState = await readAddonFile("niua_mcp_runtime_state_operations.gd");
  const runtimeNode = await readAddonFile("niua_mcp_runtime_node_operations.gd");
  const runtimeScreenshot = await readAddonFile("niua_mcp_runtime_screenshot_operations.gd");
  const probeInstaller = await readAddonFile("niua_mcp_runtime_probe_installer.gd");

  assert.match(bridge, /preload\("niua_mcp_debugger_runtime_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_debugger_control_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_runtime_state_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_runtime_node_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_runtime_screenshot_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_runtime_probe_installer\.gd"\)/);
  assert.match(readRoutes, /NiuaMcpDebuggerRuntimeOperations\.debugger_state/);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.set_debugger_breakpoint/);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.toggle_debugger_profiler/);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.send_debugger_message/);
  assert.match(readRoutes, /NiuaMcpDebuggerRuntimeOperations\.runtime_state/);
  assert.match(readRoutes, /NiuaMcpDebuggerRuntimeOperations\.runtime_events/);
  assert.match(readRoutes, /NiuaMcpDebuggerRuntimeOperations\.runtime_node_properties/);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.set_runtime_node_property/);
  assert.match(readRoutes, /NiuaMcpDebuggerRuntimeOperations\.runtime_node_property_set_result/);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.capture_runtime_screenshot/);
  assert.match(readRoutes, /NiuaMcpDebuggerRuntimeOperations\.runtime_screenshot_result/);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.install_runtime_probe/);
  assert.doesNotMatch(bridge, /func _debugger_breakpoints/);
  assert.doesNotMatch(bridge, /func _debugger_monitors/);
  assert.doesNotMatch(bridge, /Performance\.get_monitor/);
  assert.match(operations, /extends RefCounted/);
  assert.match(controls, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(operations, /static func debugger_state\(debugger_probe, editor: EditorInterface\) -> Dictionary:/);
  assert.match(operations, /static func set_debugger_breakpoint\(debugger_probe, editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func toggle_debugger_profiler\(debugger_probe, editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func send_debugger_message\(debugger_probe, editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func runtime_state\(debugger_probe, query: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func runtime_events\(debugger_probe, query: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func runtime_node_properties\(debugger_probe, query: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func set_runtime_node_property\(debugger_probe, body: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func runtime_node_property_set_result\(debugger_probe, query: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func capture_runtime_screenshot\(debugger_probe\) -> Dictionary:/);
  assert.match(operations, /static func runtime_screenshot_result\(debugger_probe, query: Dictionary\) -> Dictionary:/);
  assert.match(operations, /static func install_runtime_probe\(body: Dictionary\) -> Dictionary:/);
  assert.match(controls, /static func debugger_state\(debugger_probe, editor: EditorInterface\) -> Dictionary:/);
  assert.match(controls, /Performance\.get_monitor/);
  assert.match(runtimeState, /static func runtime_state\(debugger_probe, query: Dictionary\) -> Dictionary:/);
  assert.match(runtimeNode, /static func runtime_node_properties\(debugger_probe, query: Dictionary\) -> Dictionary:/);
  assert.match(runtimeScreenshot, /send_runtime_screenshot_request/);
  assert.match(probeInstaller, /static func install_runtime_probe\(body: Dictionary\) -> Dictionary:/);
  assert.match(probeInstaller, /RUNTIME_PROBE_AUTOLOAD_NAME := "NiuaMcpRuntimeProbe"/);
});

test("Godot debugger runtime operations delegate focused domain modules", async () => {
  const operations = await readAddonFile("niua_mcp_debugger_runtime_operations.gd");
  const control = await readAddonFile("niua_mcp_debugger_control_operations.gd");
  const runtimeState = await readAddonFile("niua_mcp_runtime_state_operations.gd");
  const runtimeNode = await readAddonFile("niua_mcp_runtime_node_operations.gd");
  const runtimeScreenshot = await readAddonFile("niua_mcp_runtime_screenshot_operations.gd");
  const probeInstaller = await readAddonFile("niua_mcp_runtime_probe_installer.gd");

  assert.match(operations, /preload\("niua_mcp_debugger_control_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_runtime_state_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_runtime_node_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_runtime_screenshot_operations\.gd"\)/);
  assert.match(operations, /preload\("niua_mcp_runtime_probe_installer\.gd"\)/);
  assert.match(operations, /NiuaMcpDebuggerControlOperations\.debugger_state/);
  assert.match(operations, /NiuaMcpRuntimeStateOperations\.runtime_state/);
  assert.match(operations, /NiuaMcpRuntimeNodeOperations\.runtime_node_properties/);
  assert.match(operations, /NiuaMcpRuntimeScreenshotOperations\.capture_runtime_screenshot/);
  assert.match(operations, /NiuaMcpRuntimeProbeInstaller\.install_runtime_probe/);
  assert.doesNotMatch(operations, /Performance\.get_monitor/);
  assert.doesNotMatch(operations, /ProjectSettings\.set_setting/);
  assert.doesNotMatch(operations, /send_runtime_node_properties_request/);
  assert.doesNotMatch(operations, /send_runtime_screenshot_request/);

  assert.match(control, /static func debugger_state\(debugger_probe, editor: EditorInterface\) -> Dictionary:/);
  assert.match(control, /static func set_debugger_breakpoint\(debugger_probe, editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(control, /static func debugger_breakpoint_summary\(raw_breakpoint: String\) -> Dictionary:/);
  assert.match(control, /Performance\.get_monitor/);
  assert.match(runtimeState, /static func runtime_state\(debugger_probe, query: Dictionary\) -> Dictionary:/);
  assert.match(runtimeState, /static func runtime_events\(debugger_probe, query: Dictionary\) -> Dictionary:/);
  assert.match(runtimeState, /send_runtime_snapshot_request/);
  assert.match(runtimeState, /filtered_events/);
  assert.match(runtimeNode, /static func runtime_node_properties\(debugger_probe, query: Dictionary\) -> Dictionary:/);
  assert.match(runtimeNode, /static func set_runtime_node_property\(debugger_probe, body: Dictionary\) -> Dictionary:/);
  assert.match(runtimeNode, /static func runtime_node_property_set_result\(debugger_probe, query: Dictionary\) -> Dictionary:/);
  assert.match(runtimeNode, /send_runtime_node_properties_request/);
  assert.match(runtimeNode, /send_runtime_node_property_set_request/);
  assert.match(runtimeScreenshot, /static func capture_runtime_screenshot\(debugger_probe\) -> Dictionary:/);
  assert.match(runtimeScreenshot, /static func runtime_screenshot_result\(debugger_probe, query: Dictionary\) -> Dictionary:/);
  assert.match(runtimeScreenshot, /send_runtime_screenshot_request/);
  assert.match(probeInstaller, /static func install_runtime_probe\(body: Dictionary\) -> Dictionary:/);
  assert.match(probeInstaller, /static func install_runtime_probe_with_side_effects\(body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(probeInstaller, /RUNTIME_PROBE_AUTOLOAD_NAME := "NiuaMcpRuntimeProbe"/);
  assert.match(probeInstaller, /ProjectSettings\.set_setting/);
});

test("Godot debugger control operations delegate focused domain modules", async () => {
  const facade = await readAddonFileExact("niua_mcp_debugger_control_operations.gd");
  const state = await readAddonFile("niua_mcp_debugger_control_state.gd");
  const commands = await readAddonFile("niua_mcp_debugger_control_commands.gd");
  const sideEffects = await readAddonFile("niua_mcp_debugger_control_side_effects.gd");
  const utils = await readAddonFile("niua_mcp_debugger_control_utils.gd");

  assert.match(facade, /preload\("niua_mcp_debugger_control_state\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_debugger_control_commands\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_debugger_control_side_effects\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_debugger_control_utils\.gd"\)/);
  assert.match(facade, /static func debugger_state\(debugger_probe, editor: EditorInterface\) -> Dictionary:/);
  assert.match(facade, /static func set_debugger_breakpoint\(debugger_probe, editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(facade, /static func toggle_debugger_profiler\(debugger_probe, editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(facade, /static func send_debugger_message\(debugger_probe, editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(facade, /static func set_debugger_breakpoint_with_side_effects\(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(facade, /static func debugger_breakpoint_summary\(raw_breakpoint: String\) -> Dictionary:/);
  assert.doesNotMatch(facade, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.doesNotMatch(facade, /Performance\.get_monitor/);
  assert.doesNotMatch(facade, /validate_script_path/);
  assert.doesNotMatch(facade, /set_breakpoint_for_sessions/);
  assert.doesNotMatch(facade, /static func _remember/);
  assert.doesNotMatch(facade, /Set debugger breakpoint %s:%d enabled=%s/);

  assert.match(state, /static func debugger_state\(debugger_probe, editor: EditorInterface\) -> Dictionary:/);
  assert.match(state, /static func debugger_breakpoint_summary\(raw_breakpoint: String\) -> Dictionary:/);
  assert.match(state, /static func _debugger_breakpoints\(editor: EditorInterface\) -> Array:/);
  assert.match(state, /static func _debugger_monitors\(\) -> Dictionary:/);
  assert.match(state, /get_breakpoints/);
  assert.match(state, /Performance\.get_monitor/);
  assert.match(state, /monitorModificationTime/);

  assert.match(commands, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(commands, /preload\("niua_mcp_debugger_control_state\.gd"\)/);
  assert.match(commands, /preload\("niua_mcp_debugger_control_utils\.gd"\)/);
  assert.match(commands, /static func set_debugger_breakpoint\(debugger_probe, editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(commands, /static func toggle_debugger_profiler\(debugger_probe, editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(commands, /static func send_debugger_message\(debugger_probe, editor: EditorInterface, body: Dictionary\) -> Dictionary:/);
  assert.match(commands, /validate_script_path/);
  assert.match(commands, /set_breakpoint_for_sessions/);
  assert.match(commands, /toggle_profiler_for_sessions/);
  assert.match(commands, /send_message_for_sessions/);
  assert.match(commands, /NiuaMcpDebuggerControlState\.debugger_state/);
  assert.match(commands, /requestedBreakpoint/);
  assert.match(commands, /requestedProfiler/);
  assert.match(commands, /requestedMessage/);

  assert.match(sideEffects, /preload\("niua_mcp_debugger_control_commands\.gd"\)/);
  assert.match(sideEffects, /preload\("niua_mcp_debugger_control_utils\.gd"\)/);
  assert.match(sideEffects, /static func set_debugger_breakpoint_with_side_effects\(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /static func toggle_debugger_profiler_with_side_effects\(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /static func send_debugger_message_with_side_effects\(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(sideEffects, /Set debugger breakpoint %s:%d enabled=%s/);
  assert.match(sideEffects, /Toggled debugger profiler %s enabled=%s sessions=%d/);
  assert.match(sideEffects, /Sent debugger message %s sessions=%d/);

  assert.match(utils, /static func data_array\(raw_data\) -> Array:/);
  assert.match(utils, /static func remember\(remember: Callable, message: String\) -> void:/);
  assert.match(utils, /static func error\(message: String, code: String = "bad_request"\) -> Dictionary:/);
  assert.match(utils, /TYPE_ARRAY/);
  assert.match(utils, /errorCode/);
});

test("Godot debugger runtime bridge side effects live in debugger runtime operations", async () => {
  const bridge = await readBridgeWriteSurface();
  const operations = await readAddonFile("niua_mcp_debugger_runtime_operations.gd");

  assert.match(operations, /static func set_debugger_breakpoint_with_side_effects\(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func toggle_debugger_profiler_with_side_effects\(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func send_debugger_message_with_side_effects\(debugger_probe, editor: EditorInterface, body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(operations, /static func install_runtime_probe_with_side_effects\(body: Dictionary, remember: Callable\) -> Dictionary:/);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.set_debugger_breakpoint_with_side_effects/);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.toggle_debugger_profiler_with_side_effects/);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.send_debugger_message_with_side_effects/);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.install_runtime_probe_with_side_effects/);
  assert.doesNotMatch(bridge, /Set debugger breakpoint %s:%d enabled=%s/);
  assert.doesNotMatch(bridge, /Toggled debugger profiler %s enabled=%s sessions=%d/);
  assert.doesNotMatch(bridge, /Sent debugger message %s sessions=%d/);
  assert.doesNotMatch(bridge, /Installed runtime probe autoload %s/);
});

test("Godot bridge exposes Milestone 6A runtime probe installer", async () => {
  const bridge = await readBridgeWriteSurface();
  const probeInstaller = await readAddonFile("niua_mcp_runtime_probe_installer.gd");
  const probe = await readAddonFile("niua_mcp_runtime_probe.gd");
  const protocol = await readAddonFile("niua_mcp_runtime_probe_protocol.gd");

  await assertEndpointRoutes(["/runtime/probe/install"]);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.install_runtime_probe/);
  assert.match(probeInstaller, /autoload\/NiuaMcpRuntimeProbe/);
  assert.match(probeInstaller, /ProjectSettings\.set_setting/);
  assert.match(probeInstaller, /ProjectSettings\.save/);
  assert.match(probe, /EngineDebugger\.register_message_capture/);
  assert.match(probe, /EngineDebugger\.send_message/);
  assert.match(protocol, /niua_mcp:runtime_ready/);
  assert.match(protocol, /niua_mcp:runtime_state/);
});

test("Godot runtime probe delegates focused domain modules", async () => {
  const probe = await readAddonFile("niua_mcp_runtime_probe.gd");
  const protocol = await readAddonFile("niua_mcp_runtime_probe_protocol.gd");
  const codec = await readAddonFile("niua_mcp_runtime_probe_variant_codec.gd");
  const state = await readAddonFile("niua_mcp_runtime_probe_state.gd");
  const logging = await readAddonFile("niua_mcp_runtime_probe_logging.gd");
  const nodeProperties = await readAddonFile("niua_mcp_runtime_probe_node_properties.gd");
  const nodeLookup = await readAddonFile("niua_mcp_runtime_probe_node_lookup.gd");
  const nodePropertyReader = await readAddonFile("niua_mcp_runtime_probe_node_property_reader.gd");
  const nodePropertyWriter = await readAddonFile("niua_mcp_runtime_probe_node_property_writer.gd");
  const screenshot = await readAddonFile("niua_mcp_runtime_probe_screenshot.gd");

  assert.match(probe, /preload\("niua_mcp_runtime_probe_protocol\.gd"\)/);
  assert.match(probe, /preload\("niua_mcp_runtime_probe_variant_codec\.gd"\)/);
  assert.match(probe, /preload\("niua_mcp_runtime_probe_state\.gd"\)/);
  assert.match(probe, /preload\("niua_mcp_runtime_probe_logging\.gd"\)/);
  assert.match(probe, /preload\("niua_mcp_runtime_probe_node_properties\.gd"\)/);
  assert.match(probe, /preload\("niua_mcp_runtime_probe_screenshot\.gd"\)/);
  assert.match(probe, /func _ready\(\) -> void:/);
  assert.match(probe, /func _exit_tree\(\) -> void:/);
  assert.match(probe, /func log_event\(message: String, level: String = "info", data: Dictionary = {}\) -> void:/);
  assert.match(probe, /func log_debug\(message: String, data: Dictionary = {}\) -> void:/);
  assert.match(probe, /func log_info\(message: String, data: Dictionary = {}\) -> void:/);
  assert.match(probe, /func log_warning\(message: String, data: Dictionary = {}\) -> void:/);
  assert.match(probe, /func log_error\(message: String, data: Dictionary = {}\) -> void:/);
  assert.match(probe, /NiuaMcpRuntimeProbeState\.runtime_state/);
  assert.match(probe, /NiuaMcpRuntimeProbeLogging\.log_event/);
  assert.match(probe, /NiuaMcpRuntimeProbeNodeProperties\.node_properties/);
  assert.match(probe, /NiuaMcpRuntimeProbeNodeProperties\.set_node_property/);
  assert.match(probe, /NiuaMcpRuntimeProbeScreenshot\.runtime_screenshot/);
  assert.match(probe, /NiuaMcpRuntimeProbeProtocol\.request_payload/);
  assert.doesNotMatch(probe, /func _serialize_node/);
  assert.doesNotMatch(probe, /func _json_to_variant/);
  assert.doesNotMatch(probe, /func _variant_to_json/);
  assert.doesNotMatch(probe, /get_property_list/);
  assert.doesNotMatch(probe, /node\.set/);
  assert.doesNotMatch(probe, /save_png_to_buffer/);
  assert.doesNotMatch(probe, /Marshalls\.raw_to_base64/);

  assert.match(protocol, /CAPTURE_NAME := "niua_mcp"/);
  assert.match(protocol, /RUNTIME_LOG_MESSAGE := "niua_mcp:runtime_log"/);
  assert.match(protocol, /static func request_payload\(data: Array\) -> Dictionary:/);
  assert.match(codec, /static func json_to_variant\(value\)/);
  assert.match(codec, /static func variant_to_json\(value\)/);
  assert.match(codec, /MAX_SERIALIZED_COLLECTION_ITEMS/);
  assert.match(state, /static func runtime_state\(probe: Node, kind: String, max_depth: int = 0, path_filter: String = "", request_id: String = ""\) -> Dictionary:/);
  assert.match(state, /static func serialize_node\(node: Node, depth: int, max_depth: int = 0\) -> Dictionary:/);
  assert.match(state, /childrenTruncated/);
  assert.match(state, /node\.is_inside_tree\(\)/);
  assert.doesNotMatch(state, /"path": str\(node\.get_path\(\)\)/);
  assert.match(logging, /static func log_event\(probe: Node, send_debugger_message: Callable, message: String, level: String = "info", data: Dictionary = {}\) -> void:/);
  assert.match(logging, /MAX_LOG_MESSAGE_LENGTH/);
  assert.match(logging, /variant_to_json\(data\)/);
  assert.match(nodeProperties, /static func node_properties\(probe: Node, request: Dictionary\) -> Dictionary:/);
  assert.match(nodeProperties, /static func set_node_property\(probe: Node, request: Dictionary\) -> Dictionary:/);
  assert.match(nodeProperties, /static func has_property\(node: Node, property_name: String\) -> bool:/);
  assert.match(nodeProperties, /static func find_node\(probe: Node, node_path: String\) -> Node:/);
  assert.match(nodeProperties, /preload\("niua_mcp_runtime_probe_node_lookup\.gd"\)/);
  assert.match(nodeProperties, /preload\("niua_mcp_runtime_probe_node_property_reader\.gd"\)/);
  assert.match(nodeProperties, /preload\("niua_mcp_runtime_probe_node_property_writer\.gd"\)/);
  assert.match(nodeProperties, /NiuaMcpRuntimeProbeNodePropertyReader\.node_properties/);
  assert.match(nodeProperties, /NiuaMcpRuntimeProbeNodePropertyWriter\.set_node_property/);
  assert.match(nodeProperties, /NiuaMcpRuntimeProbeNodeLookup\.find_node/);
  assert.doesNotMatch(nodeProperties, /get_property_list/);
  assert.doesNotMatch(nodeProperties, /node\.set/);
  assert.doesNotMatch(nodeProperties, /get_node_or_null/);
  assert.match(nodeLookup, /static func find_node\(probe: Node, node_path: String\) -> Node:/);
  assert.match(nodeLookup, /get_node_or_null/);
  assert.match(nodePropertyReader, /static func node_properties\(probe: Node, request: Dictionary\) -> Dictionary:/);
  assert.match(nodePropertyReader, /NiuaMcpRuntimeProbeNodeLookup\.find_node/);
  assert.match(nodePropertyReader, /get_property_list/);
  assert.match(nodePropertyReader, /NiuaMcpRuntimeProbeVariantCodec\.variant_to_json/);
  assert.match(nodePropertyWriter, /static func set_node_property\(probe: Node, request: Dictionary\) -> Dictionary:/);
  assert.match(nodePropertyWriter, /static func has_property\(node: Node, property_name: String\) -> bool:/);
  assert.match(nodePropertyWriter, /NiuaMcpRuntimeProbeNodeLookup\.find_node/);
  assert.match(nodePropertyWriter, /node\.set/);
  assert.match(nodePropertyWriter, /NiuaMcpRuntimeProbeVariantCodec\.json_to_variant/);
  assert.match(screenshot, /static func runtime_screenshot\(probe: Node, request: Dictionary\) -> Dictionary:/);
  assert.match(screenshot, /save_png_to_buffer/);
  assert.match(screenshot, /Marshalls\.raw_to_base64/);
});

test("Godot bridge exposes Milestone 6B runtime state capture endpoint", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const runtimeState = await readAddonFile("niua_mcp_runtime_state_operations.gd");
  const debuggerProbe = await readAddonFile("niua_mcp_debugger_probe.gd");
  const debuggerProbeRuntimeRequests = await readAddonFile("niua_mcp_debugger_probe_runtime_requests.gd");
  const probe = await readAddonFile("niua_mcp_runtime_probe.gd");
  const probeState = await readAddonFile("niua_mcp_runtime_probe_state.gd");

  await assertEndpointRoutes(["/runtime/state"]);
  assert.match(debuggerProbe, /func _has_capture\(capture: String\) -> bool:/);
  assert.match(debuggerProbe, /func _capture\(message: String, data: Array, session_id: int\) -> bool:/);
  assert.match(readRoutes, /NiuaMcpDebuggerRuntimeOperations\.runtime_state/);
  assert.match(runtimeState, /send_runtime_snapshot_request/);
  assert.match(debuggerProbeRuntimeRequests, /niua_mcp:snapshot/);
  assert.match(runtimeState, /runtime_state\(\)/);
  assert.match(probe, /func _capture\(message: String, _data: Array\) -> bool:/);
  assert.match(probe, /NiuaMcpRuntimeProbeState\.runtime_state\(\s*self,\s*"snapshot",/);
  assert.match(probeState, /static func runtime_state\(probe: Node, kind: String, max_depth: int = 0, path_filter: String = "", request_id: String = ""\) -> Dictionary:/);
  assert.match(probeState, /static func serialize_node/);
});

test("Godot bridge exposes Milestone 9B runtime event stream endpoint", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const runtimeState = await readAddonFile("niua_mcp_runtime_state_operations.gd");

  await assertEndpointRoutes(["/runtime/events"]);
  assert.match(readRoutes, /func _runtime_events\(query: Dictionary\) -> Dictionary:/);
  assert.match(readRoutes, /NiuaMcpDebuggerRuntimeOperations\.runtime_events/);
  assert.match(runtimeState, /filtered_events/);
  assert.match(runtimeState, /totalMatched/);
  assert.match(runtimeState, /sinceMsec/);
});

test("Godot runtime probe emits structured runtime log events", async () => {
  const debuggerProbeCapture = await readAddonFile("niua_mcp_debugger_probe_capture.gd");
  const debuggerProbeStore = await readAddonFile("niua_mcp_debugger_probe_store.gd");
  const probe = await readAddonFile("niua_mcp_runtime_probe.gd");
  const logging = await readAddonFile("niua_mcp_runtime_probe_logging.gd");
  const protocol = await readAddonFile("niua_mcp_runtime_probe_protocol.gd");

  assert.match(debuggerProbeCapture, /runtime_log/);
  assert.match(debuggerProbeCapture, /store\.store_runtime_log/);
  assert.match(debuggerProbeStore, /store_runtime_log/);
  assert.match(protocol, /RUNTIME_LOG_MESSAGE := "niua_mcp:runtime_log"/);
  assert.match(logging, /MAX_LOG_MESSAGE_LENGTH/);
  assert.match(probe, /func log_event\(message: String, level: String = "info", data: Dictionary = {}\) -> void:/);
  assert.match(probe, /func log_warning\(message: String, data: Dictionary = {}\) -> void:/);
  assert.match(probe, /func log_error\(message: String, data: Dictionary = {}\) -> void:/);
  assert.match(probe, /NiuaMcpRuntimeProbeLogging\.log_event/);
  assert.match(logging, /truncated/);
});

test("Godot bridge exposes Milestone 6C runtime node property inspection", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const runtimeNode = await readAddonFile("niua_mcp_runtime_node_operations.gd");
  const debuggerProbeRuntimeRequests = await readAddonFile("niua_mcp_debugger_probe_runtime_requests.gd");
  const probe = await readAddonFile("niua_mcp_runtime_probe.gd");
  const nodeProperties = await readAddonFile("niua_mcp_runtime_probe_node_properties.gd");
  const nodeLookup = await readAddonFile("niua_mcp_runtime_probe_node_lookup.gd");
  const nodePropertyReader = await readAddonFile("niua_mcp_runtime_probe_node_property_reader.gd");

  await assertEndpointRoutes(["/runtime/node/properties"]);
  assert.match(debuggerProbeRuntimeRequests, /NODE_PROPERTIES_MESSAGE := "niua_mcp:node_properties"/);
  assert.match(readRoutes, /NiuaMcpDebuggerRuntimeOperations\.runtime_node_properties/);
  assert.match(runtimeNode, /send_runtime_node_properties_request/);
  assert.match(runtimeNode, /runtime_node_properties/);
  assert.match(probe, /"node_properties"/);
  assert.match(probe, /NiuaMcpRuntimeProbeNodeProperties\.node_properties/);
  assert.match(nodeProperties, /NiuaMcpRuntimeProbeNodePropertyReader\.node_properties/);
  assert.match(nodeLookup, /get_node_or_null/);
  assert.match(nodePropertyReader, /get_property_list/);
  assert.match(nodeProperties, /static func node_properties/);
});

test("Godot bridge exposes Milestone 6D runtime node property mutation", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const runtimeNode = await readAddonFile("niua_mcp_runtime_node_operations.gd");
  const debuggerProbeRuntimeRequests = await readAddonFile("niua_mcp_debugger_probe_runtime_requests.gd");
  const probe = await readAddonFile("niua_mcp_runtime_probe.gd");
  const variantCodec = await readAddonFile("niua_mcp_runtime_probe_variant_codec.gd");
  const nodeProperties = await readAddonFile("niua_mcp_runtime_probe_node_properties.gd");
  const nodePropertyWriter = await readAddonFile("niua_mcp_runtime_probe_node_property_writer.gd");

  await assertEndpointRoutes(["/runtime/node/property/set"]);
  await assertEndpointRoutes(["/runtime/node/property/set/result"]);
  assert.match(debuggerProbeRuntimeRequests, /SET_NODE_PROPERTY_MESSAGE := "niua_mcp:set_node_property"/);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.set_runtime_node_property/);
  assert.match(readRoutes, /NiuaMcpDebuggerRuntimeOperations\.runtime_node_property_set_result/);
  assert.match(runtimeNode, /send_runtime_node_property_set_request/);
  assert.match(runtimeNode, /runtime_node_property_set_result/);
  assert.match(probe, /"set_node_property"/);
  assert.match(probe, /NODE_PROPERTY_SET_MESSAGE/);
  assert.match(probe, /NiuaMcpRuntimeProbeNodeProperties\.set_node_property/);
  assert.match(nodeProperties, /NiuaMcpRuntimeProbeNodePropertyWriter\.set_node_property/);
  assert.match(nodePropertyWriter, /node\.set/);
  assert.match(nodePropertyWriter, /NiuaMcpRuntimeProbeVariantCodec\.json_to_variant/);
  assert.match(variantCodec, /static func json_to_variant/);
});

test("runtime probe codec coerces schema-untyped values like the editor codec (Slice 4)", async () => {
  const variantCodec = await readAddonFile("niua_mcp_runtime_probe_variant_codec.gd");
  const nodePropertyWriter = await readAddonFile("niua_mcp_runtime_probe_node_property_writer.gd");

  // JSON-string parse: a typed value arriving as '{"type":"Vector2",...}' or
  // "[x,y]" text is parsed back to structure before decoding.
  assert.match(variantCodec, /JSON\.parse_string\(trimmed\)/);
  assert.match(variantCodec, /trimmed\.begins_with\("\{"\) or trimmed\.begins_with\("\["\)/);

  // Declared-type coercion: scalar strings -> bool/int/float, plain
  // [x,y]/{x,y} arrays and dicts -> Vector2/Vector3/Color.
  assert.match(variantCodec, /static func coerce_to_declared_type\(value, declared_type: int\):/);
  assert.match(variantCodec, /TYPE_BOOL:/);
  assert.match(variantCodec, /TYPE_INT:/);
  assert.match(variantCodec, /TYPE_FLOAT:/);
  assert.match(variantCodec, /static func _as_vector2\(value\):/);
  assert.match(variantCodec, /static func _as_vector3\(value\):/);
  assert.match(variantCodec, /static func _as_color\(value\):/);

  // The runtime writer consults the live node's declared property type and
  // coerces the decoded value to it, mirroring the editor path
  // (niua_mcp_scene_property_operations.gd).
  assert.match(nodePropertyWriter, /static func property_type\(node: Node, property_name: String\) -> int:/);
  assert.match(nodePropertyWriter, /var declared_type := property_type\(node, property_name\)/);
  assert.match(nodePropertyWriter, /NiuaMcpRuntimeProbeVariantCodec\.coerce_to_declared_type\(decoded, declared_type\)/);
  // Genuine String/StringName properties keep the caller's text verbatim.
  assert.match(nodePropertyWriter, /declared_type == TYPE_STRING or declared_type == TYPE_STRING_NAME/);
  // Object/Resource guard: a non-null value that did not decode to an Object
  // produces an entry error instead of a silent null write.
  assert.match(nodePropertyWriter, /declared_type == TYPE_OBJECT and raw_value != null and not \(decoded is Object\)/);
  assert.match(nodePropertyWriter, /could not resolve a value for Object\/Resource property/);
  // Read-back truth: the reported value comes from the node AFTER the set.
  assert.match(nodePropertyWriter, /node\.set\(property_name, decoded\)\n\tvar after_value = node\.get\(property_name\)/);
  assert.match(nodePropertyWriter, /"value": NiuaMcpRuntimeProbeVariantCodec\.variant_to_json\(after_value\)/);
});

test("Godot bridge exposes Milestone 6E runtime screenshot capture", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const runtimeScreenshot = await readAddonFile("niua_mcp_runtime_screenshot_operations.gd");
  const debuggerProbeRuntimeRequests = await readAddonFile("niua_mcp_debugger_probe_runtime_requests.gd");
  const probe = await readAddonFile("niua_mcp_runtime_probe.gd");
  const probeScreenshot = await readAddonFile("niua_mcp_runtime_probe_screenshot.gd");

  await assertEndpointRoutes(["/runtime/screenshot"]);
  await assertEndpointRoutes(["/runtime/screenshot/result"]);
  assert.match(debuggerProbeRuntimeRequests, /RUNTIME_SCREENSHOT_MESSAGE := "niua_mcp:runtime_screenshot"/);
  assert.match(bridge, /NiuaMcpDebuggerRuntimeOperations\.capture_runtime_screenshot/);
  assert.match(readRoutes, /NiuaMcpDebuggerRuntimeOperations\.runtime_screenshot_result/);
  assert.match(runtimeScreenshot, /send_runtime_screenshot_request/);
  assert.match(runtimeScreenshot, /runtime_screenshot_result/);
  assert.match(probe, /"runtime_screenshot"/);
  assert.match(probe, /RUNTIME_SCREENSHOT_RESULT_MESSAGE/);
  assert.match(probe, /NiuaMcpRuntimeProbeScreenshot\.runtime_screenshot/);
  assert.match(probeScreenshot, /save_png_to_buffer/);
  assert.match(probeScreenshot, /Marshalls\.raw_to_base64/);
});

test("scene-graph errors name the recovery step in the message text", async () => {
  const property = await readAddonFile("niua_mcp_scene_property_operations.gd");
  const treeBasic = await readAddonFile("niua_mcp_scene_node_tree_basic_operations.gd");
  const treeHierarchy = await readAddonFile("niua_mcp_scene_node_tree_hierarchy_operations.gd");
  const instanceCreation = await readAddonFile("niua_mcp_scene_node_instance_creation.gd");
  const inspector = await readAddonFile("niua_mcp_scene_inspector_operations.gd");

  const treeHint = /call get_scene_tree to list valid node paths/;
  assert.match(property, treeHint);
  assert.match(property, /call get_inspector_properties on this node to list valid properties/);
  assert.match(property, /check the res:\/\/ path with list_filesystem or create it with create_resource first/);
  assert.match(instanceCreation, treeHint);
  assert.match(inspector, treeHint);

  // Every not_found error in the scene-node tree operation files carries the hint.
  for (const source of [treeBasic, treeHierarchy]) {
    const notFoundLines = source.split("\n").filter((line) => line.includes("\"not_found\""));
    assert.ok(notFoundLines.length > 0);
    for (const line of notFoundLines) {
      assert.match(line, treeHint);
    }
  }
});
