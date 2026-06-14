import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  createFakeGodotExecutable,
  createMcpProcess,
  getFreeHttpPort,
  repoRoot,
  withBridgeServer
} from "./helpers/server-harness.js";

function readServerSource(file) {
  return readFileSync(path.join(repoRoot, "src/godot-mcp", file), "utf8");
}

function readTestSource(file) {
  return readFileSync(path.join(repoRoot, "test/godot-mcp", file), "utf8");
}

test("server facade delegates catalog request and stdio transport domains", () => {
  const facade = readServerSource("server.js");
  const catalog = readServerSource("server/tool-catalog.js");
  const requestHandler = readServerSource("server/request-handler.js");
  const stdio = readServerSource("server/stdio.js");

  assert.match(facade, /from "\.\/server\/tool-catalog\.js"/);
  assert.match(facade, /from "\.\/server\/request-handler\.js"/);
  assert.match(facade, /from "\.\/server\/stdio\.js"/);
  assert.doesNotMatch(facade, /switch \(message\.method\)/);
  assert.doesNotMatch(facade, /Buffer\.alloc\(0\)/);
  assert.doesNotMatch(facade, /createToolRegistry/);

  assert.match(catalog, /createToolRegistry/);
  assert.match(catalog, /export const SERVER_INFO/);
  assert.match(catalog, /export const TOOL_DEFINITIONS/);
  assert.match(catalog, /export async function callTool/);
  assert.match(catalog, /Unknown Godot MCP tool/);

  assert.match(requestHandler, /export async function handleRequest/);
  assert.match(requestHandler, /case "resources\/read"/);
  assert.match(requestHandler, /readBridgeResource/);
  assert.match(requestHandler, /RESOURCE_DEFINITIONS/);
  assert.doesNotMatch(requestHandler, /Buffer\.alloc\(0\)/);

  assert.match(stdio, /export function startStdioServer/);
  assert.match(stdio, /encodeResponse/);
  assert.match(stdio, /toJsonRpcError/);
  // MCP stdio transport is newline-delimited JSON, not LSP Content-Length framing.
  assert.match(stdio, /indexOf\(0x0a\)/);
  assert.doesNotMatch(stdio, /content-length:/i);
});

test("server tests delegate reusable MCP harness helpers", () => {
  const serverTest = readTestSource("server.test.js");
  const harness = readTestSource("helpers/server-harness.js");

  assert.match(serverTest, /from "\.\/helpers\/server-harness\.js"/);
  assert.doesNotMatch(serverTest, /\nfunction createMcpProcess\(/);
  assert.doesNotMatch(serverTest, /\nfunction encodeMessage\(/);
  assert.doesNotMatch(serverTest, /\nasync function createFakeGodotExecutable\(/);
  assert.doesNotMatch(serverTest, /\nasync function waitForFileText\(/);

  assert.match(harness, /export function createMcpProcess/);
  assert.match(harness, /export async function withBridgeServer/);
  assert.match(harness, /export async function createFakeGodotExecutable/);
  assert.match(harness, /export async function createFakeGodotExporter/);
  assert.match(harness, /export async function waitForFileText/);
});

test("server core protocol tests live in focused server core test file", () => {
  const serverTest = readTestSource("server.test.js");
  const coreTest = readTestSource("server/core.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server handles initialize, listing, and version tool calls"/);
  assert.match(coreTest, /test\("Godot MCP server handles initialize, listing, and version tool calls"/);
  assert.match(coreTest, /createMcpProcess/);
  assert.match(coreTest, /tools\/list/);
  assert.match(coreTest, /resources\/list/);
});

test("server project setup tests live in focused server project setup test file", () => {
  const serverTest = readTestSource("server.test.js");
  const projectSetupTest = readTestSource("server/project-setup.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server creates projects under allowed roots and installs the addon"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server rejects project creation outside allowed roots"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server installs the NIUA addon for existing allowed projects"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server rejects addon installs outside allowed roots"/);
  assert.match(projectSetupTest, /test\("Godot MCP server creates projects under allowed roots and installs the addon"/);
  assert.match(projectSetupTest, /test\("Godot MCP server rejects project creation outside allowed roots"/);
  assert.match(projectSetupTest, /test\("Godot MCP server installs the NIUA addon for existing allowed projects"/);
  assert.match(projectSetupTest, /test\("Godot MCP server rejects addon installs outside allowed roots"/);
  assert.match(projectSetupTest, /createMcpProcess/);
  assert.match(projectSetupTest, /install_project_addon/);
});

test("server project editor lifecycle tests live in focused server project editor lifecycle test file", () => {
  const serverTest = readTestSource("server.test.js");
  const lifecycleTest = readTestSource("server/project-editor-lifecycle.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server opens, lists, and closes project editor processes"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server includes launched editor process output in get_output_logs"/);
  assert.match(lifecycleTest, /test\("Godot MCP server opens, lists, and closes project editor processes"/);
  assert.match(lifecycleTest, /test\("Godot MCP server includes launched editor process output in get_output_logs"/);
  assert.match(lifecycleTest, /createFakeGodotExecutable/);
  assert.match(lifecycleTest, /get_output_logs/);
  assert.match(lifecycleTest, /close_project/);
});

test("server project launch tests live in focused server project launch test file", () => {
  const serverTest = readTestSource("server.test.js");
  const launchTest = readTestSource("server/project-launch.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server rejects opening projects outside allowed roots"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server passes requested bridge ports to launched editors"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server negotiates a free bridge port when the preferred port is occupied"/);
  assert.match(launchTest, /test\("Godot MCP server rejects opening projects outside allowed roots"/);
  assert.match(launchTest, /test\("Godot MCP server passes requested bridge ports to launched editors"/);
  assert.match(launchTest, /test\("Godot MCP server negotiates a free bridge port when the preferred port is occupied"/);
  assert.match(launchTest, /createServer/);
  assert.match(launchTest, /getFreeHttpPort/);
  assert.match(launchTest, /NIUA_MCP_PORT/);
});

test("server project registry flow tests live in focused server project registry flow test file", () => {
  const serverTest = readTestSource("server.test.js");
  const registryFlowTest = readTestSource("server/project-registry-flow.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server imports, lists, persists, and forgets known projects"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server auto-records created and opened projects"/);
  assert.match(registryFlowTest, /test\("Godot MCP server imports, lists, persists, and forgets known projects"/);
  assert.match(registryFlowTest, /test\("Godot MCP server auto-records created and opened projects"/);
  assert.match(registryFlowTest, /import_project/);
  assert.match(registryFlowTest, /forget_project/);
  assert.match(registryFlowTest, /lastOpenedAt/);
});

test("server static project discovery tests live in focused server project discovery test file", () => {
  const serverTest = readTestSource("server.test.js");
  const discoveryTest = readTestSource("server/project-discovery.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server discovers projects under allowlisted roots and can remember them"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server rejects project discovery outside allowed roots"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server lists scene files under an allowlisted project"/);
  assert.match(discoveryTest, /test\("Godot MCP server discovers projects under allowlisted roots and can remember them"/);
  assert.match(discoveryTest, /test\("Godot MCP server rejects project discovery outside allowed roots"/);
  assert.match(discoveryTest, /test\("Godot MCP server lists scene files under an allowlisted project"/);
  assert.match(discoveryTest, /discover_projects/);
  assert.match(discoveryTest, /list_scenes/);
  assert.doesNotMatch(discoveryTest, /discover_editor_bridges/);
});

test("server project diagnostics tests live in focused server project diagnostics test file", () => {
  const serverTest = readTestSource("server.test.js");
  const diagnosticsTest = readTestSource("server/project-diagnostics.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server diagnoses projects missing the NIUA addon"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server diagnoses installed NIUA addon projects as ready"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server suggests bridge recovery actions when an installed project bridge is offline"/);
  assert.match(diagnosticsTest, /test\("Godot MCP server diagnoses projects missing the NIUA addon"/);
  assert.match(diagnosticsTest, /test\("Godot MCP server diagnoses installed NIUA addon projects as ready"/);
  assert.match(diagnosticsTest, /test\("Godot MCP server suggests bridge recovery actions when an installed project bridge is offline"/);
  assert.match(diagnosticsTest, /diagnose_project_setup/);
  assert.match(diagnosticsTest, /bridge_health/);
  assert.match(diagnosticsTest, /recoveryActions/);
});

test("server bridge discovery tests live in focused server bridge discovery test file", () => {
  const serverTest = readTestSource("server.test.js");
  const bridgeDiscoveryTest = readTestSource("server/bridge-discovery.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server discovers active editor bridges and matches known projects"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server reports unavailable bridge discovery probes when requested"/);
  assert.match(bridgeDiscoveryTest, /test\("Godot MCP server discovers active editor bridges and matches known projects"/);
  assert.match(bridgeDiscoveryTest, /test\("Godot MCP server reports unavailable bridge discovery probes when requested"/);
  assert.match(bridgeDiscoveryTest, /discover_editor_bridges/);
  assert.match(bridgeDiscoveryTest, /withBridgeServer/);
  assert.doesNotMatch(bridgeDiscoveryTest, /export_project/);
});

test("server project export tests live in focused server project export test file", () => {
  const serverTest = readTestSource("server.test.js");
  const exportTest = readTestSource("server/project-export.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server exports projects through the local Godot CLI"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server rejects project exports outside allowed roots"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server diagnoses installed export templates"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server reports missing export templates"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server validates a Linux export preset"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server reports platform-specific export preset errors"/);
  assert.match(exportTest, /test\("Godot MCP server exports projects through the local Godot CLI"/);
  assert.match(exportTest, /test\("Godot MCP server rejects project exports outside allowed roots"/);
  assert.match(exportTest, /test\("Godot MCP server diagnoses installed export templates"/);
  assert.match(exportTest, /test\("Godot MCP server reports missing export templates"/);
  assert.match(exportTest, /test\("Godot MCP server validates a Linux export preset"/);
  assert.match(exportTest, /test\("Godot MCP server reports platform-specific export preset errors"/);
  assert.match(exportTest, /export_project/);
  assert.match(exportTest, /diagnose_export_templates/);
  assert.match(exportTest, /validate_export_preset/);
  assert.match(exportTest, /createFakeGodotExporter/);
  assert.doesNotMatch(exportTest, /set_selection/);
});

test("server editor selection tests live in focused server editor selection test file", () => {
  const serverTest = readTestSource("server.test.js");
  const editorSelectionTest = readTestSource("server/editor-selection.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards editor selection and focus calls to the editor bridge"/);
  assert.match(editorSelectionTest, /test\("Godot MCP server forwards editor selection and focus calls to the editor bridge"/);
  assert.match(editorSelectionTest, /set_selection/);
  assert.match(editorSelectionTest, /focus_node/);
  assert.match(editorSelectionTest, /focus_resource/);
  assert.match(editorSelectionTest, /withBridgeServer/);
  assert.doesNotMatch(editorSelectionTest, /create_resource/);
});

test("server resource workflow tests live in focused server resource workflows test file", () => {
  const serverTest = readTestSource("server.test.js");
  const resourceWorkflowsTest = readTestSource("server/resource-workflows.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards resource create and save calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server creates curated StandardMaterial3D resources"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server creates curated ShaderMaterial resources"/);
  assert.match(resourceWorkflowsTest, /test\("Godot MCP server forwards resource create and save calls to the editor bridge"/);
  assert.match(resourceWorkflowsTest, /test\("Godot MCP server creates curated StandardMaterial3D resources"/);
  assert.match(resourceWorkflowsTest, /test\("Godot MCP server creates curated ShaderMaterial resources"/);
  assert.match(resourceWorkflowsTest, /create_resource/);
  assert.match(resourceWorkflowsTest, /save_resource/);
  assert.match(resourceWorkflowsTest, /create_material/);
  assert.match(resourceWorkflowsTest, /create_shader_material/);
  assert.match(resourceWorkflowsTest, /node\/material\/assign/);
  assert.doesNotMatch(resourceWorkflowsTest, /create_script/);
});

test("server script authoring tests live in focused server script authoring test file", () => {
  const serverTest = readTestSource("server.test.js");
  const scriptAuthoringTest = readTestSource("server/script-authoring.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards script creation and attachment calls to the editor bridge"/);
  assert.match(scriptAuthoringTest, /test\("Godot MCP server forwards script creation and attachment calls to the editor bridge"/);
  assert.match(scriptAuthoringTest, /create_script/);
  assert.match(scriptAuthoringTest, /attach_script/);
  assert.match(scriptAuthoringTest, /script\/create/);
  assert.match(scriptAuthoringTest, /script\/attach/);
  assert.match(scriptAuthoringTest, /withBridgeServer/);
  assert.doesNotMatch(scriptAuthoringTest, /validate_script/);
  assert.doesNotMatch(scriptAuthoringTest, /create_scene/);
});

test("server scene document tests live in focused server scene document test file", () => {
  const serverTest = readTestSource("server.test.js");
  const sceneDocumentTest = readTestSource("server/scene-document.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards scene creation and save-as calls to the editor bridge"/);
  assert.match(sceneDocumentTest, /test\("Godot MCP server forwards scene creation and save-as calls to the editor bridge"/);
  assert.match(sceneDocumentTest, /create_scene/);
  assert.match(sceneDocumentTest, /save_scene_as/);
  assert.match(sceneDocumentTest, /scene\/create/);
  assert.match(sceneDocumentTest, /scene\/save-as/);
  assert.match(sceneDocumentTest, /withBridgeServer/);
  assert.doesNotMatch(sceneDocumentTest, /switch_scene_tab/);
  assert.doesNotMatch(sceneDocumentTest, /get_open_scene_tabs/);
});

test("server scene tab tests live in focused server scene tabs test file", () => {
  const serverTest = readTestSource("server.test.js");
  const sceneTabsTest = readTestSource("server/scene-tabs.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards scene tab control calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards get_open_scene_tabs calls to the editor bridge"/);
  assert.match(sceneTabsTest, /test\("Godot MCP server forwards scene tab control calls to the editor bridge"/);
  assert.match(sceneTabsTest, /test\("Godot MCP server forwards get_open_scene_tabs calls to the editor bridge"/);
  assert.match(sceneTabsTest, /switch_scene_tab/);
  assert.match(sceneTabsTest, /close_scene/);
  assert.match(sceneTabsTest, /mark_scene_unsaved/);
  assert.match(sceneTabsTest, /undo_editor_action/);
  assert.match(sceneTabsTest, /redo_editor_action/);
  assert.match(sceneTabsTest, /get_open_scene_tabs/);
  assert.match(sceneTabsTest, /scene\/switch/);
  assert.match(sceneTabsTest, /scene\/close/);
  assert.match(sceneTabsTest, /scene\/mark-unsaved/);
  assert.match(sceneTabsTest, /editor\/undo/);
  assert.match(sceneTabsTest, /editor\/redo/);
  assert.match(sceneTabsTest, /scene\/tabs/);
  assert.match(sceneTabsTest, /withBridgeServer/);
  assert.doesNotMatch(sceneTabsTest, /validate_script/);
});

test("server script diagnostics tests live in focused server script diagnostics test file", () => {
  const serverTest = readTestSource("server.test.js");
  const scriptDiagnosticsTest = readTestSource("server/script-diagnostics.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards validate_script calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server diagnoses GDScript parser output"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server diagnoses project GDScript files"/);
  assert.match(scriptDiagnosticsTest, /test\("Godot MCP server forwards validate_script calls to the editor bridge"/);
  assert.match(scriptDiagnosticsTest, /test\("Godot MCP server diagnoses GDScript parser output"/);
  assert.match(scriptDiagnosticsTest, /test\("Godot MCP server diagnoses project GDScript files"/);
  assert.match(scriptDiagnosticsTest, /validate_script/);
  assert.match(scriptDiagnosticsTest, /diagnose_script/);
  assert.match(scriptDiagnosticsTest, /diagnose_project_scripts/);
  assert.match(scriptDiagnosticsTest, /script\/validate/);
  assert.match(scriptDiagnosticsTest, /createFakeGodotScriptChecker/);
  assert.match(scriptDiagnosticsTest, /createFakeGodotProjectScriptChecker/);
  assert.match(scriptDiagnosticsTest, /waitForFileText/);
  assert.match(scriptDiagnosticsTest, /withBridgeServer/);
  assert.match(scriptDiagnosticsTest, /GODOT_MCP_ALLOWED_PROJECT_ROOTS/);
  assert.doesNotMatch(scriptDiagnosticsTest, /get_script_editor_state/);
  assert.doesNotMatch(scriptDiagnosticsTest, /replace_in_scripts/);
});

test("server script editor tests live in focused server script editor test file", () => {
  const serverTest = readTestSource("server.test.js");
  const scriptEditorTest = readTestSource("server/script-editor.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards get_script_editor_state calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards get_script_symbols calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards get_script_cursor_state calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards goto_script_line calls to the editor bridge"/);
  assert.match(scriptEditorTest, /test\("Godot MCP server forwards get_script_editor_state calls to the editor bridge"/);
  assert.match(scriptEditorTest, /test\("Godot MCP server forwards get_script_symbols calls to the editor bridge"/);
  assert.match(scriptEditorTest, /test\("Godot MCP server forwards get_script_cursor_state calls to the editor bridge"/);
  assert.match(scriptEditorTest, /test\("Godot MCP server forwards goto_script_line calls to the editor bridge"/);
  assert.match(scriptEditorTest, /get_script_editor_state/);
  assert.match(scriptEditorTest, /get_script_symbols/);
  assert.match(scriptEditorTest, /get_script_cursor_state/);
  assert.match(scriptEditorTest, /goto_script_line/);
  assert.match(scriptEditorTest, /script\/editor\/state/);
  assert.match(scriptEditorTest, /script\/symbols/);
  assert.match(scriptEditorTest, /script\/cursor\/state/);
  assert.match(scriptEditorTest, /script\/goto-line/);
  assert.match(scriptEditorTest, /withBridgeServer/);
  assert.doesNotMatch(scriptEditorTest, /replace_in_scripts/);
  assert.doesNotMatch(scriptEditorTest, /set_import_options/);
});

test("server script refactor tests live in focused server script refactor test file", () => {
  const serverTest = readTestSource("server.test.js");
  const scriptRefactorTest = readTestSource("server/script-refactor.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards replace_in_scripts calls to the editor bridge"/);
  assert.match(scriptRefactorTest, /test\("Godot MCP server forwards replace_in_scripts calls to the editor bridge"/);
  assert.match(scriptRefactorTest, /replace_in_scripts/);
  assert.match(scriptRefactorTest, /script\/refactor\/replace/);
  assert.match(scriptRefactorTest, /totalReplacements/);
  assert.match(scriptRefactorTest, /old_name/);
  assert.match(scriptRefactorTest, /new_name/);
  assert.match(scriptRefactorTest, /dryRun/);
  assert.match(scriptRefactorTest, /withBridgeServer/);
  assert.doesNotMatch(scriptRefactorTest, /get_script_editor_state/);
  assert.doesNotMatch(scriptRefactorTest, /set_import_options/);
  assert.doesNotMatch(scriptRefactorTest, /get_import_diagnostics/);
});

test("server import workflow tests live in focused server import workflow test file", () => {
  const serverTest = readTestSource("server.test.js");
  const importWorkflowTest = readTestSource("server/import-workflow.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards set_import_options calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards get_import_diagnostics calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards reimport_assets calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards get_import_events calls to the editor bridge"/);
  assert.match(importWorkflowTest, /test\("Godot MCP server forwards set_import_options calls to the editor bridge"/);
  assert.match(importWorkflowTest, /test\("Godot MCP server forwards get_import_diagnostics calls to the editor bridge"/);
  assert.match(importWorkflowTest, /test\("Godot MCP server forwards reimport_assets calls to the editor bridge"/);
  assert.match(importWorkflowTest, /test\("Godot MCP server forwards get_import_events calls to the editor bridge"/);
  assert.match(importWorkflowTest, /set_import_options/);
  assert.match(importWorkflowTest, /get_import_diagnostics/);
  assert.match(importWorkflowTest, /reimport_assets/);
  assert.match(importWorkflowTest, /get_import_events/);
  assert.match(importWorkflowTest, /import\/options\/set/);
  assert.match(importWorkflowTest, /import\/diagnostics/);
  assert.match(importWorkflowTest, /import\/reimport/);
  assert.match(importWorkflowTest, /import\/events/);
  assert.match(importWorkflowTest, /withBridgeServer/);
  assert.doesNotMatch(importWorkflowTest, /get_run_settings/);
  assert.doesNotMatch(importWorkflowTest, /list_export_presets/);
});

test("server run control tests live in focused server run control test file", () => {
  const serverTest = readTestSource("server.test.js");
  const runControlTest = readTestSource("server/run-control.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards run settings and main scene calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server exposes run settings as a resource"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards run_custom_scene calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards reload_running_scene calls to the editor bridge"/);
  assert.match(runControlTest, /test\("Godot MCP server forwards run settings and main scene calls to the editor bridge"/);
  assert.match(runControlTest, /test\("Godot MCP server exposes run settings as a resource"/);
  assert.match(runControlTest, /test\("Godot MCP server forwards run_custom_scene calls to the editor bridge"/);
  assert.match(runControlTest, /test\("Godot MCP server forwards reload_running_scene calls to the editor bridge"/);
  assert.match(runControlTest, /get_run_settings/);
  assert.match(runControlTest, /set_main_scene/);
  assert.match(runControlTest, /run_custom_scene/);
  assert.match(runControlTest, /reload_running_scene/);
  assert.match(runControlTest, /resources\/read/);
  assert.match(runControlTest, /godot:\/\/run\/settings/);
  assert.match(runControlTest, /run\/settings/);
  assert.match(runControlTest, /run\/main-scene\/set/);
  assert.match(runControlTest, /run\/custom/);
  assert.match(runControlTest, /run\/reload/);
  assert.match(runControlTest, /withBridgeServer/);
  assert.doesNotMatch(runControlTest, /list_export_presets/);
  assert.doesNotMatch(runControlTest, /capture_viewport_screenshot/);
});

test("server export preset bridge tests live in focused server export preset bridge test file", () => {
  const serverTest = readTestSource("server.test.js");
  const exportPresetBridgeTest = readTestSource("server/export-preset-bridge.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards list_export_presets calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards upsert_export_preset calls to the editor bridge"/);
  assert.match(exportPresetBridgeTest, /test\("Godot MCP server forwards list_export_presets calls to the editor bridge"/);
  assert.match(exportPresetBridgeTest, /test\("Godot MCP server forwards upsert_export_preset calls to the editor bridge"/);
  assert.match(exportPresetBridgeTest, /list_export_presets/);
  assert.match(exportPresetBridgeTest, /upsert_export_preset/);
  assert.match(exportPresetBridgeTest, /export\/presets/);
  assert.match(exportPresetBridgeTest, /export\/preset\/upsert/);
  assert.match(exportPresetBridgeTest, /export_presets\.cfg/);
  assert.match(exportPresetBridgeTest, /binary_format\/embed_pck/);
  assert.match(exportPresetBridgeTest, /withBridgeServer/);
  assert.doesNotMatch(exportPresetBridgeTest, /export_project/);
  assert.doesNotMatch(exportPresetBridgeTest, /capture_viewport_screenshot/);
});

test("server viewport bridge tests live in focused server viewport bridge test file", () => {
  const serverTest = readTestSource("server.test.js");
  const viewportBridgeTest = readTestSource("server/viewport-bridge.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards capture_viewport_screenshot calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards get_viewport_state calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards set_viewport_camera calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards send_viewport_input calls to the editor bridge"/);
  assert.match(viewportBridgeTest, /test\("Godot MCP server forwards capture_viewport_screenshot calls to the editor bridge"/);
  assert.match(viewportBridgeTest, /test\("Godot MCP server forwards get_viewport_state calls to the editor bridge"/);
  assert.match(viewportBridgeTest, /test\("Godot MCP server forwards set_viewport_camera calls to the editor bridge"/);
  assert.match(viewportBridgeTest, /test\("Godot MCP server forwards send_viewport_input calls to the editor bridge"/);
  assert.match(viewportBridgeTest, /capture_viewport_screenshot/);
  assert.match(viewportBridgeTest, /get_viewport_state/);
  assert.match(viewportBridgeTest, /set_viewport_camera/);
  assert.match(viewportBridgeTest, /send_viewport_input/);
  assert.match(viewportBridgeTest, /viewport\/screenshot/);
  assert.match(viewportBridgeTest, /viewport\/state/);
  assert.match(viewportBridgeTest, /viewport\/camera\/set/);
  assert.match(viewportBridgeTest, /viewport\/input\/send/);
  assert.match(viewportBridgeTest, /mouse_click/);
  assert.match(viewportBridgeTest, /withBridgeServer/);
  assert.doesNotMatch(viewportBridgeTest, /set_editor_main_screen/);
  assert.doesNotMatch(viewportBridgeTest, /capture_editor_screenshot/);
});

test("server editor surface tests live in focused server editor surface test file", () => {
  const serverTest = readTestSource("server.test.js");
  const editorSurfaceTest = readTestSource("server/editor-surface.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards set_editor_main_screen calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards invoke_editor_action calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards capture_editor_screenshot calls to the editor bridge"/);
  assert.match(editorSurfaceTest, /test\("Godot MCP server forwards set_editor_main_screen calls to the editor bridge"/);
  assert.match(editorSurfaceTest, /test\("Godot MCP server forwards invoke_editor_action calls to the editor bridge"/);
  assert.match(editorSurfaceTest, /test\("Godot MCP server forwards capture_editor_screenshot calls to the editor bridge"/);
  assert.match(editorSurfaceTest, /set_editor_main_screen/);
  assert.match(editorSurfaceTest, /invoke_editor_action/);
  assert.match(editorSurfaceTest, /capture_editor_screenshot/);
  assert.match(editorSurfaceTest, /editor\/main-screen\/set/);
  assert.match(editorSurfaceTest, /editor\/action\/invoke/);
  assert.match(editorSurfaceTest, /editor\/screenshot/);
  assert.match(editorSurfaceTest, /withBridgeServer/);
  assert.doesNotMatch(editorSurfaceTest, /capture_viewport_screenshot/);
  assert.doesNotMatch(editorSurfaceTest, /get_debugger_state/);
});

test("server debugger bridge tests live in focused server debugger bridge test file", () => {
  const serverTest = readTestSource("server.test.js");
  const debuggerBridgeTest = readTestSource("server/debugger-bridge.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards get_debugger_state calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards set_debugger_breakpoint calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards toggle_debugger_profiler calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards send_debugger_message calls to the editor bridge"/);
  assert.match(debuggerBridgeTest, /test\("Godot MCP server forwards get_debugger_state calls to the editor bridge"/);
  assert.match(debuggerBridgeTest, /test\("Godot MCP server forwards set_debugger_breakpoint calls to the editor bridge"/);
  assert.match(debuggerBridgeTest, /test\("Godot MCP server forwards toggle_debugger_profiler calls to the editor bridge"/);
  assert.match(debuggerBridgeTest, /test\("Godot MCP server forwards send_debugger_message calls to the editor bridge"/);
  assert.match(debuggerBridgeTest, /get_debugger_state/);
  assert.match(debuggerBridgeTest, /set_debugger_breakpoint/);
  assert.match(debuggerBridgeTest, /toggle_debugger_profiler/);
  assert.match(debuggerBridgeTest, /send_debugger_message/);
  assert.match(debuggerBridgeTest, /debugger\/state/);
  assert.match(debuggerBridgeTest, /debugger\/breakpoint\/set/);
  assert.match(debuggerBridgeTest, /debugger\/profiler\/toggle/);
  assert.match(debuggerBridgeTest, /debugger\/message\/send/);
  assert.match(debuggerBridgeTest, /niua_mcp:snapshot/);
  assert.match(debuggerBridgeTest, /withBridgeServer/);
  assert.doesNotMatch(debuggerBridgeTest, /install_runtime_probe/);
  assert.doesNotMatch(debuggerBridgeTest, /get_runtime_state/);
});

test("server runtime state tests live in focused server runtime state test file", () => {
  const serverTest = readTestSource("server.test.js");
  const runtimeStateTest = readTestSource("server/runtime-state.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards install_runtime_probe calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards get_runtime_state calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards get_runtime_events calls to the editor bridge"/);
  assert.match(runtimeStateTest, /test\("Godot MCP server forwards install_runtime_probe calls to the editor bridge"/);
  assert.match(runtimeStateTest, /test\("Godot MCP server forwards get_runtime_state calls to the editor bridge"/);
  assert.match(runtimeStateTest, /test\("Godot MCP server forwards get_runtime_events calls to the editor bridge"/);
  assert.match(runtimeStateTest, /install_runtime_probe/);
  assert.match(runtimeStateTest, /get_runtime_state/);
  assert.match(runtimeStateTest, /get_runtime_events/);
  assert.match(runtimeStateTest, /runtime\/probe\/install/);
  assert.match(runtimeStateTest, /runtime\/state/);
  assert.match(runtimeStateTest, /runtime\/events/);
  assert.match(runtimeStateTest, /resources\/read/);
  assert.match(runtimeStateTest, /godot:\/\/runtime\/state/);
  assert.match(runtimeStateTest, /godot:\/\/runtime\/events/);
  assert.match(runtimeStateTest, /withBridgeServer/);
  assert.doesNotMatch(runtimeStateTest, /get_runtime_node_properties/);
  assert.doesNotMatch(runtimeStateTest, /capture_runtime_screenshot/);
});

test("server runtime node tests live in focused server runtime node test file", () => {
  const serverTest = readTestSource("server.test.js");
  const runtimeNodeTest = readTestSource("server/runtime-node.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards get_runtime_node_properties calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards set_runtime_node_property calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards capture_runtime_screenshot calls to the editor bridge"/);
  assert.match(runtimeNodeTest, /test\("Godot MCP server forwards get_runtime_node_properties calls to the editor bridge"/);
  assert.match(runtimeNodeTest, /test\("Godot MCP server forwards set_runtime_node_property calls to the editor bridge"/);
  assert.match(runtimeNodeTest, /test\("Godot MCP server forwards capture_runtime_screenshot calls to the editor bridge"/);
  assert.match(runtimeNodeTest, /get_runtime_node_properties/);
  assert.match(runtimeNodeTest, /set_runtime_node_property/);
  assert.match(runtimeNodeTest, /capture_runtime_screenshot/);
  assert.match(runtimeNodeTest, /runtime\/node\/properties/);
  assert.match(runtimeNodeTest, /runtime\/node\/property\/set/);
  assert.match(runtimeNodeTest, /runtime\/screenshot/);
  assert.match(runtimeNodeTest, /set_node_property/);
  assert.match(runtimeNodeTest, /runtime_screenshot/);
  assert.match(runtimeNodeTest, /withBridgeServer/);
  assert.doesNotMatch(runtimeNodeTest, /get_project_settings/);
  assert.doesNotMatch(runtimeNodeTest, /install_runtime_probe/);
});

test("server project settings tests live in focused server project settings test file", () => {
  const serverTest = readTestSource("server.test.js");
  const projectSettingsTest = readTestSource("server/project-settings.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards get_project_settings calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards set_project_setting calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards set_project_setting_metadata calls to the editor bridge"/);
  assert.match(projectSettingsTest, /test\("Godot MCP server forwards get_project_settings calls to the editor bridge"/);
  assert.match(projectSettingsTest, /test\("Godot MCP server forwards set_project_setting calls to the editor bridge"/);
  assert.match(projectSettingsTest, /test\("Godot MCP server forwards set_project_setting_metadata calls to the editor bridge"/);
  assert.match(projectSettingsTest, /get_project_settings/);
  assert.match(projectSettingsTest, /set_project_setting/);
  assert.match(projectSettingsTest, /set_project_setting_metadata/);
  assert.match(projectSettingsTest, /project\/settings/);
  assert.match(projectSettingsTest, /project\/setting\/set/);
  assert.match(projectSettingsTest, /project\/setting\/metadata\/set/);
  assert.match(projectSettingsTest, /application\/config\/name/);
  assert.match(projectSettingsTest, /restartIfChanged/);
  assert.match(projectSettingsTest, /withBridgeServer/);
  assert.doesNotMatch(projectSettingsTest, /get_filesystem_dock_state/);
  assert.doesNotMatch(projectSettingsTest, /get_runtime_node_properties/);
});

test("server filesystem bridge tests live in focused server filesystem bridge test file", () => {
  const serverTest = readTestSource("server.test.js");
  const filesystemBridgeTest = readTestSource("server/filesystem-bridge.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards get_filesystem_dock_state calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards write_text_file calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards copy_filesystem_entry calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards batch_filesystem_operations calls to the editor bridge"/);
  assert.match(filesystemBridgeTest, /test\("Godot MCP server forwards get_filesystem_dock_state calls to the editor bridge"/);
  assert.match(filesystemBridgeTest, /test\("Godot MCP server forwards write_text_file calls to the editor bridge"/);
  assert.match(filesystemBridgeTest, /test\("Godot MCP server forwards copy_filesystem_entry calls to the editor bridge"/);
  assert.match(filesystemBridgeTest, /test\("Godot MCP server forwards batch_filesystem_operations calls to the editor bridge"/);
  assert.match(filesystemBridgeTest, /get_filesystem_dock_state/);
  assert.match(filesystemBridgeTest, /write_text_file/);
  assert.match(filesystemBridgeTest, /copy_filesystem_entry/);
  assert.match(filesystemBridgeTest, /batch_filesystem_operations/);
  assert.match(filesystemBridgeTest, /filesystem\/state/);
  assert.match(filesystemBridgeTest, /filesystem\/file\/write/);
  assert.match(filesystemBridgeTest, /filesystem\/copy/);
  assert.match(filesystemBridgeTest, /filesystem\/batch/);
  assert.match(filesystemBridgeTest, /withBridgeServer/);
  assert.doesNotMatch(filesystemBridgeTest, /rename_node/);
  assert.doesNotMatch(filesystemBridgeTest, /create_node/);
});

test("server scene node bridge tests live in focused server scene node bridge test file", () => {
  const serverTest = readTestSource("server.test.js");
  const sceneNodeBridgeTest = readTestSource("server/scene-node-bridge.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards rename_node calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards create_node calls to the editor bridge"/);
  assert.match(sceneNodeBridgeTest, /test\("Godot MCP server forwards rename_node calls to the editor bridge"/);
  assert.match(sceneNodeBridgeTest, /test\("Godot MCP server forwards create_node calls to the editor bridge"/);
  assert.match(sceneNodeBridgeTest, /rename_node/);
  assert.match(sceneNodeBridgeTest, /create_node/);
  assert.match(sceneNodeBridgeTest, /scene\/node\/rename/);
  assert.match(sceneNodeBridgeTest, /scene\/node\/create/);
  assert.match(sceneNodeBridgeTest, /Node3D/);
  assert.match(sceneNodeBridgeTest, /withBridgeServer/);
  assert.doesNotMatch(sceneNodeBridgeTest, /paint_tile_map_layer_terrain/);
  assert.doesNotMatch(sceneNodeBridgeTest, /create_light_3d/);
});

test("server tile map bridge tests live in focused server tile map bridge test file", () => {
  const serverTest = readTestSource("server.test.js");
  const tileMapBridgeTest = readTestSource("server/tile-map-bridge.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards paint_tile_map_layer_terrain calls to the editor bridge"/);
  assert.match(tileMapBridgeTest, /test\("Godot MCP server forwards paint_tile_map_layer_terrain calls to the editor bridge"/);
  assert.match(tileMapBridgeTest, /paint_tile_map_layer_terrain/);
  assert.match(tileMapBridgeTest, /scene\/tile-map-layer\/terrain\/paint/);
  assert.match(tileMapBridgeTest, /terrainSet: 0/);
  assert.match(tileMapBridgeTest, /coords: \[\{ x: 0, y: 0 \}, \{ x: 1, y: 0 \}\]/);
  assert.match(tileMapBridgeTest, /ignoreEmptyTerrains: true/);
  assert.match(tileMapBridgeTest, /withBridgeServer/);
  assert.doesNotMatch(tileMapBridgeTest, /rename_node/);
  assert.doesNotMatch(tileMapBridgeTest, /create_light_3d/);
});

test("server Node3D visual bridge tests live in focused server Node3D visual bridge test file", () => {
  const serverTest = readTestSource("server.test.js");
  const node3dVisualBridgeTest = readTestSource("server/node3d-visual-bridge.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server creates curated 3D lights"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server creates curated 3D cameras"/);
  assert.match(node3dVisualBridgeTest, /test\("Godot MCP server creates curated 3D lights"/);
  assert.match(node3dVisualBridgeTest, /test\("Godot MCP server creates curated 3D cameras"/);
  assert.match(node3dVisualBridgeTest, /create_light_3d/);
  assert.match(node3dVisualBridgeTest, /create_camera_3d/);
  assert.match(node3dVisualBridgeTest, /SpotLight3D/);
  assert.match(node3dVisualBridgeTest, /Camera3D/);
  assert.match(node3dVisualBridgeTest, /light_color/);
  assert.match(node3dVisualBridgeTest, /projection: 0/);
  assert.match(node3dVisualBridgeTest, /scene\/node\/create/);
  assert.match(node3dVisualBridgeTest, /withBridgeServer/);
  assert.doesNotMatch(node3dVisualBridgeTest, /paint_tile_map_layer_terrain/);
  assert.doesNotMatch(node3dVisualBridgeTest, /create_collision_shape_3d/);
});

test("server Node3D collision bridge tests live in focused server Node3D collision bridge test file", () => {
  const serverTest = readTestSource("server.test.js");
  const node3dCollisionBridgeTest = readTestSource("server/node3d-collision-bridge.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server creates curated 3D collision shapes"/);
  assert.match(node3dCollisionBridgeTest, /test\("Godot MCP server creates curated 3D collision shapes"/);
  assert.match(node3dCollisionBridgeTest, /create_collision_shape_3d/);
  assert.match(node3dCollisionBridgeTest, /CollisionShape3D/);
  assert.match(node3dCollisionBridgeTest, /CapsuleShape3D/);
  assert.match(node3dCollisionBridgeTest, /resource\/create/);
  assert.match(node3dCollisionBridgeTest, /scene\/node\/create/);
  assert.match(node3dCollisionBridgeTest, /res:\/\/physics\/player_capsule\.tres/);
  assert.match(node3dCollisionBridgeTest, /shape: \{/);
  assert.match(node3dCollisionBridgeTest, /withBridgeServer/);
  assert.doesNotMatch(node3dCollisionBridgeTest, /create_light_3d/);
  assert.doesNotMatch(node3dCollisionBridgeTest, /create_mesh_instance_3d/);
  assert.doesNotMatch(node3dCollisionBridgeTest, /create_rigid_body_3d/);
});

test("server Node3D mesh bridge tests live in focused server Node3D mesh bridge test file", () => {
  const serverTest = readTestSource("server.test.js");
  const node3dMeshBridgeTest = readTestSource("server/node3d-mesh-bridge.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server creates curated primitive MeshInstance3D nodes"/);
  assert.match(node3dMeshBridgeTest, /test\("Godot MCP server creates curated primitive MeshInstance3D nodes"/);
  assert.match(node3dMeshBridgeTest, /create_mesh_instance_3d/);
  assert.match(node3dMeshBridgeTest, /MeshInstance3D/);
  assert.match(node3dMeshBridgeTest, /BoxMesh/);
  assert.match(node3dMeshBridgeTest, /resource\/create/);
  assert.match(node3dMeshBridgeTest, /scene\/node\/create/);
  assert.match(node3dMeshBridgeTest, /res:\/\/meshes\/crate_box\.tres/);
  assert.match(node3dMeshBridgeTest, /material_override/);
  assert.match(node3dMeshBridgeTest, /withBridgeServer/);
  assert.doesNotMatch(node3dMeshBridgeTest, /create_collision_shape_3d/);
  assert.doesNotMatch(node3dMeshBridgeTest, /create_rigid_body_3d/);
});

test("server Node3D physics body bridge tests live in focused server Node3D physics body bridge test file", () => {
  const serverTest = readTestSource("server.test.js");
  const node3dPhysicsBodyBridgeTest = readTestSource("server/node3d-physics-body-bridge.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server creates curated RigidBody3D nodes with collision children"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server creates curated Area3D trigger volumes with collision children"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server creates curated CharacterBody3D nodes with collision children"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server creates curated StaticBody3D nodes with collision children"/);
  assert.match(node3dPhysicsBodyBridgeTest, /test\("Godot MCP server creates curated RigidBody3D nodes with collision children"/);
  assert.match(node3dPhysicsBodyBridgeTest, /test\("Godot MCP server creates curated Area3D trigger volumes with collision children"/);
  assert.match(node3dPhysicsBodyBridgeTest, /test\("Godot MCP server creates curated CharacterBody3D nodes with collision children"/);
  assert.match(node3dPhysicsBodyBridgeTest, /test\("Godot MCP server creates curated StaticBody3D nodes with collision children"/);
  assert.match(node3dPhysicsBodyBridgeTest, /create_rigid_body_3d/);
  assert.match(node3dPhysicsBodyBridgeTest, /create_area_3d/);
  assert.match(node3dPhysicsBodyBridgeTest, /create_character_body_3d/);
  assert.match(node3dPhysicsBodyBridgeTest, /create_static_body_3d/);
  assert.match(node3dPhysicsBodyBridgeTest, /RigidBody3D/);
  assert.match(node3dPhysicsBodyBridgeTest, /Area3D/);
  assert.match(node3dPhysicsBodyBridgeTest, /CharacterBody3D/);
  assert.match(node3dPhysicsBodyBridgeTest, /StaticBody3D/);
  assert.match(node3dPhysicsBodyBridgeTest, /resource\/create/);
  assert.match(node3dPhysicsBodyBridgeTest, /scene\/node\/create/);
  assert.match(node3dPhysicsBodyBridgeTest, /withBridgeServer/);
  assert.doesNotMatch(node3dPhysicsBodyBridgeTest, /create_mesh_instance_3d/);
  assert.doesNotMatch(node3dPhysicsBodyBridgeTest, /create_3d_playable_blockout/);
});

test("server Node3D playable workflow bridge tests live in focused server Node3D playable workflow bridge test file", () => {
  const serverTest = readTestSource("server.test.js");
  const node3dPlayableWorkflowBridgeTest = readTestSource("server/node3d-playable-workflow-bridge.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server creates composed 3D playable blockouts"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server creates and attaches curated 3D character controllers"/);
  assert.match(node3dPlayableWorkflowBridgeTest, /test\("Godot MCP server creates composed 3D playable blockouts"/);
  assert.match(node3dPlayableWorkflowBridgeTest, /test\("Godot MCP server creates and attaches curated 3D character controllers"/);
  assert.match(node3dPlayableWorkflowBridgeTest, /create_3d_playable_blockout/);
  assert.match(node3dPlayableWorkflowBridgeTest, /create_3d_character_controller/);
  assert.match(node3dPlayableWorkflowBridgeTest, /input\/action\/set/);
  assert.match(node3dPlayableWorkflowBridgeTest, /script\/create/);
  assert.match(node3dPlayableWorkflowBridgeTest, /script\/validate/);
  assert.match(node3dPlayableWorkflowBridgeTest, /script\/attach/);
  assert.match(node3dPlayableWorkflowBridgeTest, /ArenaPrototype/);
  assert.match(node3dPlayableWorkflowBridgeTest, /withBridgeServer/);
  assert.doesNotMatch(node3dPlayableWorkflowBridgeTest, /create_rigid_body_3d/);
  assert.doesNotMatch(node3dPlayableWorkflowBridgeTest, /search_node_types/);
});

test("server scene node tooling bridge tests live in focused server scene node tooling bridge test file", () => {
  const serverTest = readTestSource("server.test.js");
  const sceneNodeToolingBridgeTest = readTestSource("server/scene-node-tooling-bridge.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards search_node_types calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards create_node_with_script calls to the editor bridge"/);
  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards reorder_node calls to the editor bridge"/);
  assert.match(sceneNodeToolingBridgeTest, /test\("Godot MCP server forwards search_node_types calls to the editor bridge"/);
  assert.match(sceneNodeToolingBridgeTest, /test\("Godot MCP server forwards create_node_with_script calls to the editor bridge"/);
  assert.match(sceneNodeToolingBridgeTest, /test\("Godot MCP server forwards reorder_node calls to the editor bridge"/);
  assert.match(sceneNodeToolingBridgeTest, /search_node_types/);
  assert.match(sceneNodeToolingBridgeTest, /create_node_with_script/);
  assert.match(sceneNodeToolingBridgeTest, /reorder_node/);
  assert.match(sceneNodeToolingBridgeTest, /node-types\/search/);
  assert.match(sceneNodeToolingBridgeTest, /scene\/node\/create-with-script/);
  assert.match(sceneNodeToolingBridgeTest, /scene\/node\/reorder/);
  assert.match(sceneNodeToolingBridgeTest, /withBridgeServer/);
  assert.doesNotMatch(sceneNodeToolingBridgeTest, /create_3d_playable_blockout/);
  assert.doesNotMatch(sceneNodeToolingBridgeTest, /assign_material/);
});

test("server node material bridge tests live in focused server node material bridge test file", () => {
  const serverTest = readTestSource("server.test.js");
  const nodeMaterialBridgeTest = readTestSource("server/node-material-bridge.test.js");

  assert.doesNotMatch(serverTest, /test\("Godot MCP server forwards assign_material calls to the editor bridge"/);
  assert.match(nodeMaterialBridgeTest, /test\("Godot MCP server forwards assign_material calls to the editor bridge"/);
  assert.match(nodeMaterialBridgeTest, /assign_material/);
  assert.match(nodeMaterialBridgeTest, /node\/material\/assign/);
  assert.match(nodeMaterialBridgeTest, /res:\/\/materials\/neon\.tres/);
  assert.match(nodeMaterialBridgeTest, /surfaceIndex: 0/);
  assert.match(nodeMaterialBridgeTest, /withBridgeServer/);
  assert.doesNotMatch(nodeMaterialBridgeTest, /search_node_types/);
});
