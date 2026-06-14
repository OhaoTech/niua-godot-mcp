import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

import { toolDefinitionsFromManifest } from "../../../../src/godot-mcp/manifest/index.js";
import {
  SCENE_STATE_TOOL_DEFINITIONS,
  SCENE_TAB_TOOL_DEFINITIONS,
  SCENE_TOOL_DEFINITIONS
} from "../../../../src/godot-mcp/tools/scene/index.js";
import {
  SCENE_STATE_TOOL_MANIFEST,
  SCENE_TAB_TOOL_MANIFEST,
  SCENE_TOOL_MANIFEST
} from "../../../../src/godot-mcp/tools/scene/manifest.js";

async function withJsonBridge(handler, run) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  try {
    return await run(port);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

function toolByName(name) {
  return SCENE_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

async function readSceneSource(file) {
  return readFile(new URL(`../../../../src/godot-mcp/tools/scene/${file}`, import.meta.url), "utf8");
}

test("scene tool groups preserve descriptor order", () => {
  const generatedDefinitions = toolDefinitionsFromManifest(SCENE_TOOL_MANIFEST);

  assert.deepEqual(SCENE_STATE_TOOL_DEFINITIONS.map((tool) => tool.name), [
    "get_editor_state",
    "get_project_info",
    "get_scene_tree",
    "get_open_scene_tabs",
    "get_selection",
    "set_selection",
    "focus_node"
  ]);
  assert.deepEqual(SCENE_TAB_TOOL_DEFINITIONS.map((tool) => tool.name), [
    "open_scene",
    "create_scene",
    "save_scene_as",
    "switch_scene_tab",
    "close_scene",
    "mark_scene_unsaved",
    "undo_editor_action",
    "redo_editor_action"
  ]);
  assert.deepEqual(SCENE_STATE_TOOL_DEFINITIONS.map(({ name }) => name), SCENE_STATE_TOOL_MANIFEST.map(({ name }) => name));
  assert.deepEqual(SCENE_TAB_TOOL_DEFINITIONS.map(({ name }) => name), SCENE_TAB_TOOL_MANIFEST.map(({ name }) => name));
  assert.deepEqual(
    SCENE_TOOL_DEFINITIONS.map(({ handler, ...definition }) => definition),
    generatedDefinitions.map(({ handler, ...definition }) => definition)
  );
});

test("scene tool implementation is generated from the manifest", async () => {
  const index = await readSceneSource("index.js");
  const schemas = await readSceneSource("tabs/schemas.js");

  assert.match(index, /toolDefinitionsFromManifest\(SCENE_TOOL_MANIFEST\)/);
  assert.match(index, /SCENE_STATE_TOOL_MANIFEST/);
  assert.match(index, /SCENE_TAB_TOOL_MANIFEST/);
  assert.doesNotMatch(index, /async handler/);

  assert.match(schemas, /export const SCENE_PATH_SCHEMA/);
  assert.match(schemas, /export const CREATE_SCENE_SCHEMA/);
  assert.match(schemas, /export const EDITOR_UNDO_REDO_SCHEMA/);
  assert.match(schemas, /CONNECTION_PROPERTIES/);
});

test("scene selection tools forward payloads through the bridge", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
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
    const setResult = await toolByName("set_selection").handler({
      port,
      nodePaths: ["Player", "Player/Camera"]
    });
    const focusResult = await toolByName("focus_node").handler({
      port,
      nodePath: "Player/Camera"
    });

    assert.equal(parseToolText(setResult).data.endpoint, "/selection/set");
    assert.equal(parseToolText(focusResult).data.endpoint, "/selection/focus/node");
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
      }
    ]);
  });
});

test("scene creation and tab tools forward payloads through the bridge", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
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
    await toolByName("create_scene").handler({
      port,
      path: "res://scenes/generated.tscn",
      rootType: "Node3D"
    });
    await toolByName("switch_scene_tab").handler({
      port,
      path: "res://scenes/generated.tscn"
    });
    await toolByName("save_current_scene").handler({ port });

    assert.deepEqual(received, [
      {
        method: "POST",
        url: "/scene/create",
        body: {
          path: "res://scenes/generated.tscn",
          rootType: "Node3D"
        }
      },
      {
        method: "POST",
        url: "/scene/switch",
        body: { path: "res://scenes/generated.tscn" }
      },
      {
        method: "POST",
        url: "/scene/save",
        body: {}
      }
    ]);
  });
});
