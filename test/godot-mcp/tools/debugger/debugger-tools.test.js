import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { DEBUGGER_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/debugger/index.js";
import {
  DEBUGGER_CONTROL_TOOL_MANIFEST,
  DEBUGGER_RUNTIME_TOOL_MANIFEST,
  DEBUGGER_TOOL_MANIFEST
} from "../../../../src/godot-mcp/tools/debugger/manifest.js";

const debuggerToolsRoot = path.resolve(import.meta.dirname, "../../../../src/godot-mcp/tools/debugger");

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
  return DEBUGGER_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

async function readDebuggerSource(file) {
  return readFile(path.join(debuggerToolsRoot, file), "utf8");
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

test("DEBUGGER_TOOL_DEFINITIONS exposes debugger and runtime tool descriptors", () => {
  assert.deepEqual(
    DEBUGGER_TOOL_DEFINITIONS.map((tool) => tool.name),
    DEBUGGER_TOOL_MANIFEST.map((entry) => entry.name)
  );
  assert.deepEqual(
    DEBUGGER_TOOL_MANIFEST.map((entry) => entry.name),
    [
      ...DEBUGGER_CONTROL_TOOL_MANIFEST.map((entry) => entry.name),
      ...DEBUGGER_RUNTIME_TOOL_MANIFEST.map((entry) => entry.name)
    ]
  );
  assert.ok(DEBUGGER_TOOL_DEFINITIONS.every((tool) => tool.inputSchema?.type === "object"));
});

test("debugger runtime tools are generated from the manifest", async () => {
  const index = await readDebuggerSource("index.js");
  const manifest = await readDebuggerSource("manifest.js");

  assert.match(index, /toolDefinitionsFromManifest\(DEBUGGER_CONTROL_TOOL_MANIFEST\)/);
  assert.match(index, /toolDefinitionsFromManifest\(DEBUGGER_RUNTIME_TOOL_MANIFEST, \{/);
  assert.match(index, /captureRuntimeScreenshot/);
  assert.match(index, /getRuntimeNodeProperties/);
  assert.match(index, /DEBUGGER_CONTROL_TOOL_DEFINITIONS\.concat\(DEBUGGER_RUNTIME_TOOL_DEFINITIONS\)/);
  assert.doesNotMatch(index, /DEBUGGER_TOOL_DEFINITIONS = \[/);
  assert.doesNotMatch(index, /toolResult/);
  assert.doesNotMatch(index, /splitBridgeArgs/);

  assert.match(manifest, /export const DEBUGGER_RUNTIME_TOOL_MANIFEST/);
  assert.match(manifest, /export const DEBUGGER_TOOL_MANIFEST/);
  assert.match(manifest, /name: "install_runtime_probe"/);
  assert.match(manifest, /name: "capture_runtime_screenshot"/);
  assert.match(manifest, /generate: false/);
});

test("debugger schemas delegate control probe and runtime modules", async () => {
  const schemas = await readDebuggerSource("schemas.js");
  const control = await readDebuggerSource("schemas/control.js");
  const probe = await readDebuggerSource("schemas/probe.js");
  const runtime = await readDebuggerSource("schemas/runtime.js");

  assert.match(schemas, /from "\.\/schemas\/control\.js"/);
  assert.match(schemas, /from "\.\/schemas\/probe\.js"/);
  assert.match(schemas, /from "\.\/schemas\/runtime\.js"/);
  assert.doesNotMatch(schemas, /CONNECTION_PROPERTIES/);
  assert.doesNotMatch(schemas, /path: \{/);
  assert.doesNotMatch(schemas, /nodePath: \{/);

  assert.match(control, /export const DEBUGGER_BREAKPOINT_SCHEMA/);
  assert.match(control, /export const DEBUGGER_PROFILER_SCHEMA/);
  assert.match(control, /export const DEBUGGER_MESSAGE_SCHEMA/);
  assert.match(control, /CONNECTION_PROPERTIES/);
  assert.match(control, /path: \{/);
  assert.match(control, /profiler: \{/);
  assert.match(control, /message: \{/);

  assert.match(probe, /export const INSTALL_RUNTIME_PROBE_SCHEMA/);
  assert.match(probe, /save: \{/);

  assert.match(runtime, /export const RUNTIME_EVENTS_SCHEMA/);
  assert.match(runtime, /export const RUNTIME_NODE_PROPERTIES_SCHEMA/);
  assert.match(runtime, /export const SET_RUNTIME_NODE_PROPERTY_SCHEMA/);
  assert.match(runtime, /export const RUNTIME_SCREENSHOT_SCHEMA/);
  assert.match(runtime, /export const SEND_RUNTIME_INPUT_SCHEMA/);
  assert.match(runtime, /nodePath: \{/);
  assert.match(runtime, /timeoutMsec: \{/);
});

test("set_debugger_breakpoint handler forwards payload through the bridge", async () => {
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
    const result = await toolByName("set_debugger_breakpoint").handler({
      port,
      path: "res://scripts/player.gd",
      line: 12,
      enabled: false
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.endpoint, "/debugger/breakpoint/set");
    assert.deepEqual(receivedBody, {
      path: "res://scripts/player.gd",
      line: 12,
      enabled: false
    });
  });
});

test("get_runtime_events handler forwards filters through the bridge", async () => {
  let seenUrl = null;

  await withJsonBridge((req, res) => {
    seenUrl = req.url;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: { events: [{ kind: "runtime_state" }] }
    }));
  }, async (port) => {
    const result = await toolByName("get_runtime_events").handler({
      port,
      limit: 7,
      kinds: ["session_started", "runtime_state"],
      sinceMsec: 42
    });
    const payload = parseToolText(result);

    assert.equal(seenUrl, "/runtime/events?limit=7&kinds=session_started%2Cruntime_state&sinceMsec=42");
    assert.equal(payload.data.events[0].kind, "runtime_state");
  });
});

test("send_runtime_input schema declares explicit typed action, hold, and mouse-motion params", () => {
  const schema = toolByName("send_runtime_input").inputSchema;

  assert.equal(schema.type, "object");
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.actions.type, "array");
  assert.equal(schema.properties.actions.items.type, "object");
  assert.equal(schema.properties.actions.items.properties.action.type, "string");
  assert.equal(schema.properties.actions.items.properties.pressed.type, "boolean");
  assert.equal(schema.properties.actions.items.properties.strength.type, "number");
  assert.deepEqual(schema.properties.actions.items.required, ["action", "pressed"]);
  assert.equal(schema.properties.holdMs.type, "number");
  assert.equal(schema.properties.mouseMotion.type, "object");
  assert.equal(schema.properties.mouseMotion.properties.dx.type, "number");
  assert.equal(schema.properties.mouseMotion.properties.dy.type, "number");
  assert.deepEqual(schema.properties.mouseMotion.required, ["dx", "dy"]);
});

test("send_runtime_input handler forwards actions and mouse motion through the bridge", async () => {
  let receivedBody = null;
  const seenUrls = [];

  await withJsonBridge(async (req, res) => {
    seenUrls.push(req.url);
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        pending: false,
        available: true,
        requestId: "send_input:1",
        responses: [
          {
            ok: true,
            applied: {
              actions: [{ action: "jump", pressed: true, strength: 1 }],
              mouseMotion: { dx: 5, dy: -3 },
              heldMs: null
            }
          }
        ]
      }
    }));
  }, async (port) => {
    const result = await toolByName("send_runtime_input").handler({
      port,
      actions: [{ action: "jump", pressed: true }],
      mouseMotion: { dx: 5, dy: -3 },
      timeoutMsec: 10,
      pollIntervalMsec: 1
    });
    const payload = parseToolText(result);

    assert.equal(seenUrls[0], "/runtime/input/send");
    assert.deepEqual(receivedBody, {
      actions: [{ action: "jump", pressed: true }],
      mouseMotion: { dx: 5, dy: -3 }
    });
    assert.equal(payload.data.responses[0].applied.mouseMotion.dx, 5);
    assert.equal(payload.data.responses[0].applied.heldMs, null);
  });
});

test("capture_runtime_screenshot handler requests a runtime screenshot", async () => {
  let seenUrl = null;
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    seenUrl = req.url;
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        pending: false,
        available: true,
        mimeType: "image/png"
      }
    }));
  }, async (port) => {
    const result = await toolByName("capture_runtime_screenshot").handler({
      port,
      timeoutMsec: 10,
      pollIntervalMsec: 1
    });
    const payload = parseToolText(result);

    assert.equal(seenUrl, "/runtime/screenshot");
    assert.deepEqual(receivedBody, {});
    assert.equal(payload.data.available, true);
  });
});
