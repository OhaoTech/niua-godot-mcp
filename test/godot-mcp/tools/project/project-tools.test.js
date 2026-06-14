import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

import { PROJECT_MANAGEMENT_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/project/index.js";
import {
  PROJECT_DISCOVERY_TOOL_MANIFEST,
  PROJECT_LIFECYCLE_TOOL_MANIFEST,
  PROJECT_LOG_TOOL_MANIFEST,
  PROJECT_MANAGEMENT_TOOL_MANIFEST
} from "../../../../src/godot-mcp/tools/project/manifest.js";

const projectToolsRoot = path.resolve(import.meta.dirname, "../../../../src/godot-mcp/tools/project");

function toolByName(name) {
  return PROJECT_MANAGEMENT_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

async function readProjectSource(file) {
  return readFile(path.join(projectToolsRoot, file), "utf8");
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

async function withAllowedWorkspace(run) {
  const workspace = await mkdtemp(path.join(tmpdir(), "niua-godot-project-tools-"));
  const previousAllowedRoots = process.env.GODOT_MCP_ALLOWED_PROJECT_ROOTS;
  const previousRegistry = process.env.GODOT_MCP_PROJECT_REGISTRY;
  process.env.GODOT_MCP_ALLOWED_PROJECT_ROOTS = workspace;
  process.env.GODOT_MCP_PROJECT_REGISTRY = path.join(workspace, "registry.json");

  try {
    return await run(workspace);
  } finally {
    if (previousAllowedRoots === undefined) {
      delete process.env.GODOT_MCP_ALLOWED_PROJECT_ROOTS;
    } else {
      process.env.GODOT_MCP_ALLOWED_PROJECT_ROOTS = previousAllowedRoots;
    }
    if (previousRegistry === undefined) {
      delete process.env.GODOT_MCP_PROJECT_REGISTRY;
    } else {
      process.env.GODOT_MCP_PROJECT_REGISTRY = previousRegistry;
    }
    await rm(workspace, { recursive: true, force: true });
  }
}

test("PROJECT_MANAGEMENT_TOOL_DEFINITIONS exposes project management descriptors", () => {
  assert.deepEqual(
    PROJECT_MANAGEMENT_TOOL_DEFINITIONS.map(({ name }) => name),
    PROJECT_MANAGEMENT_TOOL_MANIFEST.map(({ name }) => name)
  );
  assert.deepEqual(
    PROJECT_MANAGEMENT_TOOL_MANIFEST.map(({ name }) => name),
    [
      ...PROJECT_LIFECYCLE_TOOL_MANIFEST.map(({ name }) => name),
      ...PROJECT_DISCOVERY_TOOL_MANIFEST.map(({ name }) => name),
      ...PROJECT_LOG_TOOL_MANIFEST.map(({ name }) => name)
    ]
  );

  for (const tool of PROJECT_MANAGEMENT_TOOL_DEFINITIONS) {
    assert.equal(typeof tool.description, "string");
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(typeof tool.handler, "function");
  }
});

test("project lifecycle delegates focused domain modules", async () => {
  const lifecycle = await readProjectSource("lifecycle.js");
  const create = await readProjectSource("lifecycle/create.js");
  const launch = await readProjectSource("lifecycle/launch.js");
  const processes = await readProjectSource("lifecycle/processes.js");
  const registry = await readProjectSource("lifecycle/registry.js");

  assert.match(lifecycle, /from "\.\/lifecycle\/create\.js"/);
  assert.match(lifecycle, /from "\.\/lifecycle\/launch\.js"/);
  assert.match(lifecycle, /from "\.\/lifecycle\/processes\.js"/);
  assert.match(lifecycle, /from "\.\/lifecycle\/registry\.js"/);
  assert.doesNotMatch(lifecycle, /spawn\(/);
  assert.doesNotMatch(lifecycle, /renderProjectGodot/);

  assert.match(create, /export async function createGodotProject/);
  assert.match(create, /function renderProjectGodot/);
  assert.match(launch, /export async function openGodotProject/);
  assert.match(launch, /from "\.\/launch\/process-entry\.js"/);
  assert.match(processes, /export async function listOpenGodotProjects/);
  assert.match(processes, /export async function closeGodotProject/);
  assert.match(registry, /export async function importGodotProject/);
  assert.match(registry, /export async function installProjectAddon/);
  assert.match(registry, /export async function listKnownGodotProjects/);
  assert.match(registry, /export async function forgetGodotProject/);
});

test("project launch workflow delegates validation bridge process addon and registry domains", async () => {
  const launch = await readProjectSource("lifecycle/launch.js");
  const project = await readProjectSource("lifecycle/launch/project.js");
  const addon = await readProjectSource("lifecycle/launch/addon.js");
  const bridge = await readProjectSource("lifecycle/launch/bridge.js");
  const processEntry = await readProjectSource("lifecycle/launch/process-entry.js");
  const registry = await readProjectSource("lifecycle/launch/registry.js");

  assert.match(launch, /export async function openGodotProject/);
  assert.match(launch, /from "\.\/launch\/project\.js"/);
  assert.match(launch, /from "\.\/launch\/addon\.js"/);
  assert.match(launch, /from "\.\/launch\/bridge\.js"/);
  assert.match(launch, /from "\.\/launch\/process-entry\.js"/);
  assert.match(launch, /from "\.\/launch\/registry\.js"/);
  assert.doesNotMatch(launch, /spawn\(/);
  assert.doesNotMatch(launch, /randomUUID/);
  assert.doesNotMatch(launch, /assertAllowedProjectRoot/);
  assert.doesNotMatch(launch, /resolveBridgePort/);
  assert.doesNotMatch(launch, /installAddon/);
  assert.doesNotMatch(launch, /rememberGodotProject/);
  assert.doesNotMatch(launch, /child\.stdout/);

  assert.match(project, /export async function resolveLaunchProject/);
  assert.match(project, /export function reusableProjectResponse/);
  assert.match(project, /projectRoot is required/);
  assert.match(project, /project\.godot/);
  assert.match(project, /getRunningProjectByRoot/);
  assert.match(project, /serializeProjectProcess/);

  assert.match(addon, /export async function installProjectAddonForLaunch/);
  assert.match(addon, /installAddon/);

  assert.match(bridge, /export async function resolveLaunchBridgeOptions/);
  assert.match(bridge, /export function initialLaunchBridgeState/);
  assert.match(bridge, /export async function pollLaunchBridgeHealth/);
  assert.match(bridge, /resolveBridgePort/);
  assert.match(bridge, /normalizePositiveInteger/);
  assert.match(bridge, /GODOT_MCP_HOST/);
  assert.match(bridge, /pollBridgeHealth/);

  assert.match(processEntry, /export function createOpenProjectProcessEntry/);
  assert.match(processEntry, /export async function waitForOpenProjectProcessSpawn/);
  assert.match(processEntry, /spawn\(/);
  assert.match(processEntry, /randomUUID/);
  assert.match(processEntry, /openProjectProcesses/);
  assert.match(processEntry, /appendProcessOutput/);
  assert.match(processEntry, /waitForChildSpawn/);

  assert.match(registry, /export async function rememberOpenedGodotProject/);
  assert.match(registry, /rememberGodotProject/);
  assert.match(registry, /source: "opened"/);
  assert.match(registry, /lastOpenedAt/);
});

test("project schemas delegate focused domain modules", async () => {
  const schemas = await readProjectSource("schemas.js");
  const lifecycle = await readProjectSource("schemas/lifecycle.js");
  const lifecycleCreate = await readProjectSource("schemas/lifecycle/create.js");
  const lifecycleOpen = await readProjectSource("schemas/lifecycle/open.js");
  const lifecycleProcesses = await readProjectSource("schemas/lifecycle/processes.js");
  const lifecycleRegistry = await readProjectSource("schemas/lifecycle/registry.js");
  const diagnostics = await readProjectSource("schemas/diagnostics.js");
  const discovery = await readProjectSource("schemas/discovery.js");
  const logs = await readProjectSource("schemas/logs.js");

  assert.match(schemas, /from "\.\/schemas\/lifecycle\.js"/);
  assert.match(schemas, /from "\.\/schemas\/diagnostics\.js"/);
  assert.match(schemas, /from "\.\/schemas\/discovery\.js"/);
  assert.match(schemas, /from "\.\/schemas\/logs\.js"/);
  assert.doesNotMatch(schemas, /projectRoot: \{/);
  assert.match(lifecycle, /from "\.\/lifecycle\/create\.js"/);
  assert.match(lifecycle, /from "\.\/lifecycle\/open\.js"/);
  assert.match(lifecycle, /from "\.\/lifecycle\/processes\.js"/);
  assert.match(lifecycle, /from "\.\/lifecycle\/registry\.js"/);
  assert.doesNotMatch(lifecycle, /projectRoot: \{/);
  assert.doesNotMatch(lifecycle, /description: /);
  assert.doesNotMatch(lifecycle, /additionalProperties/);
  assert.match(lifecycleCreate, /export const CREATE_PROJECT_SCHEMA/);
  assert.match(lifecycleCreate, /projectRoot/);
  assert.match(lifecycleCreate, /overwrite/);
  assert.doesNotMatch(lifecycleCreate, /OPEN_PROJECT_SCHEMA/);
  assert.match(lifecycleOpen, /export const OPEN_PROJECT_SCHEMA/);
  assert.match(lifecycleOpen, /waitForBridge/);
  assert.match(lifecycleOpen, /reuseExisting/);
  assert.doesNotMatch(lifecycleOpen, /CREATE_PROJECT_SCHEMA/);
  assert.match(lifecycleProcesses, /export const GET_OPEN_PROJECTS_SCHEMA/);
  assert.match(lifecycleProcesses, /export const CLOSE_PROJECT_SCHEMA/);
  assert.match(lifecycleProcesses, /activeOnly/);
  assert.match(lifecycleProcesses, /SIGTERM/);
  assert.match(lifecycleRegistry, /export const IMPORT_PROJECT_SCHEMA/);
  assert.match(lifecycleRegistry, /export const INSTALL_PROJECT_ADDON_SCHEMA/);
  assert.match(lifecycleRegistry, /export const LIST_KNOWN_PROJECTS_SCHEMA/);
  assert.match(lifecycleRegistry, /export const FORGET_PROJECT_SCHEMA/);
  assert.match(lifecycleRegistry, /project registry/);
  assert.match(diagnostics, /export const DIAGNOSE_PROJECT_SETUP_SCHEMA/);
  assert.match(discovery, /export const DISCOVER_PROJECTS_SCHEMA/);
  assert.match(discovery, /export const LIST_SCENES_SCHEMA/);
  assert.match(logs, /export const OUTPUT_LOGS_SCHEMA/);
});

test("project tool index delegates lifecycle discovery and log descriptors", async () => {
  const index = await readProjectSource("index.js");
  const manifest = await readProjectSource("manifest.js");
  const lifecycle = await readProjectSource("tools/lifecycle.js");
  const discovery = await readProjectSource("tools/discovery.js");
  const logs = await readProjectSource("tools/logs.js");

  assert.match(index, /from "\.\/tools\/lifecycle\.js"/);
  assert.match(index, /from "\.\/tools\/discovery\.js"/);
  assert.match(index, /from "\.\/tools\/logs\.js"/);
  assert.doesNotMatch(index, /from "\.\.\/\.\.\/protocol\.js"/);
  assert.doesNotMatch(index, /from "\.\/schemas\.js"/);
  assert.doesNotMatch(index, /async handler/);
  assert.match(
    index,
    /PROJECT_LIFECYCLE_TOOL_DEFINITIONS\.concat\(\s*PROJECT_DISCOVERY_TOOL_DEFINITIONS,\s*PROJECT_LOG_TOOL_DEFINITIONS\s*\)/
  );
  assert.doesNotMatch(index, /PROJECT_MANAGEMENT_TOOL_DEFINITIONS = \[/);

  assert.match(manifest, /export const PROJECT_LIFECYCLE_TOOL_MANIFEST/);
  assert.match(manifest, /export const PROJECT_DISCOVERY_TOOL_MANIFEST/);
  assert.match(manifest, /export const PROJECT_LOG_TOOL_MANIFEST/);
  assert.match(manifest, /export const PROJECT_MANAGEMENT_TOOL_MANIFEST/);
  assert.match(manifest, /local: \{\s*handler: "createGodotProject"/);
  assert.match(manifest, /local: \{\s*handler: "discoverEditorBridges"/);
  assert.match(manifest, /local: \{\s*handler: "getGodotOutputLogs"/);

  assert.match(lifecycle, /export const PROJECT_LIFECYCLE_TOOL_DEFINITIONS/);
  assert.match(lifecycle, /toolDefinitionsFromManifest\(PROJECT_LIFECYCLE_TOOL_MANIFEST/);
  assert.match(lifecycle, /createGodotProject/);
  assert.match(lifecycle, /openGodotProject/);
  assert.match(lifecycle, /diagnoseGodotProjectSetup/);
  assert.doesNotMatch(lifecycle, /PROJECT_LIFECYCLE_TOOL_DEFINITIONS = \[/);
  assert.doesNotMatch(lifecycle, /toolResult/);

  assert.match(discovery, /export const PROJECT_DISCOVERY_TOOL_DEFINITIONS/);
  assert.match(discovery, /toolDefinitionsFromManifest\(PROJECT_DISCOVERY_TOOL_MANIFEST/);
  assert.match(discovery, /discoverGodotProjects/);
  assert.match(discovery, /discoverEditorBridges/);
  assert.match(discovery, /listScenes/);
  assert.doesNotMatch(discovery, /PROJECT_DISCOVERY_TOOL_DEFINITIONS = \[/);
  assert.doesNotMatch(discovery, /toolResult/);

  assert.match(logs, /export const PROJECT_LOG_TOOL_DEFINITIONS/);
  assert.match(logs, /toolDefinitionsFromManifest\(PROJECT_LOG_TOOL_MANIFEST/);
  assert.match(logs, /getGodotOutputLogs/);
  assert.doesNotMatch(logs, /PROJECT_LOG_TOOL_DEFINITIONS = \[/);
  assert.doesNotMatch(logs, /toolResult/);
});

test("project discovery delegates project scanner and scene scanner domains", async () => {
  const facade = await readProjectSource("discovery.js");
  const projects = await readProjectSource("discovery/projects.js");
  const projectScanner = await readProjectSource("discovery/project-scanner.js");
  const scenes = await readProjectSource("discovery/scenes.js");
  const sceneScanner = await readProjectSource("discovery/scene-scanner.js");

  assert.match(facade, /from "\.\/discovery\/projects\.js"/);
  assert.match(facade, /from "\.\/discovery\/scenes\.js"/);
  assert.doesNotMatch(facade, /readdir/);
  assert.doesNotMatch(facade, /collectProjectSceneFiles/);
  assert.doesNotMatch(facade, /scanProjectRoots/);

  assert.match(projects, /export async function discoverGodotProjects/);
  assert.match(projects, /scanProjectRoots/);
  assert.match(projects, /rememberGodotProject/);
  assert.doesNotMatch(projects, /collectProjectSceneFiles/);

  assert.match(projectScanner, /export async function scanProjectRoots/);
  assert.match(projectScanner, /export function shouldSkipDiscoveryDirectory/);
  assert.match(projectScanner, /projectMetadata/);

  assert.match(scenes, /export async function listScenes/);
  assert.match(scenes, /collectProjectSceneFiles/);
  assert.match(scenes, /parseGodotConfig/);
  assert.doesNotMatch(scenes, /rememberGodotProject/);

  assert.match(sceneScanner, /export async function collectProjectSceneFiles/);
  assert.match(sceneScanner, /export function isGodotSceneFile/);
  assert.match(sceneScanner, /absoluteProjectPathToResPath/);
});

test("project diagnostics delegate addon plugin check and recovery domains", async () => {
  const diagnostics = await readProjectSource("diagnostics.js");
  const addonFiles = await readProjectSource("diagnostics/addon-files.js");
  const checks = await readProjectSource("diagnostics/checks.js");
  const pluginConfig = await readProjectSource("diagnostics/plugin-config.js");
  const recovery = await readProjectSource("diagnostics/recovery.js");

  assert.match(diagnostics, /buildAddonFileChecks/);
  assert.match(diagnostics, /addonFilesReady/);
  assert.match(diagnostics, /diagnosticCheck/);
  assert.match(diagnostics, /projectTextHasEnabledNiuaPlugin/);
  assert.match(diagnostics, /bridgeRecoveryActions/);
  assert.doesNotMatch(diagnostics, /niua_mcp_runtime_probe_screenshot\.gd/);

  assert.match(addonFiles, /from "\.\/addon-files\/catalog\.js"/);
  assert.match(addonFiles, /from "\.\/addon-files\/check-runner\.js"/);
  assert.match(addonFiles, /from "\.\/addon-files\/readiness\.js"/);
  assert.match(checks, /export function diagnosticCheck/);
  assert.match(pluginConfig, /export function projectTextHasEnabledNiuaPlugin/);
  assert.match(recovery, /export function bridgeRecoveryActions/);
});

test("project addon file diagnostics delegate catalog runner and readiness modules", async () => {
  const facade = await readProjectSource("diagnostics/addon-files.js");
  const catalog = await readProjectSource("diagnostics/addon-files/catalog.js");
  const bridge = await readProjectSource("diagnostics/addon-files/catalog/bridge.js");
  const runtimeDebugger = await readProjectSource("diagnostics/addon-files/catalog/runtime-debugger.js");
  const filesystemResourceScript = await readProjectSource(
    "diagnostics/addon-files/catalog/filesystem-resource-script.js"
  );
  const editorSceneViewport = await readProjectSource(
    "diagnostics/addon-files/catalog/editor-scene-viewport.js"
  );
  const buildersProject = await readProjectSource("diagnostics/addon-files/catalog/builders-project.js");
  const checkRunner = await readProjectSource("diagnostics/addon-files/check-runner.js");
  const readiness = await readProjectSource("diagnostics/addon-files/readiness.js");

  assert.match(facade, /from "\.\/addon-files\/catalog\.js"/);
  assert.match(facade, /from "\.\/addon-files\/check-runner\.js"/);
  assert.match(facade, /from "\.\/addon-files\/readiness\.js"/);
  assert.doesNotMatch(facade, /niua_mcp_runtime_probe_screenshot\.gd/);

  assert.match(catalog, /CORE_BRIDGE_ADDON_FILE_CHECKS/);
  assert.match(catalog, /RUNTIME_DEBUGGER_ADDON_FILE_CHECKS/);
  assert.match(catalog, /FILESYSTEM_RESOURCE_SCRIPT_ADDON_FILE_CHECKS/);
  assert.match(catalog, /EDITOR_SCENE_VIEWPORT_ADDON_FILE_CHECKS/);
  assert.match(catalog, /BUILDERS_PROJECT_ADDON_FILE_CHECKS/);
  assert.match(catalog, /export const ADDON_FILE_CHECKS/);

  assert.match(bridge, /export const CORE_BRIDGE_ADDON_FILE_CHECKS/);
  assert.match(bridge, /addon_bridge_write_scene_tile_map_routes/);
  assert.match(runtimeDebugger, /export const RUNTIME_DEBUGGER_ADDON_FILE_CHECKS/);
  assert.match(runtimeDebugger, /addon_debugger_control_side_effects/);
  assert.match(filesystemResourceScript, /export const FILESYSTEM_RESOURCE_SCRIPT_ADDON_FILE_CHECKS/);
  assert.match(filesystemResourceScript, /addon_resource_sprite_frames_operations/);
  assert.match(editorSceneViewport, /export const EDITOR_SCENE_VIEWPORT_ADDON_FILE_CHECKS/);
  assert.match(editorSceneViewport, /addon_viewport_screenshot_operations/);
  assert.match(buildersProject, /export const BUILDERS_PROJECT_ADDON_FILE_CHECKS/);
  assert.match(buildersProject, /addon_project_settings_metadata/);

  assert.match(checkRunner, /export async function buildAddonFileChecks/);
  assert.match(checkRunner, /diagnosticCheck/);
  assert.match(checkRunner, /pathExists/);
  assert.match(readiness, /export function addonFilesReady/);
  assert.match(readiness, /REQUIRED_ADDON_CODES/);
});

test("create_project handler creates a Godot project and records it", async () => {
  await withAllowedWorkspace(async (workspace) => {
    const projectRoot = path.join(workspace, "demo");
    const result = await toolByName("create_project").handler({
      projectRoot,
      name: "Tool Demo",
      installAddon: false
    });
    const payload = parseToolText(result);

    assert.equal(payload.ok, true);
    assert.equal(payload.data.projectRoot, projectRoot);
    assert.equal(payload.data.name, "Tool Demo");
    assert.equal(payload.data.addonInstalled, false);
    assert.equal(existsSync(path.join(projectRoot, "project.godot")), true);
    assert.equal(existsSync(path.join(projectRoot, "scenes")), true);
    assert.equal(existsSync(path.join(projectRoot, "scripts")), true);
    const projectText = readFileSync(path.join(projectRoot, "project.godot"), "utf8");
    assert.match(projectText, /config\/name="Tool Demo"/);
    assert.doesNotMatch(projectText, /run\/main_scene/);

    const registryPayload = parseToolText(await toolByName("list_known_projects").handler({}));
    assert.deepEqual(registryPayload.data.projects.map((project) => project.projectRoot), [projectRoot]);
  });
});

test("get_output_logs handler can read process logs without bridge access", async () => {
  const payload = parseToolText(await toolByName("get_output_logs").handler({
    includeBridge: false,
    includeProcess: true
  }));

  assert.equal(payload.ok, true);
  assert.equal(payload.data.bridge.included, false);
  assert.deepEqual(payload.data.logs, []);
  assert.deepEqual(payload.data.processLogs, []);
});

test("get_output_logs handler includes runtime log events from the bridge", async () => {
  const requests = [];
  const server = createServer((request, response) => {
    requests.push(request.url);
    response.setHeader("content-type", "application/json");

    if (request.url === "/logs") {
      response.end(JSON.stringify({
        ok: true,
        data: {
          logs: ["bridge ready"]
        }
      }));
      return;
    }

    if (request.url === "/runtime/events?limit=5&kinds=runtime_log") {
      response.end(JSON.stringify({
        ok: true,
        data: {
          events: [
            {
              kind: "runtime_log",
              level: "warning",
              message: "NIUA_RUNTIME_OUTPUT",
              data: {
                marker: "ready"
              }
            }
          ]
        }
      }));
      return;
    }

    response.statusCode = 404;
    response.end(JSON.stringify({ ok: false, error: `Unexpected URL ${request.url}` }));
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  try {
    const payload = parseToolText(await toolByName("get_output_logs").handler({
      port,
      includeBridge: true,
      includeProcess: false,
      maxLines: 5
    }));

    assert.equal(payload.ok, true);
    assert.deepEqual(requests, ["/logs", "/runtime/events?limit=5&kinds=runtime_log"]);
    assert.equal(payload.data.bridge.available, true);
    assert.equal(payload.data.runtime.available, true);
    assert.deepEqual(payload.data.logs, ["bridge ready"]);
    assert.deepEqual(payload.data.runtimeLogs, ["WARNING: NIUA_RUNTIME_OUTPUT"]);
    assert.equal(payload.data.runtimeEvents[0].data.marker, "ready");
    assert.deepEqual(payload.data.processLogs, []);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
