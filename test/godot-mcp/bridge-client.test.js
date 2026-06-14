import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import test from "node:test";

import { GodotBridgeClient } from "../../src/godot-mcp/bridge-client.js";

async function withBridgeServer(handler, run) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  try {
    await run(port);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function readBridgeClientSource(file) {
  return readFile(new URL(`../../src/godot-mcp/${file}`, import.meta.url), "utf8");
}

test("GodotBridgeClient sends configured bridge auth token header", async () => {
  await withBridgeServer((req, res) => {
    assert.equal(req.headers["x-niua-mcp-token"], "test-token");
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { status: "ok" } }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port, token: "test-token" });
    const response = await client.request("/health");

    assert.deepEqual(response.data, { status: "ok" });
  });
});

test("GodotBridgeClient times out long bridge operations with partial progress context", async () => {
  await withBridgeServer((_req, _res) => {
    // Keep the socket open so the client-side operation timeout owns the failure.
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await assert.rejects(
      () => client.reimportAssets({
        paths: ["res://slow.glb", "res://slower.glb"],
        timeoutMs: 25
      }),
      (error) => {
        assert.match(error.message, /timed out after 25ms/);
        assert.match(error.message, /reimport_assets/);
        assert.match(error.message, /partialProgress/);
        assert.match(error.message, /requestedPaths: 2/);
        return true;
      }
    );
  });
});

test("GodotBridgeClient runtime polling lives in its own module", async () => {
  const client = await readBridgeClientSource("bridge-client.js");
  const runtimeFacade = await readBridgeClientSource("bridge-client/runtime.js");
  const runtimeBase = await readBridgeClientSource("bridge-client/runtime/base.js");
  const runtimeNodeProperties = await readBridgeClientSource("bridge-client/runtime/node-properties.js");
  const runtimeScreenshots = await readBridgeClientSource("bridge-client/runtime/screenshots.js");
  const runtimePolling = await readBridgeClientSource("bridge-client/runtime/polling.js");
  const runtimeSurface = [
    runtimeFacade,
    runtimeBase,
    runtimeNodeProperties,
    runtimeScreenshots,
    runtimePolling
  ].join("\n");

  assert.match(client, /RUNTIME_BRIDGE_METHODS/);
  assert.match(client, /Object\.assign\([\s\S]*GodotBridgeClient\.prototype[\s\S]*RUNTIME_BRIDGE_METHODS/);
  assert.doesNotMatch(client, /DEFAULT_RUNTIME_POLL_INTERVAL_MSEC/);
  assert.doesNotMatch(client, /function sleep/);
  assert.doesNotMatch(client, /async getRuntimeNodeProperties/);
  assert.doesNotMatch(client, /async setRuntimeNodeProperty/);
  assert.doesNotMatch(client, /async captureRuntimeScreenshot/);

  assert.match(runtimeFacade, /import \{ RUNTIME_BASE_BRIDGE_METHODS \} from "\.\/runtime\/base\.js"/);
  assert.match(runtimeFacade, /import \{ RUNTIME_NODE_PROPERTY_BRIDGE_METHODS \} from "\.\/runtime\/node-properties\.js"/);
  assert.match(runtimeFacade, /import \{ RUNTIME_SCREENSHOT_BRIDGE_METHODS \} from "\.\/runtime\/screenshots\.js"/);
  assert.match(runtimeFacade, /export const RUNTIME_BRIDGE_METHODS/);
  assert.match(runtimeFacade, /\.\.\.RUNTIME_BASE_BRIDGE_METHODS/);
  assert.match(runtimeFacade, /\.\.\.RUNTIME_NODE_PROPERTY_BRIDGE_METHODS/);
  assert.match(runtimeFacade, /\.\.\.RUNTIME_SCREENSHOT_BRIDGE_METHODS/);
  assert.doesNotMatch(runtimeFacade, /DEFAULT_RUNTIME_POLL_INTERVAL_MSEC/);
  assert.doesNotMatch(runtimeFacade, /function sleep/);
  assert.doesNotMatch(runtimeFacade, /async getRuntimeNodeProperties/);
  assert.doesNotMatch(runtimeFacade, /async setRuntimeNodeProperty/);
  assert.doesNotMatch(runtimeFacade, /async captureRuntimeScreenshot/);
  assert.doesNotMatch(runtimeFacade, /new URLSearchParams/);

  assert.match(runtimeSurface, /async installRuntimeProbe/);
  assert.match(runtimeSurface, /async getRuntimeState/);
  assert.match(runtimeSurface, /async getRuntimeEvents/);
  assert.match(runtimeSurface, /async requestRuntimeNodeProperties/);
  assert.match(runtimeSurface, /async getRuntimeNodeProperties/);
  assert.match(runtimeSurface, /async requestSetRuntimeNodeProperty/);
  assert.match(runtimeSurface, /async getRuntimeNodePropertySetResult/);
  assert.match(runtimeSurface, /async setRuntimeNodeProperty/);
  assert.match(runtimeSurface, /async requestRuntimeScreenshot/);
  assert.match(runtimeSurface, /async getRuntimeScreenshotResult/);
  assert.match(runtimeSurface, /async captureRuntimeScreenshot/);

  assert.match(runtimeBase, /export const RUNTIME_BASE_BRIDGE_METHODS/);
  assert.match(runtimeBase, /async installRuntimeProbe/);
  assert.match(runtimeBase, /async getRuntimeState/);
  assert.match(runtimeBase, /async getRuntimeEvents/);
  assert.match(runtimeBase, /filteredKinds/);

  assert.match(runtimeNodeProperties, /export const RUNTIME_NODE_PROPERTY_BRIDGE_METHODS/);
  assert.match(runtimeNodeProperties, /async requestRuntimeNodeProperties/);
  assert.match(runtimeNodeProperties, /async getRuntimeNodeProperties/);
  assert.match(runtimeNodeProperties, /async requestSetRuntimeNodeProperty/);
  assert.match(runtimeNodeProperties, /async getRuntimeNodePropertySetResult/);
  assert.match(runtimeNodeProperties, /async setRuntimeNodeProperty/);
  assert.match(runtimeNodeProperties, /pollRuntimeResult/);

  assert.match(runtimeScreenshots, /export const RUNTIME_SCREENSHOT_BRIDGE_METHODS/);
  assert.match(runtimeScreenshots, /async requestRuntimeScreenshot/);
  assert.match(runtimeScreenshots, /async getRuntimeScreenshotResult/);
  assert.match(runtimeScreenshots, /async captureRuntimeScreenshot/);
  assert.match(runtimeScreenshots, /pollRuntimeResult/);

  assert.match(runtimePolling, /export const DEFAULT_RUNTIME_POLL_INTERVAL_MSEC = 100/);
  assert.match(runtimePolling, /export const DEFAULT_RUNTIME_TIMEOUT_MSEC = 3000/);
  assert.match(runtimePolling, /function sleep/);
  assert.match(runtimePolling, /export async function pollRuntimeResult/);
  assert.match(runtimePolling, /await sleep/);
});

test("GodotBridgeClient filesystem and resource methods live in domain modules", async () => {
  const client = await readBridgeClientSource("bridge-client.js");
  const filesystem = await readBridgeClientSource("bridge-client/filesystem.js");
  const resources = await readBridgeClientSource("bridge-client/resources.js");

  assert.match(client, /FILESYSTEM_BRIDGE_METHODS/);
  assert.match(client, /RESOURCE_BRIDGE_METHODS/);
  assert.match(client, /Object\.assign\([\s\S]*GodotBridgeClient\.prototype[\s\S]*FILESYSTEM_BRIDGE_METHODS[\s\S]*RESOURCE_BRIDGE_METHODS/);
  assert.doesNotMatch(client, /async getFilesystemDockState/);
  assert.doesNotMatch(client, /async listFilesystem/);
  assert.doesNotMatch(client, /async batchFilesystemOperations/);
  assert.doesNotMatch(client, /async openResource/);
  assert.doesNotMatch(client, /async createResource/);
  assert.doesNotMatch(client, /async createShaderMaterial/);

  assert.match(filesystem, /export const FILESYSTEM_BRIDGE_METHODS/);
  assert.match(filesystem, /bridgeMethodsFromManifest\(FILESYSTEM_TOOL_MANIFEST\)/);
  assert.doesNotMatch(filesystem, /async getFilesystemDockState/);
  assert.doesNotMatch(filesystem, /async listFilesystem/);
  assert.doesNotMatch(filesystem, /async batchFilesystemOperations/);

  assert.match(resources, /export const RESOURCE_BRIDGE_METHODS/);
  assert.match(resources, /bridgeMethodsFromManifest\(RESOURCE_BRIDGE_TOOL_MANIFEST\)/);
  assert.doesNotMatch(resources, /async openResource/);
  assert.doesNotMatch(resources, /async createResource/);
  assert.doesNotMatch(resources, /async createShaderMaterial/);
});

test("GodotBridgeClient script methods live in a domain module", async () => {
  const client = await readBridgeClientSource("bridge-client.js");
  const scripts = await readBridgeClientSource("bridge-client/scripts.js");

  assert.match(client, /SCRIPT_BRIDGE_METHODS/);
  assert.match(client, /Object\.assign\([\s\S]*GodotBridgeClient\.prototype[\s\S]*SCRIPT_BRIDGE_METHODS/);
  assert.doesNotMatch(client, /async readScript/);
  assert.doesNotMatch(client, /async writeScript/);
  assert.doesNotMatch(client, /async getScriptSymbols/);
  assert.doesNotMatch(client, /async replaceInScripts/);
  assert.doesNotMatch(client, /async createScript/);
  assert.doesNotMatch(client, /async attachScript/);

  assert.match(scripts, /export const SCRIPT_BRIDGE_METHODS/);
  assert.match(scripts, /bridgeMethodsFromManifest\(SCRIPT_TOOL_MANIFEST\)/);
  assert.doesNotMatch(scripts, /async readScript/);
  assert.doesNotMatch(scripts, /async writeScript/);
  assert.doesNotMatch(scripts, /async getScriptSymbols/);
  assert.doesNotMatch(scripts, /async replaceInScripts/);
  assert.doesNotMatch(scripts, /async createScript/);
  assert.doesNotMatch(scripts, /async attachScript/);
});

test("GodotBridgeClient scene document methods live in a domain module", async () => {
  const client = await readBridgeClientSource("bridge-client.js");
  const scene = await readBridgeClientSource("bridge-client/scene.js");

  assert.match(client, /SCENE_BRIDGE_METHODS/);
  assert.match(client, /Object\.assign\([\s\S]*GodotBridgeClient\.prototype[\s\S]*SCENE_BRIDGE_METHODS/);
  assert.doesNotMatch(client, /async getSceneTree/);
  assert.doesNotMatch(client, /async openScene/);
  assert.doesNotMatch(client, /async saveCurrentScene/);

  assert.match(scene, /export const SCENE_BRIDGE_METHODS/);
  assert.match(scene, /bridgeMethodsFromManifest\(SCENE_BRIDGE_TOOL_MANIFEST\)/);
  assert.doesNotMatch(scene, /async getSceneTree/);
  assert.doesNotMatch(scene, /async openScene/);
  assert.doesNotMatch(scene, /async saveCurrentScene/);
});

test("GodotBridgeClient delegates editor project node viewport and tooling methods to domain modules", async () => {
  const client = await readBridgeClientSource("bridge-client.js");
  const editor = await readBridgeClientSource("bridge-client/editor.js");
  const project = await readBridgeClientSource("bridge-client/project.js");
  const imports = await readBridgeClientSource("bridge-client/imports.js");
  const run = await readBridgeClientSource("bridge-client/run.js");
  const exports = await readBridgeClientSource("bridge-client/exports.js");
  const debuggerClient = await readBridgeClientSource("bridge-client/debugger.js");
  const animation = await readBridgeClientSource("bridge-client/animation.js");
  const viewport = await readBridgeClientSource("bridge-client/viewport.js");
  const scene = await readBridgeClientSource("bridge-client/scene.js");
  const nodes = await readBridgeClientSource("bridge-client/nodes.js");
  const inspector = await readBridgeClientSource("bridge-client/inspector.js");

  for (const symbol of [
    "EDITOR_BRIDGE_METHODS",
    "PROJECT_BRIDGE_METHODS",
    "IMPORT_BRIDGE_METHODS",
    "RUN_BRIDGE_METHODS",
    "EXPORT_BRIDGE_METHODS",
    "DEBUGGER_BRIDGE_METHODS",
    "ANIMATION_BRIDGE_METHODS",
    "VIEWPORT_BRIDGE_METHODS",
    "NODE_BRIDGE_METHODS",
    "INSPECTOR_BRIDGE_METHODS"
  ]) {
    assert.match(client, new RegExp(symbol));
    assert.match(client, new RegExp(`Object\\.assign\\([\\s\\S]*GodotBridgeClient\\.prototype[\\s\\S]*${symbol}`));
  }

  for (const method of [
    "async getEditorState",
    "async getProjectSettings",
    "async listImportedAssets",
    "async runMainScene",
    "async listExportPresets",
    "async getDebuggerState",
    "async listAnimations",
    "async captureViewportScreenshot",
    "async searchNodeTypes",
    "async createNode",
    "async setTileMapLayerCells",
    "async setNodeProperty",
    "async assignMaterial",
    "async getInspectorProperties"
  ]) {
    assert.doesNotMatch(client, new RegExp(method));
  }

  assert.doesNotMatch(scene, /async searchNodeTypes/);
  assert.doesNotMatch(scene, /async createNode/);
  assert.doesNotMatch(scene, /async setTileMapLayerCells/);
  assert.doesNotMatch(scene, /async setNodeProperty/);
  assert.doesNotMatch(scene, /async assignMaterial/);
  assert.doesNotMatch(scene, /async getInspectorProperties/);
  assert.match(editor, /export const EDITOR_BRIDGE_METHODS/);
  assert.match(editor, /async getEditorState/);
  assert.match(editor, /async setSelection/);
  assert.match(editor, /async invokeEditorAction/);
  assert.match(project, /export const PROJECT_BRIDGE_METHODS/);
  assert.match(project, /bridgeMethodsFromManifest\(PROJECT_SETTINGS_TOOL_MANIFEST\)/);
  assert.match(imports, /export const IMPORT_BRIDGE_METHODS/);
  assert.match(imports, /bridgeMethodsFromManifest\(IMPORT_TOOL_MANIFEST\)/);
  assert.match(run, /export const RUN_BRIDGE_METHODS/);
  assert.match(run, /bridgeMethodsFromManifest\(RUN_TOOL_MANIFEST\)/);
  assert.match(exports, /export const EXPORT_BRIDGE_METHODS/);
  assert.match(exports, /bridgeMethodsFromManifest\(EXPORT_PRESET_TOOL_MANIFEST\)/);
  assert.match(debuggerClient, /export const DEBUGGER_BRIDGE_METHODS/);
  assert.match(debuggerClient, /bridgeMethodsFromManifest\(DEBUGGER_CONTROL_TOOL_MANIFEST\)/);
  assert.match(animation, /export const ANIMATION_BRIDGE_METHODS/);
  assert.match(animation, /bridgeMethodsFromManifest\(ANIMATION_TOOL_MANIFEST\)/);
  assert.doesNotMatch(animation, /async listAnimations/);
  assert.doesNotMatch(animation, /new URLSearchParams/);
  assert.match(viewport, /export const VIEWPORT_BRIDGE_METHODS/);
  assert.match(viewport, /bridgeMethodsFromManifest\(VIEWPORT_BRIDGE_TOOL_MANIFEST\)/);
  assert.doesNotMatch(viewport, /async captureViewportScreenshot/);
  assert.doesNotMatch(viewport, /async sendViewportInput/);
  assert.match(nodes, /export const NODE_BRIDGE_METHODS/);
  assert.match(nodes, /bridgeMethodsFromManifest\(COMMON_NODE_TOOL_MANIFEST\)/);
  assert.doesNotMatch(nodes, /async searchNodeTypes/);
  assert.doesNotMatch(nodes, /async createNode/);
  assert.doesNotMatch(nodes, /async createNodeWithScript/);
  assert.doesNotMatch(nodes, /async renameNode/);
  assert.doesNotMatch(nodes, /async deleteNode/);
  assert.doesNotMatch(nodes, /async duplicateNode/);
  assert.doesNotMatch(nodes, /async reparentNode/);
  assert.doesNotMatch(nodes, /async reorderNode/);
  assert.match(nodes, /async setTileMapLayerCells/);
  assert.match(nodes, /async assignMaterial/);
  assert.match(inspector, /export const INSPECTOR_BRIDGE_METHODS/);
  assert.match(inspector, /bridgeMethodsFromManifest\(INSPECTOR_TOOL_MANIFEST\)/);
  assert.doesNotMatch(inspector, /async getInspectorProperties/);
  assert.doesNotMatch(inspector, /async setNodeProperty/);
  assert.doesNotMatch(inspector, /new URLSearchParams/);
});

test("GodotBridgeClient reads editor state from the plugin bridge", async () => {
  await withBridgeServer((req, res) => {
    if (req.url === "/editor/state") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          projectRoot: "/tmp/game",
          currentScene: "res://scenes/main.tscn",
          openScenes: ["res://scenes/main.tscn"],
          mainScreen: { available: true, name: "3D" },
          selection: [],
          logs: []
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end("not found");
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const state = await client.getEditorState();

    assert.equal(state.ok, true);
    assert.equal(state.data.currentScene, "res://scenes/main.tscn");
    assert.deepEqual(state.data.mainScreen, { available: true, name: "3D" });
  });
});

test("GodotBridgeClient surfaces HTTP bridge errors", async () => {
  await withBridgeServer((req, res) => {
    res.statusCode = 503;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: false, error: `offline: ${req.url}` }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await assert.rejects(
      () => client.getProjectInfo(),
      /Godot bridge returned 503/
    );
  });
});

test("GodotBridgeClient sends JSON POST bodies for node creation", async () => {
  let receivedBody = null;
  let receivedContentType = "";

  await withBridgeServer(async (req, res) => {
    if (req.url === "/scene/node/create" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedContentType = req.headers["content-type"] ?? "";
      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: "Player",
          type: "Node3D"
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end("not found");
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const result = await client.createNode({
      type: "Node3D",
      name: "Player",
      parentPath: ""
    });

    assert.equal(result.ok, true);
    assert.match(receivedContentType, /application\/json/);
    assert.deepEqual(receivedBody, {
      type: "Node3D",
      name: "Player",
      parentPath: ""
    });
  });
});

test("GodotBridgeClient encodes inspector node paths in the query string", async () => {
  await withBridgeServer((req, res) => {
    if (req.url === "/inspector/properties?nodePath=Player%2FCamera") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: "Player/Camera",
          properties: [
            { name: "visible", type: "bool", value: true }
          ]
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end("not found");
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const result = await client.getInspectorProperties({ nodePath: "Player/Camera" });

    assert.equal(result.ok, true);
    assert.equal(result.data.properties[0].name, "visible");
  });
});

test("GodotBridgeClient forwards editor selection and focus requests", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        endpoint: req.url
      }
    }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await client.setSelection({ nodePaths: ["Player", "Player/Camera"] });
    await client.focusNode({ nodePath: "Player/Camera" });
    await client.focusResource({ path: "res://scenes/main.tscn" });

    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/selection/set",
        body: { nodePaths: ["Player", "Player/Camera"] }
      },
      {
        method: "POST",
        url: "/selection/focus/node",
        body: { nodePath: "Player/Camera" }
      },
      {
        method: "POST",
        url: "/resource/focus",
        body: { path: "res://scenes/main.tscn" }
      }
    ]);
  });
});

test("GodotBridgeClient forwards scene node mutation requests", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        endpoint: req.url
      }
    }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await client.renameNode({ nodePath: "Player", newName: "Hero" });
    await client.deleteNode({ nodePath: "HeroCopy" });
    await client.duplicateNode({ nodePath: "Hero", newName: "HeroCopy", parentPath: "" });
    await client.reparentNode({
      nodePath: "Hero",
      newParentPath: "Container",
      keepGlobalTransform: true
    });
    await client.reorderNode({ nodePath: "Third", index: 0 });
    await client.assignMaterial({
      nodePath: "Track/Mesh",
      materialPath: "res://materials/neon.tres",
      surfaceIndex: 0
    });

    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/scene/node/rename",
        body: { nodePath: "Player", newName: "Hero" }
      },
      {
        method: "POST",
        url: "/scene/node/delete",
        body: { nodePath: "HeroCopy" }
      },
      {
        method: "POST",
        url: "/scene/node/duplicate",
        body: { nodePath: "Hero", newName: "HeroCopy", parentPath: "" }
      },
      {
        method: "POST",
        url: "/scene/node/reparent",
        body: {
          nodePath: "Hero",
          newParentPath: "Container",
          keepGlobalTransform: true
        }
      },
      {
        method: "POST",
        url: "/scene/node/reorder",
        body: { nodePath: "Third", index: 0 }
      },
      {
        method: "POST",
        url: "/node/material/assign",
        body: {
          nodePath: "Track/Mesh",
          materialPath: "res://materials/neon.tres",
          surfaceIndex: 0
        }
      }
    ]);
  });
});

test("GodotBridgeClient forwards scene creation and save-as requests", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await client.createScene({
      path: "res://scenes/generated.tscn",
      rootType: "Node3D",
      rootName: "GeneratedRoot"
    });
    await client.saveSceneAs({
      path: "res://scenes/generated_copy.tscn"
    });

    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/scene/create",
        body: {
          path: "res://scenes/generated.tscn",
          rootType: "Node3D",
          rootName: "GeneratedRoot"
        }
      },
      {
        method: "POST",
        url: "/scene/save-as",
        body: {
          path: "res://scenes/generated_copy.tscn"
        }
      }
    ]);
  });
});

test("GodotBridgeClient forwards scene tab control requests", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await client.switchSceneTab({ path: "res://scenes/two.tscn" });
    await client.closeScene({ path: "res://scenes/two.tscn", saveBeforeClose: true });
    await client.markSceneUnsaved({ path: "res://scenes/main.tscn" });
    await client.undoEditorAction({ historyId: 7 });
    await client.redoEditorAction({ historyId: 7 });

    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/scene/switch",
        body: { path: "res://scenes/two.tscn" }
      },
      {
        method: "POST",
        url: "/scene/close",
        body: { path: "res://scenes/two.tscn", saveBeforeClose: true }
      },
      {
        method: "POST",
        url: "/scene/mark-unsaved",
        body: { path: "res://scenes/main.tscn" }
      },
      {
        method: "POST",
        url: "/editor/undo",
        body: { historyId: 7 }
      },
      {
        method: "POST",
        url: "/editor/redo",
        body: { historyId: 7 }
      }
    ]);
  });
});

test("GodotBridgeClient reads open scene tab state", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        currentScene: "res://scenes/main.tscn",
        currentIndex: 0,
        openScenes: ["res://scenes/main.tscn", "res://scenes/two.tscn"],
        tabs: [
          {
            index: 0,
            path: "res://scenes/main.tscn",
            current: true,
            rootName: "Main",
            rootType: "Node3D",
            rootPath: "/root/Main",
            rootSceneFilePath: "res://scenes/main.tscn",
            edited: true,
            unsaved: true,
            dirtySource: "EditorInterface.is_object_edited",
            historyId: 7,
            historyVersion: 12,
            hasUndo: true,
            hasRedo: false
          },
          {
            index: 1,
            path: "res://scenes/two.tscn",
            current: false,
            rootName: "Two",
            rootType: "Node2D",
            rootPath: "/root/Two",
            rootSceneFilePath: "res://scenes/two.tscn",
            edited: false,
            unsaved: false,
            dirtySource: "EditorInterface.is_object_edited",
            historyId: 8,
            historyVersion: 3,
            hasUndo: false,
            hasRedo: false
          }
        ]
      }
    }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.getOpenSceneTabs();

    assert.deepEqual(seenUrls, ["/scene/tabs"]);
    assert.equal(response.data.tabs[0].unsaved, true);
    assert.equal(response.data.tabs[0].historyVersion, 12);
    assert.equal(response.data.tabs[1].dirtySource, "EditorInterface.is_object_edited");
  });
});

test("GodotBridgeClient encodes filesystem query requests", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");

    if (req.url === "/filesystem/list?path=res%3A%2F%2Fscripts&recursive=true") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://scripts",
          entries: []
        }
      }));
      return;
    }

    if (req.url === "/filesystem/file/read?path=res%3A%2F%2Fscripts%2Fplayer.gd") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://scripts/player.gd",
          content: "extends Node\n"
        }
      }));
      return;
    }

    if (req.url === "/filesystem/state") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          selectedPaths: ["res://scripts/player.gd"],
          currentPath: "res://scripts/player.gd",
          currentDirectory: "res://scripts"
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await client.listFilesystem({ path: "res://scripts", recursive: true });
    await client.readTextFile({ path: "res://scripts/player.gd" });
    await client.getFilesystemDockState();

    assert.deepEqual(seenUrls, [
      "/filesystem/list?path=res%3A%2F%2Fscripts&recursive=true",
      "/filesystem/file/read?path=res%3A%2F%2Fscripts%2Fplayer.gd",
      "/filesystem/state"
    ]);
  });
});

test("GodotBridgeClient forwards filesystem mutation requests", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await client.createFolder({ path: "res://scripts" });
    await client.writeTextFile({ path: "res://scripts/player.gd", content: "extends Node\n" });
    await client.moveFilesystemEntry({
      fromPath: "res://scripts/player.gd",
      toPath: "res://scripts/hero.gd"
    });
    await client.copyFilesystemEntry({
      fromPath: "res://scripts/hero.gd",
      toPath: "res://scripts/hero_copy.gd",
      overwrite: true
    });
    await client.batchFilesystemOperations({
      operations: [
        {
          kind: "copy",
          fromPath: "res://scripts/hero.gd",
          toPath: "res://scripts/hero_backup.gd",
          overwrite: true
        },
        {
          kind: "delete",
          path: "res://scripts/old.gd"
        }
      ],
      continueOnError: true,
      dryRun: false
    });
    await client.deleteFilesystemEntry({ path: "res://scripts/old.gd" });
    await client.openResource({ path: "res://scenes/main.tscn" });
    await client.createResource({
      path: "res://materials/neon.tres",
      className: "StandardMaterial3D",
      properties: {
        albedo_color: { type: "Color", r: 0, g: 1, b: 1, a: 1 }
      },
      open: true
    });
    await client.saveResource({
      path: "res://materials/neon.tres",
      properties: {
        metallic: 0.5
      }
    });

    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/filesystem/folder/create",
        body: { path: "res://scripts" }
      },
      {
        method: "POST",
        url: "/filesystem/file/write",
        body: { path: "res://scripts/player.gd", content: "extends Node\n" }
      },
      {
        method: "POST",
        url: "/filesystem/move",
        body: { fromPath: "res://scripts/player.gd", toPath: "res://scripts/hero.gd" }
      },
      {
        method: "POST",
        url: "/filesystem/copy",
        body: {
          fromPath: "res://scripts/hero.gd",
          toPath: "res://scripts/hero_copy.gd",
          overwrite: true
        }
      },
      {
        method: "POST",
        url: "/filesystem/batch",
        body: {
          operations: [
            {
              kind: "copy",
              fromPath: "res://scripts/hero.gd",
              toPath: "res://scripts/hero_backup.gd",
              overwrite: true
            },
            {
              kind: "delete",
              path: "res://scripts/old.gd"
            }
          ],
          continueOnError: true,
          dryRun: false
        }
      },
      {
        method: "POST",
        url: "/filesystem/delete",
        body: { path: "res://scripts/old.gd" }
      },
      {
        method: "POST",
        url: "/resource/open",
        body: { path: "res://scenes/main.tscn" }
      },
      {
        method: "POST",
        url: "/resource/create",
        body: {
          path: "res://materials/neon.tres",
          className: "StandardMaterial3D",
          properties: {
            albedo_color: { type: "Color", r: 0, g: 1, b: 1, a: 1 }
          },
          open: true
        }
      },
      {
        method: "POST",
        url: "/resource/save",
        body: {
          path: "res://materials/neon.tres",
          properties: {
            metallic: 0.5
          }
        }
      }
    ]);
  });
});

test("GodotBridgeClient forwards SpriteFrames resource creation requests", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    await client.createSpriteFrames({
      path: "res://animations/player_frames.tres",
      resourceName: "Player Frames",
      animations: [
        {
          name: "idle",
          speedFps: 6,
          loop: true,
          frames: [
            { texturePath: "res://sprites/player_idle_0.png", duration: 1 },
            { texturePath: "res://sprites/player_idle_1.png", duration: 1.25 }
          ]
        }
      ],
      open: false,
      overwrite: true
    });

    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/resource/sprite-frames/create",
        body: {
          path: "res://animations/player_frames.tres",
          resourceName: "Player Frames",
          animations: [
            {
              name: "idle",
              speedFps: 6,
              loop: true,
              frames: [
                { texturePath: "res://sprites/player_idle_0.png", duration: 1 },
                { texturePath: "res://sprites/player_idle_1.png", duration: 1.25 }
              ]
            }
          ],
          open: false,
          overwrite: true
        }
      }
    ]);
  });
});

test("GodotBridgeClient forwards ShaderMaterial creation requests", async () => {
  const received = [];
  const code = [
    "shader_type spatial;",
    "uniform vec4 glow_color : source_color = vec4(0.0, 1.0, 1.0, 1.0);",
    "void fragment() {",
    "  ALBEDO = glow_color.rgb;",
    "}"
  ].join("\n");

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    await client.createShaderMaterial({
      path: "res://materials/hologram_panel.tres",
      shaderPath: "res://materials/hologram_panel.gdshader",
      resourceName: "Hologram Panel",
      code,
      parameters: {
        glow_color: { type: "Color", r: 0, g: 1, b: 1, a: 0.8 }
      },
      open: true,
      overwrite: true,
      overwriteShader: true
    });

    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/resource/shader-material/create",
        body: {
          path: "res://materials/hologram_panel.tres",
          shaderPath: "res://materials/hologram_panel.gdshader",
          resourceName: "Hologram Panel",
          code,
          parameters: {
            glow_color: { type: "Color", r: 0, g: 1, b: 1, a: 0.8 }
          },
          open: true,
          overwrite: true,
          overwriteShader: true
        }
      }
    ]);
  });
});

test("GodotBridgeClient forwards TileSet resource creation requests", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    await client.createTileSet({
      path: "res://tilesets/arena.tres",
      resourceName: "Arena Tiles",
      tileSize: { x: 32, y: 32 },
      sources: [
        {
          sourceId: 0,
          texturePath: "res://tiles/arena.png",
          textureRegionSize: { x: 32, y: 32 },
          tiles: [
            { atlasCoords: { x: 0, y: 0 }, size: { x: 1, y: 1 } },
            { atlasCoords: { x: 1, y: 0 }, size: { x: 1, y: 1 } }
          ]
        }
      ],
      open: false,
      overwrite: true
    });

    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/resource/tile-set/create",
        body: {
          path: "res://tilesets/arena.tres",
          resourceName: "Arena Tiles",
          tileSize: { x: 32, y: 32 },
          sources: [
            {
              sourceId: 0,
              texturePath: "res://tiles/arena.png",
              textureRegionSize: { x: 32, y: 32 },
              tiles: [
                { atlasCoords: { x: 0, y: 0 }, size: { x: 1, y: 1 } },
                { atlasCoords: { x: 1, y: 0 }, size: { x: 1, y: 1 } }
              ]
            }
          ],
          open: false,
          overwrite: true
        }
      }
    ]);
  });
});

test("GodotBridgeClient forwards TileMapLayer cell edit requests", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    await client.setTileMapLayerCells({
      nodePath: "Root/Ground",
      clear: true,
      cells: [
        {
          coords: { x: 0, y: 0 },
          sourceId: 0,
          atlasCoords: { x: 1, y: 0 },
          alternativeTile: 0
        },
        {
          coords: { x: 4, y: 2 },
          erase: true
        }
      ]
    });

    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/scene/tile-map-layer/cells/set",
        body: {
          nodePath: "Root/Ground",
          clear: true,
          cells: [
            {
              coords: { x: 0, y: 0 },
              sourceId: 0,
              atlasCoords: { x: 1, y: 0 },
              alternativeTile: 0
            },
            {
              coords: { x: 4, y: 2 },
              erase: true
            }
          ]
        }
      }
    ]);
  });
});

test("GodotBridgeClient forwards TileMapLayer terrain paint requests", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    await client.paintTileMapLayerTerrain({
      nodePath: "Root/Ground",
      mode: "connect",
      terrainSet: 0,
      terrain: 1,
      coords: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
      ignoreEmptyTerrains: true
    });

    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/scene/tile-map-layer/terrain/paint",
        body: {
          nodePath: "Root/Ground",
          mode: "connect",
          terrainSet: 0,
          terrain: 1,
          coords: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
          ignoreEmptyTerrains: true
        }
      }
    ]);
  });
});

test("GodotBridgeClient encodes project settings and input map read requests", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");

    if (req.url === "/project/settings?prefix=application%2F") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          prefix: "application/",
          settings: [
            {
              name: "application/config/name",
              type: "String",
              value: "NIUA",
              declaredType: "String",
              typeId: 4,
              hint: 0,
              hintString: "",
              usage: 6,
              usageFlags: ["storage", "editor"],
              isEditorVisible: true,
              isBasic: false,
              isInternal: false,
              restartIfChanged: false,
              order: 0,
              pathSegments: ["application", "config", "name"],
              category: "application",
              section: "application/config",
              leaf: "name"
            }
          ],
          categories: [
            {
              name: "application",
              path: "application",
              settingCount: 1,
              settings: ["application/config/name"],
              sections: [
                {
                  name: "config",
                  path: "application/config",
                  settingCount: 1,
                  settings: ["application/config/name"]
                }
              ]
            }
          ]
        }
      }));
      return;
    }

    if (req.url === "/project/settings?prefix=&query=render&editorVisible=true&basic=false&internal=false&restartIfChanged=true") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          prefix: "",
          query: "render",
          filters: {
            editorVisible: true,
            basic: false,
            internal: false,
            restartIfChanged: true
          },
          settingCount: 0,
          settings: [],
          categories: []
        }
      }));
      return;
    }

    if (req.url === "/input/map") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          actions: []
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    const settingsResponse = await client.getProjectSettings({ prefix: "application/" });
    const filteredSettingsResponse = await client.getProjectSettings({
      query: "render",
      editorVisible: true,
      basic: false,
      internal: false,
      restartIfChanged: true
    });
    await client.getInputMap();

    assert.deepEqual(seenUrls, [
      "/project/settings?prefix=application%2F",
      "/project/settings?prefix=&query=render&editorVisible=true&basic=false&internal=false&restartIfChanged=true",
      "/input/map"
    ]);
    assert.equal(settingsResponse.data.settings[0].category, "application");
    assert.deepEqual(settingsResponse.data.settings[0].usageFlags, ["storage", "editor"]);
    assert.equal(settingsResponse.data.categories[0].sections[0].path, "application/config");
    assert.equal(filteredSettingsResponse.data.filters.restartIfChanged, true);
  });
});

test("GodotBridgeClient forwards project setting and input action mutations", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await client.setProjectSetting({
      name: "application/config/name",
      value: "Neon Racer",
      save: true
    });
    await client.setProjectSettingMetadata({
      name: "application/config/name",
      order: 10,
      initialValue: "Neon Racer",
      basic: true,
      internal: false,
      restartIfChanged: true,
      save: true
    });
    await client.setInputAction({
      name: "move_forward",
      deadzone: 0.2,
      replace: true,
      events: [
        { type: "key", keycode: 87 },
        { type: "action", action: "ui_accept", pressed: true, strength: 1, eventIndex: 0 },
        { type: "mouse_button", buttonIndex: 1, doubleClick: false },
        { type: "joypad_motion", axis: 0, axisValue: -1 }
      ],
      save: true
    });

    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/project/setting/set",
        body: {
          name: "application/config/name",
          value: "Neon Racer",
          save: true
        }
      },
      {
        method: "POST",
        url: "/project/setting/metadata/set",
        body: {
          name: "application/config/name",
          order: 10,
          initialValue: "Neon Racer",
          basic: true,
          internal: false,
          restartIfChanged: true,
          save: true
        }
      },
      {
        method: "POST",
        url: "/input/action/set",
        body: {
          name: "move_forward",
          deadzone: 0.2,
          replace: true,
          events: [
            { type: "key", keycode: 87 },
            { type: "action", action: "ui_accept", pressed: true, strength: 1, eventIndex: 0 },
            { type: "mouse_button", buttonIndex: 1, doubleClick: false },
            { type: "joypad_motion", axis: 0, axisValue: -1 }
          ],
          save: true
        }
      }
    ]);
  });
});

test("GodotBridgeClient encodes script editor read and validate requests", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");

    if (req.url === "/script/read?path=res%3A%2F%2Fscripts%2Fplayer.gd") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://scripts/player.gd",
          content: "extends Node\n"
        }
      }));
      return;
    }

    if (req.url === "/script/validate?path=res%3A%2F%2Fscripts%2Fplayer.gd") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://scripts/player.gd",
          valid: true
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await client.readScript({ path: "res://scripts/player.gd" });
    await client.validateScript({ path: "res://scripts/player.gd" });

    assert.deepEqual(seenUrls, [
      "/script/read?path=res%3A%2F%2Fscripts%2Fplayer.gd",
      "/script/validate?path=res%3A%2F%2Fscripts%2Fplayer.gd"
    ]);
  });
});

test("GodotBridgeClient reads script symbols", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");

    if (req.url === "/script/symbols?path=res%3A%2F%2Fscripts%2Fplayer.gd") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://scripts/player.gd",
          type: "GDScript",
          reloadError: 0,
          methods: [{ name: "_ready" }],
          properties: [],
          signals: [],
          constants: {}
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    const response = await client.getScriptSymbols({ path: "res://scripts/player.gd" });

    assert.equal(response.data.path, "res://scripts/player.gd");
    assert.deepEqual(seenUrls, ["/script/symbols?path=res%3A%2F%2Fscripts%2Fplayer.gd"]);
  });
});

test("GodotBridgeClient reads script cursor state", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");

    if (req.url === "/script/cursor/state") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          cursorAvailable: true,
          currentScript: { path: "res://scripts/player.gd", type: "GDScript" },
          lineCount: 12,
          carets: [{ index: 0, line: 2, lineOneBased: 3, column: 4, hasSelection: false }]
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    const response = await client.getScriptCursorState();

    assert.equal(response.data.cursorAvailable, true);
    assert.deepEqual(seenUrls, ["/script/cursor/state"]);
  });
});

test("GodotBridgeClient forwards script editor mutation requests", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await client.writeScript({ path: "res://scripts/player.gd", content: "extends Node\n" });
    await client.openScript({ path: "res://scripts/player.gd" });
    await client.replaceInScripts({
      search: "old_name",
      replacement: "new_name",
      paths: ["res://scripts/player.gd"],
      dryRun: true
    });

    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/script/write",
        body: { path: "res://scripts/player.gd", content: "extends Node\n" }
      },
      {
        method: "POST",
        url: "/script/open",
        body: { path: "res://scripts/player.gd" }
      },
      {
        method: "POST",
        url: "/script/refactor/replace",
        body: {
          search: "old_name",
          replacement: "new_name",
          paths: ["res://scripts/player.gd"],
          dryRun: true
        }
      }
    ]);
  });
});

test("GodotBridgeClient reads script editor state and jumps to script lines", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    if (req.url === "/script/editor/state" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          currentScript: { path: "res://scripts/player.gd", type: "GDScript" },
          openScripts: [{ path: "res://scripts/player.gd", type: "GDScript" }],
          breakpoints: [{ path: "res://scripts/player.gd", line: 12 }]
        }
      }));
      return;
    }

    if (req.url === "/script/goto-line" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      received.push(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://scripts/player.gd",
          requestedLine: 13,
          editorLine: 13,
          column: 2,
          opened: true
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    const state = await client.getScriptEditorState();
    await client.gotoScriptLine({
      path: "res://scripts/player.gd",
      line: 13,
      column: 2
    });

    assert.equal(state.data.currentScript.path, "res://scripts/player.gd");
    assert.deepEqual(received, [{
      path: "res://scripts/player.gd",
      line: 13,
      column: 2
    }]);
  });
});

test("GodotBridgeClient forwards script creation and attachment requests", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await client.createScript({
      path: "res://scripts/player.gd",
      baseType: "Node3D",
      template: "node_lifecycle",
      className: "PlayerController"
    });
    await client.attachScript({
      nodePath: "Player",
      scriptPath: "res://scripts/player.gd",
      createIfMissing: true,
      template: "node_process",
      className: "AttachedController",
      saveScene: true
    });

    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/script/create",
        body: {
          path: "res://scripts/player.gd",
          baseType: "Node3D",
          template: "node_lifecycle",
          className: "PlayerController"
        }
      },
      {
        method: "POST",
        url: "/script/attach",
        body: {
          nodePath: "Player",
          scriptPath: "res://scripts/player.gd",
          createIfMissing: true,
          template: "node_process",
          className: "AttachedController",
          saveScene: true
        }
      }
    ]);
  });
});

test("GodotBridgeClient forwards create-node-with-script requests", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await client.createNodeWithScript({
      type: "Node3D",
      name: "Player",
      scriptPath: "res://scripts/player.gd",
      scriptTemplate: "tool_node",
      scriptClassName: "PlayerNode"
    });

    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/scene/node/create-with-script",
        body: {
          type: "Node3D",
          name: "Player",
          scriptPath: "res://scripts/player.gd",
          scriptTemplate: "tool_node",
          scriptClassName: "PlayerNode"
        }
      }
    ]);
  });
});

test("GodotBridgeClient encodes node type search requests", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        matches: []
      }
    }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await client.searchNodeTypes({
      query: "camera",
      baseType: "Node3D",
      includeAbstract: true,
      includeDisabled: true,
      limit: 12
    });

    assert.deepEqual(seenUrls, [
      "/node-types/search?query=camera&baseType=Node3D&includeAbstract=true&includeDisabled=true&limit=12"
    ]);
  });
});

test("GodotBridgeClient encodes import dock requests", async () => {
  const seen = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    seen.push({
      method: req.method,
      url: req.url,
      body: chunks.length > 0
        ? JSON.parse(Buffer.concat(chunks).toString("utf8"))
        : null
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await client.listImportedAssets({ path: "res://assets", recursive: true });
    await client.getImportMetadata({ path: "res://assets/ship.glb" });
    await client.getImportDiagnostics({ path: "res://assets/ship.glb" });
    await client.getImportEvents({
      limit: 10,
      kinds: ["resources_reimported", "sources_changed"],
      sinceMsec: 123
    });
    await client.setImportOptions({
      path: "res://assets/ship.glb",
      options: {
        "nodes/root_type": "CharacterBody3D",
        "meshes/create_shadow_meshes": false
      },
      reimport: true
    });
    await client.reimportAssets({ paths: ["res://assets/ship.glb"] });

    assert.deepEqual(seen, [
      {
        method: "GET",
        url: "/import/assets?path=res%3A%2F%2Fassets&recursive=true",
        body: null
      },
      {
        method: "GET",
        url: "/import/metadata?path=res%3A%2F%2Fassets%2Fship.glb",
        body: null
      },
      {
        method: "GET",
        url: "/import/diagnostics?path=res%3A%2F%2Fassets%2Fship.glb",
        body: null
      },
      {
        method: "GET",
        url: "/import/events?limit=10&kinds=resources_reimported%2Csources_changed&sinceMsec=123",
        body: null
      },
      {
        method: "POST",
        url: "/import/options/set",
        body: {
          path: "res://assets/ship.glb",
          options: {
            "nodes/root_type": "CharacterBody3D",
            "meshes/create_shadow_meshes": false
          },
          reimport: true
        }
      },
      {
        method: "POST",
        url: "/import/reimport",
        body: {
          paths: ["res://assets/ship.glb"]
        }
      }
    ]);
  });
});

test("GodotBridgeClient forwards run control requests", async () => {
  const seen = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    seen.push({
      method: req.method,
      url: req.url,
      body: chunks.length > 0
        ? JSON.parse(Buffer.concat(chunks).toString("utf8"))
        : null
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });

    await client.getRunSettings();
    await client.setMainScene({ path: "res://scenes/main.tscn", save: true });
    await client.getRunStatus();
    await client.runMainScene({ saveBeforeRun: true });
    await client.runCurrentScene({ saveBeforeRun: false });
    await client.runCustomScene({ path: "res://scenes/test.tscn", saveBeforeRun: true });
    await client.stopRunningScene();
    await client.reloadRunningScene({ saveBeforeRun: true });

    assert.deepEqual(seen, [
      {
        method: "GET",
        url: "/run/settings",
        body: null
      },
      {
        method: "POST",
        url: "/run/main-scene/set",
        body: { path: "res://scenes/main.tscn", save: true }
      },
      {
        method: "GET",
        url: "/run/status",
        body: null
      },
      {
        method: "POST",
        url: "/run/main",
        body: { saveBeforeRun: true }
      },
      {
        method: "POST",
        url: "/run/current",
        body: { saveBeforeRun: false }
      },
      {
        method: "POST",
        url: "/run/custom",
        body: { path: "res://scenes/test.tscn", saveBeforeRun: true }
      },
      {
        method: "POST",
        url: "/run/stop",
        body: {}
      },
      {
        method: "POST",
        url: "/run/reload",
        body: { saveBeforeRun: true }
      }
    ]);
  });
});

test("GodotBridgeClient reads export presets", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");

    if (req.url === "/export/presets") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          exists: true,
          presets: [
            { index: 0, name: "Linux", platform: "Linux" }
          ]
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.listExportPresets();

    assert.equal(response.ok, true);
    assert.equal(response.data.presets[0].name, "Linux");
    assert.deepEqual(seenUrls, ["/export/presets"]);
  });
});

test("GodotBridgeClient forwards export preset upserts", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/export/preset/upsert" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://export_presets.cfg",
          preset: {
            index: 0,
            name: "Linux",
            platform: "Linux",
            exportPath: "build/game.x86_64"
          }
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const result = await client.upsertExportPreset({
      name: "Linux",
      platform: "Linux",
      exportPath: "build/game.x86_64",
      runnable: true,
      options: {
        "binary_format/embed_pck": false
      }
    });

    assert.equal(result.data.preset.name, "Linux");
    assert.deepEqual(receivedBody, {
      name: "Linux",
      platform: "Linux",
      exportPath: "build/game.x86_64",
      runnable: true,
      options: {
        "binary_format/embed_pck": false
      }
    });
  });
});

test("GodotBridgeClient reads debugger state", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");

    if (req.url === "/debugger/state") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          sessions: [],
          breakpoints: [],
          monitors: {
            timeFps: 60
          }
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.getDebuggerState();

    assert.equal(response.ok, true);
    assert.deepEqual(response.data.sessions, []);
    assert.deepEqual(seenUrls, ["/debugger/state"]);
  });
});

test("GodotBridgeClient forwards debugger breakpoint mutations", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/debugger/breakpoint/set" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          requestedBreakpoint: {
            path: "res://player.gd",
            line: 12,
            enabled: true,
            appliedSessions: [0]
          }
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.setDebuggerBreakpoint({
      path: "res://player.gd",
      line: 12,
      enabled: true
    });

    assert.equal(response.ok, true);
    assert.deepEqual(receivedBody, {
      path: "res://player.gd",
      line: 12,
      enabled: true
    });
  });
});

test("GodotBridgeClient forwards debugger profiler toggle requests", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/debugger/profiler/toggle" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          requestedProfiler: {
            profiler: "scripts",
            enabled: true,
            data: [{ maxFunctions: 64 }],
            appliedSessions: [0]
          }
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.toggleDebuggerProfiler({
      profiler: "scripts",
      enabled: true,
      data: [{ maxFunctions: 64 }]
    });

    assert.equal(response.ok, true);
    assert.deepEqual(response.data.requestedProfiler.appliedSessions, [0]);
    assert.deepEqual(receivedBody, {
      profiler: "scripts",
      enabled: true,
      data: [{ maxFunctions: 64 }]
    });
  });
});

test("GodotBridgeClient forwards debugger message send requests", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/debugger/message/send" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          requestedMessage: {
            message: "niua_mcp:snapshot",
            data: [{ requestId: "snapshot:1" }],
            activeOnly: true,
            requestedSessions: [0]
          }
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.sendDebuggerMessage({
      message: "niua_mcp:snapshot",
      data: [{ requestId: "snapshot:1" }],
      activeOnly: true
    });

    assert.equal(response.ok, true);
    assert.deepEqual(response.data.requestedMessage.requestedSessions, [0]);
    assert.deepEqual(receivedBody, {
      message: "niua_mcp:snapshot",
      data: [{ requestId: "snapshot:1" }],
      activeOnly: true
    });
  });
});

test("GodotBridgeClient forwards runtime probe install requests", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/runtime/probe/install" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          autoloadName: "NiuaMcpRuntimeProbe",
          path: "res://addons/niua_mcp/niua_mcp_runtime_probe.gd",
          enabled: true,
          saved: true
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.installRuntimeProbe({ save: true });

    assert.equal(response.ok, true);
    assert.deepEqual(receivedBody, { save: true });
    assert.equal(response.data.enabled, true);
  });
});

test("GodotBridgeClient reads runtime state captured by the debugger probe", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");

    if (req.url === "/runtime/state") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          sessionCount: 1,
          sessions: [
            {
              id: 0,
              hasRuntimeState: true,
              lastRuntimeMessage: {
                kind: "runtime_state",
                timeMsec: 1234
              },
              runtimeState: {
                kind: "snapshot",
                currentScene: "res://scenes/main.tscn",
                root: {
                  name: "root",
                  type: "Window"
                }
              }
            }
          ],
          events: []
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.getRuntimeState();

    assert.equal(response.ok, true);
    assert.equal(response.data.available, true);
    assert.equal(response.data.sessions[0].runtimeState.currentScene, "res://scenes/main.tscn");
    assert.deepEqual(seenUrls, ["/runtime/state"]);
  });
});

test("GodotBridgeClient reads filtered runtime events", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");

    if (req.url === "/runtime/events?limit=25&kinds=session_started%2Cruntime_state&sinceMsec=1000") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          eventCount: 1,
          totalMatched: 1,
          limit: 25,
          kinds: ["session_started", "runtime_state"],
          sinceMsec: 1000,
          events: [
            {
              kind: "runtime_state",
              sessionId: 0,
              timeMsec: 1234,
              currentScene: "res://scenes/main.tscn"
            }
          ]
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.getRuntimeEvents({
      limit: 25,
      kinds: ["session_started", "runtime_state"],
      sinceMsec: 1000
    });

    assert.equal(response.ok, true);
    assert.equal(response.data.eventCount, 1);
    assert.equal(response.data.events[0].kind, "runtime_state");
    assert.deepEqual(seenUrls, ["/runtime/events?limit=25&kinds=session_started%2Cruntime_state&sinceMsec=1000"]);
  });
});

test("GodotBridgeClient polls runtime node properties captured by the debugger probe", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");

    if (req.url === "/runtime/node/properties?nodePath=%2Froot%2FRuntimeSmoke&refresh=true") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          nodePath: "/root/RuntimeSmoke",
          requestId: "node_properties:1",
          pending: true,
          responses: []
        }
      }));
      return;
    }

    if (req.url === "/runtime/node/properties?nodePath=%2Froot%2FRuntimeSmoke&refresh=false&requestId=node_properties%3A1") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          nodePath: "/root/RuntimeSmoke",
          requestId: "node_properties:1",
          pending: false,
          responses: [
            {
              sessionId: 0,
              exists: true,
              type: "Node",
              properties: [
                {
                  name: "name",
                  type: "String",
                  value: "RuntimeSmoke"
                }
              ]
            }
          ]
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.getRuntimeNodeProperties({
      nodePath: "/root/RuntimeSmoke",
      timeoutMsec: 1000,
      pollIntervalMsec: 1
    });

    assert.equal(response.ok, true);
    assert.equal(response.data.pending, false);
    assert.equal(response.data.responses[0].exists, true);
    assert.equal(response.data.responses[0].properties[0].value, "RuntimeSmoke");
    assert.deepEqual(seenUrls, [
      "/runtime/node/properties?nodePath=%2Froot%2FRuntimeSmoke&refresh=true",
      "/runtime/node/properties?nodePath=%2Froot%2FRuntimeSmoke&refresh=false&requestId=node_properties%3A1"
    ]);
  });
});

test("GodotBridgeClient polls runtime node property mutations captured by the debugger probe", async () => {
  const seenRequests = [];

  await withBridgeServer(async (req, res) => {
    seenRequests.push({ method: req.method, url: req.url });
    res.setHeader("content-type", "application/json");

    if (req.url === "/runtime/node/property/set" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      assert.deepEqual(body, {
        nodePath: "/root/RuntimeSmoke",
        property: "name",
        value: "RuntimeSmokeRenamed"
      });
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          requestId: "set_node_property:1",
          pending: true,
          responses: []
        }
      }));
      return;
    }

    if (req.url === "/runtime/node/property/set/result?requestId=set_node_property%3A1" && req.method === "GET") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          requestId: "set_node_property:1",
          pending: false,
          responses: [
            {
              sessionId: 0,
              nodePath: "/root/RuntimeSmoke",
              property: "name",
              exists: true,
              set: true,
              value: "RuntimeSmokeRenamed"
            }
          ]
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.setRuntimeNodeProperty({
      nodePath: "/root/RuntimeSmoke",
      property: "name",
      value: "RuntimeSmokeRenamed",
      timeoutMsec: 1000,
      pollIntervalMsec: 1
    });

    assert.equal(response.ok, true);
    assert.equal(response.data.pending, false);
    assert.equal(response.data.responses[0].set, true);
    assert.equal(response.data.responses[0].value, "RuntimeSmokeRenamed");
    assert.deepEqual(seenRequests, [
      { method: "POST", url: "/runtime/node/property/set" },
      { method: "GET", url: "/runtime/node/property/set/result?requestId=set_node_property%3A1" }
    ]);
  });
});

test("GodotBridgeClient polls runtime screenshots captured by the debugger probe", async () => {
  const seenRequests = [];

  await withBridgeServer(async (req, res) => {
    seenRequests.push({ method: req.method, url: req.url });
    res.setHeader("content-type", "application/json");

    if (req.url === "/runtime/screenshot" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      assert.deepEqual(body, {});
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          requestId: "runtime_screenshot:1",
          pending: true,
          responses: []
        }
      }));
      return;
    }

    if (req.url === "/runtime/screenshot/result?requestId=runtime_screenshot%3A1" && req.method === "GET") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          requestId: "runtime_screenshot:1",
          pending: false,
          responses: [
            {
              sessionId: 0,
              available: true,
              width: 64,
              height: 64,
              mimeType: "image/png",
              encoding: "base64",
              data: "iVBORw0KGgo="
            }
          ]
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.captureRuntimeScreenshot({
      timeoutMsec: 1000,
      pollIntervalMsec: 1
    });

    assert.equal(response.ok, true);
    assert.equal(response.data.pending, false);
    assert.equal(response.data.responses[0].mimeType, "image/png");
    assert.deepEqual(seenRequests, [
      { method: "POST", url: "/runtime/screenshot" },
      { method: "GET", url: "/runtime/screenshot/result?requestId=runtime_screenshot%3A1" }
    ]);
  });
});

test("GodotBridgeClient captures editor screenshots", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");

    if (req.url === "/editor/screenshot") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          width: 128,
          height: 72,
          mimeType: "image/png",
          encoding: "base64",
          data: "iVBORw0KGgo="
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.captureEditorScreenshot();

    assert.equal(response.ok, true);
    assert.equal(response.data.mimeType, "image/png");
    assert.deepEqual(seenUrls, ["/editor/screenshot"]);
  });
});

test("GodotBridgeClient captures viewport screenshots", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");

    if (req.url === "/viewport/screenshot?viewport=3d&index=1") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          viewport: "3d",
          index: 1,
          width: 64,
          height: 64,
          mimeType: "image/png",
          encoding: "base64",
          data: "iVBORw0KGgo="
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.captureViewportScreenshot({ viewport: "3d", index: 1 });

    assert.equal(response.ok, true);
    assert.equal(response.data.viewport, "3d");
    assert.deepEqual(seenUrls, ["/viewport/screenshot?viewport=3d&index=1"]);
  });
});

test("GodotBridgeClient reads viewport state", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");

    if (req.url === "/viewport/state?viewport=3d&index=2") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          viewport: "3d",
          index: 2,
          available: true,
          size: { type: "Vector2", x: 1280, y: 720 },
          camera3D: { available: false }
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.getViewportState({ viewport: "3d", index: 2 });

    assert.equal(response.ok, true);
    assert.equal(response.data.viewport, "3d");
    assert.deepEqual(seenUrls, ["/viewport/state?viewport=3d&index=2"]);
  });
});

test("GodotBridgeClient forwards viewport camera updates", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        viewport: "3d",
        index: 1,
        available: true,
        camera3D: {
          available: true,
          position: { type: "Vector3", x: 1, y: 2, z: 3 }
        }
      }
    }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.setViewportCamera({
      viewport: "3d",
      index: 1,
      position: { type: "Vector3", x: 1, y: 2, z: 3 },
      rotationDegrees: { type: "Vector3", x: -30, y: 45, z: 0 },
      fov: 55
    });

    assert.equal(response.ok, true);
    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/viewport/camera/set",
        body: {
          viewport: "3d",
          index: 1,
          position: { type: "Vector3", x: 1, y: 2, z: 3 },
          rotationDegrees: { type: "Vector3", x: -30, y: 45, z: 0 },
          fov: 55
        }
      }
    ]);
  });
});

test("GodotBridgeClient forwards viewport input events", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        viewport: "2d",
        index: 0,
        local: true,
        eventsSent: 1
      }
    }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.sendViewportInput({
      viewport: "2d",
      index: 0,
      local: true,
      events: [
        {
          type: "mouse_motion",
          position: { type: "Vector2", x: 12, y: 34 },
          globalPosition: { type: "Vector2", x: 12, y: 34 }
        }
      ]
    });

    assert.equal(response.ok, true);
    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/viewport/input/send",
        body: {
          viewport: "2d",
          index: 0,
          local: true,
          events: [
            {
              type: "mouse_motion",
              position: { type: "Vector2", x: 12, y: 34 },
              globalPosition: { type: "Vector2", x: 12, y: 34 }
            }
          ]
        }
      }
    ]);
  });
});

test("GodotBridgeClient forwards editor main-screen switches", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        screen: "3D",
        mainScreen: { available: true, name: "3D" }
      }
    }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.setEditorMainScreen({ screen: "3D" });

    assert.equal(response.ok, true);
    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/editor/main-screen/set",
        body: { screen: "3D" }
      }
    ]);
  });
});

test("GodotBridgeClient forwards allowlisted editor actions", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        action: "filesystem_update_file",
        invoked: true,
        params: { path: "res://scenes/main.tscn" }
      }
    }));
  }, async (port) => {
    const client = new GodotBridgeClient({ port });
    const response = await client.invokeEditorAction({
      action: "filesystem_update_file",
      params: { path: "res://scenes/main.tscn" }
    });

    assert.equal(response.ok, true);
    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/editor/action/invoke",
        body: {
          action: "filesystem_update_file",
          params: { path: "res://scenes/main.tscn" }
        }
      }
    ]);
  });
});
