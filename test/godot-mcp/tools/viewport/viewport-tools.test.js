import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

import { VIEWPORT_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/viewport/index.js";
import { VIEWPORT_TOOL_MANIFEST } from "../../../../src/godot-mcp/tools/viewport/manifest.js";

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
  return VIEWPORT_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

async function readSource(relativePath) {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../");
  return readFile(resolve(root, relativePath), "utf8");
}

test("VIEWPORT_TOOL_DEFINITIONS exposes viewport tool descriptors", () => {
  assert.deepEqual(VIEWPORT_TOOL_DEFINITIONS.map((tool) => tool.name), [
    "capture_editor_screenshot",
    "capture_viewport_screenshot",
    "get_viewport_state",
    "set_viewport_camera",
    "send_viewport_input",
    "set_editor_main_screen",
    "invoke_editor_action"
  ]);
  assert.deepEqual(
    VIEWPORT_TOOL_DEFINITIONS.map((tool) => tool.name),
    VIEWPORT_TOOL_MANIFEST.map((entry) => entry.name)
  );
  assert.ok(VIEWPORT_TOOL_DEFINITIONS.every((tool) => tool.inputSchema?.type === "object"));
});

test("viewport tools are generated from the manifest plus focused adapters", async () => {
  const index = await readSource("src/godot-mcp/tools/viewport/index.js");
  const input = await readSource("src/godot-mcp/tools/viewport/input.js");
  const manifest = await readSource("src/godot-mcp/tools/viewport/manifest.js");

  assert.match(index, /toolDefinitionsFromManifest\(VIEWPORT_TOOL_MANIFEST/);
  assert.match(index, /sendViewportInput/);
  assert.doesNotMatch(index, /VIEWPORT_TOOL_DEFINITIONS = \[/);
  assert.doesNotMatch(index, /createBridgeClient/);
  assert.doesNotMatch(input, /VIEWPORT_INPUT_TOOL_DEFINITIONS/);
  assert.match(input, /export async function sendViewportInput/);
  assert.match(manifest, /export const VIEWPORT_TOOL_MANIFEST = \[/);
  assert.match(manifest, /adapter: \{\s*handler: "sendViewportInput"/);
});

test("viewport schemas delegate shared screenshot camera input and editor domains", async () => {
  const facade = await readSource("src/godot-mcp/tools/viewport/schemas.js");
  const shared = await readSource("src/godot-mcp/tools/viewport/schemas/shared.js");
  const screenshot = await readSource("src/godot-mcp/tools/viewport/schemas/screenshot.js");
  const camera = await readSource("src/godot-mcp/tools/viewport/schemas/camera.js");
  const input = await readSource("src/godot-mcp/tools/viewport/schemas/input.js");
  const editor = await readSource("src/godot-mcp/tools/viewport/schemas/editor.js");

  assert.match(facade, /from "\.\/schemas\/shared\.js"/);
  assert.match(facade, /from "\.\/schemas\/screenshot\.js"/);
  assert.match(facade, /from "\.\/schemas\/camera\.js"/);
  assert.match(facade, /from "\.\/schemas\/input\.js"/);
  assert.match(facade, /from "\.\/schemas\/editor\.js"/);
  assert.doesNotMatch(facade, /CONNECTION_PROPERTIES/);
  assert.doesNotMatch(facade, /export const VIEWPORT_SCREENSHOT_SCHEMA =/);
  assert.doesNotMatch(facade, /export const VIEWPORT_CAMERA_SCHEMA =/);
  assert.doesNotMatch(facade, /export const VIEWPORT_INPUT_SCHEMA =/);

  assert.match(shared, /export const VIEWPORT_TARGET_PROPERTIES/);
  assert.match(shared, /viewport/);
  assert.match(shared, /index/);

  assert.match(screenshot, /export const VIEWPORT_SCREENSHOT_SCHEMA/);
  assert.match(screenshot, /VIEWPORT_TARGET_PROPERTIES/);
  assert.match(screenshot, /CONNECTION_PROPERTIES/);

  assert.match(camera, /export const VIEWPORT_CAMERA_SCHEMA/);
  assert.match(camera, /VIEWPORT_TARGET_PROPERTIES/);
  assert.match(camera, /rotationDegrees/);
  assert.match(camera, /fov/);
  assert.match(camera, /near/);
  assert.match(camera, /far/);

  assert.match(input, /export const VIEWPORT_INPUT_SCHEMA/);
  assert.match(input, /events/);
  assert.match(input, /notifyMouseEntered/);
  assert.match(input, /updateMouseCursorState/);

  assert.match(editor, /export const EDITOR_MAIN_SCREEN_SCHEMA/);
  assert.match(editor, /export const INVOKE_EDITOR_ACTION_SCHEMA/);
  assert.match(editor, /save_scene/);
  assert.match(editor, /set_movie_maker_enabled/);
});

test("viewport input normalization delegates focused modules", async () => {
  const facade = await readSource("src/godot-mcp/tools/viewport/input.js");
  const events = await readSource("src/godot-mcp/tools/viewport/input/events.js");
  const mouse = await readSource("src/godot-mcp/tools/viewport/input/mouse.js");
  const fields = await readSource("src/godot-mcp/tools/viewport/input/fields.js");
  const vectors = await readSource("src/godot-mcp/tools/viewport/input/vectors.js");

  assert.match(facade, /from "\.\/input\/events\.js"/);
  assert.match(facade, /from "\.\/input\/fields\.js"/);
  assert.doesNotMatch(facade, /function normalizeMouseButton/);
  assert.doesNotMatch(facade, /const EVENT_TYPE_ALIASES/);

  assert.match(events, /EVENT_TYPE_ALIASES/);
  assert.match(events, /normalizeMouseClick/);
  assert.match(events, /normalizeMouseDrag/);
  assert.match(mouse, /from "\.\/mouse\/buttons\.js"/);
  assert.match(mouse, /from "\.\/mouse\/motion\.js"/);
  assert.match(mouse, /from "\.\/mouse\/gestures\.js"/);
  assert.doesNotMatch(mouse, /function buttonMaskForButtonIndex/);
  assert.doesNotMatch(mouse, /applyCommonMouseFields/);
  assert.doesNotMatch(mouse, /normalizePosition/);
  assert.match(fields, /export function normalizeViewportName/);
  assert.match(fields, /export function applyCommonMouseFields/);
  assert.match(vectors, /export function cloneVector2/);
});

test("viewport mouse input delegates button motion and gesture domains", async () => {
  const mouse = await readSource("src/godot-mcp/tools/viewport/input/mouse.js");
  const mouseButtons = await readSource("src/godot-mcp/tools/viewport/input/mouse/buttons.js");
  const mouseMotion = await readSource("src/godot-mcp/tools/viewport/input/mouse/motion.js");
  const mouseGestures = await readSource("src/godot-mcp/tools/viewport/input/mouse/gestures.js");

  assert.match(mouse, /from "\.\/mouse\/buttons\.js"/);
  assert.match(mouse, /from "\.\/mouse\/motion\.js"/);
  assert.match(mouse, /from "\.\/mouse\/gestures\.js"/);
  assert.doesNotMatch(mouse, /buttonMaskForButtonIndex/);
  assert.doesNotMatch(mouse, /normalizePosition/);
  assert.doesNotMatch(mouse, /applyCommonMouseFields/);
  assert.doesNotMatch(mouse, /relative/);

  assert.match(mouseButtons, /export const DEFAULT_MOUSE_BUTTON/);
  assert.match(mouseButtons, /export function buttonMaskForButtonIndex/);
  assert.match(mouseButtons, /export function normalizeMouseButton/);
  assert.match(mouseButtons, /type: "mouse_button"/);
  assert.match(mouseButtons, /buttonMask/);
  assert.match(mouseButtons, /doubleClick/);
  assert.match(mouseButtons, /factor/);

  assert.match(mouseMotion, /export function normalizeMouseMotion/);
  assert.match(mouseMotion, /type: "mouse_motion"/);
  assert.match(mouseMotion, /globalPosition/);
  assert.match(mouseMotion, /relative/);
  assert.match(mouseMotion, /applyCommonMouseFields/);

  assert.match(mouseGestures, /export function normalizeMouseClick/);
  assert.match(mouseGestures, /export function normalizeMouseDrag/);
  assert.match(mouseGestures, /from "\.\/buttons\.js"/);
  assert.match(mouseGestures, /from "\.\/motion\.js"/);
  assert.match(mouseGestures, /MOUSE_DRAG_TYPE = "mouse_drag"/);
  assert.match(mouseGestures, /from/);
  assert.match(mouseGestures, /to/);
  assert.match(mouseGestures, /x: to\.x - from\.x/);
  assert.match(mouseGestures, /y: to\.y - from\.y/);
});

test("capture_viewport_screenshot handler forwards query args through the bridge", async () => {
  let seenUrl = null;

  await withJsonBridge((req, res) => {
    seenUrl = req.url;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const result = await toolByName("capture_viewport_screenshot").handler({
      port,
      viewport: "2d",
      index: 3
    });
    const payload = parseToolText(result);

    assert.equal(seenUrl, "/viewport/screenshot?viewport=2d&index=3");
    assert.equal(payload.data.endpoint, seenUrl);
  });
});

test("set_viewport_camera handler forwards payload through the bridge", async () => {
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const position = { type: "Vector3", x: 1, y: 2, z: 3 };
    const result = await toolByName("set_viewport_camera").handler({
      port,
      viewport: "3d",
      index: 1,
      position,
      fov: 60
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.endpoint, "/viewport/camera/set");
    assert.deepEqual(receivedBody, {
      viewport: "3d",
      index: 1,
      position,
      fov: 60
    });
  });
});

test("send_viewport_input expands click and drag pointer events", async () => {
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        endpoint: req.url,
        eventsSent: receivedBody.events.length
      }
    }));
  }, async (port) => {
    const result = await toolByName("send_viewport_input").handler({
      port,
      viewport: "2D",
      events: [
        { type: "mouse_click", position: [120, 80] },
        { type: "mouse_drag", from: [120, 80], to: [240, 160] }
      ]
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.endpoint, "/viewport/input/send");
    assert.equal(payload.data.eventsSent, 6);
    assert.deepEqual(receivedBody, {
      viewport: "2d",
      index: 0,
      local: true,
      notifyMouseEntered: true,
      updateMouseCursorState: true,
      events: [
        {
          type: "mouse_button",
          position: { type: "Vector2", x: 120, y: 80 },
          globalPosition: { type: "Vector2", x: 120, y: 80 },
          buttonIndex: 1,
          buttonMask: 1,
          pressed: true,
          doubleClick: false,
          factor: 1
        },
        {
          type: "mouse_button",
          position: { type: "Vector2", x: 120, y: 80 },
          globalPosition: { type: "Vector2", x: 120, y: 80 },
          buttonIndex: 1,
          buttonMask: 0,
          pressed: false,
          doubleClick: false,
          factor: 1
        },
        {
          type: "mouse_motion",
          position: { type: "Vector2", x: 120, y: 80 },
          globalPosition: { type: "Vector2", x: 120, y: 80 },
          relative: { type: "Vector2", x: 0, y: 0 },
          buttonMask: 0
        },
        {
          type: "mouse_button",
          position: { type: "Vector2", x: 120, y: 80 },
          globalPosition: { type: "Vector2", x: 120, y: 80 },
          buttonIndex: 1,
          buttonMask: 1,
          pressed: true,
          doubleClick: false,
          factor: 1
        },
        {
          type: "mouse_motion",
          position: { type: "Vector2", x: 240, y: 160 },
          globalPosition: { type: "Vector2", x: 240, y: 160 },
          relative: { type: "Vector2", x: 120, y: 80 },
          buttonMask: 1
        },
        {
          type: "mouse_button",
          position: { type: "Vector2", x: 240, y: 160 },
          globalPosition: { type: "Vector2", x: 240, y: 160 },
          buttonIndex: 1,
          buttonMask: 0,
          pressed: false,
          doubleClick: false,
          factor: 1
        }
      ]
    });
  });
});

test("invoke_editor_action handler forwards allowlisted action payloads", async () => {
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const result = await toolByName("invoke_editor_action").handler({
      port,
      action: "select_file",
      params: { path: "res://scripts/player.gd" }
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.endpoint, "/editor/action/invoke");
    assert.deepEqual(receivedBody, {
      action: "select_file",
      params: { path: "res://scripts/player.gd" }
    });
  });
});
