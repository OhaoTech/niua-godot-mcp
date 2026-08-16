import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { persistScreenshotResult } from "../../../../src/godot-mcp/tools/shared/screenshot-io.js";
import {
  captureRuntimeScreenshot,
  filterRuntimeNodeProperties,
  getRuntimeNodeProperties,
  getRuntimeState
} from "../../../../src/godot-mcp/tools/debugger/runtime-adapters.js";
import {
  captureEditorScreenshot,
  captureViewportScreenshot
} from "../../../../src/godot-mcp/tools/viewport/screenshots.js";

const PNG_BYTES = Buffer.from("89504e470d0a1a0a0000000d", "hex");
const PNG_BASE64 = PNG_BYTES.toString("base64");

function runtimeScreenshotResult() {
  return {
    ok: true,
    data: {
      available: true,
      requestId: "runtime_screenshot:1",
      pending: false,
      responses: [
        {
          available: true,
          width: 4,
          height: 4,
          mimeType: "image/png",
          encoding: "base64",
          data: PNG_BASE64
        }
      ]
    }
  };
}

function editorScreenshotResult() {
  return {
    ok: true,
    data: {
      available: true,
      width: 4,
      height: 4,
      mimeType: "image/png",
      encoding: "base64",
      data: PNG_BASE64
    }
  };
}

async function withTempDir(run) {
  const dir = await mkdtemp(path.join(tmpdir(), "niua-screenshot-io-"));
  try {
    return await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("persistScreenshotResult writes runtime responses to disk and strips base64", async () => {
  await withTempDir(async (dir) => {
    const savePath = path.join(dir, "nested", "shot.png");
    const result = await persistScreenshotResult(runtimeScreenshotResult(), savePath);

    assert.deepEqual(result.data.savedPaths, [savePath]);
    const response = result.data.responses[0];
    assert.equal(response.data, "");
    assert.equal(response.savedPath, savePath);
    assert.equal(response.savedBytes, PNG_BYTES.length);
    assert.deepEqual(await readFile(savePath), PNG_BYTES);
  });
});

test("persistScreenshotResult writes single-image payloads and suffixes extra responses", async () => {
  await withTempDir(async (dir) => {
    const single = path.join(dir, "editor.png");
    const singleResult = await persistScreenshotResult(editorScreenshotResult(), single);
    assert.equal(singleResult.data.data, "");
    assert.equal(singleResult.data.savedPath, single);
    assert.deepEqual(await readFile(single), PNG_BYTES);

    const multi = runtimeScreenshotResult();
    multi.data.responses.push({ ...multi.data.responses[0] });
    const multiPath = path.join(dir, "multi.png");
    const multiResult = await persistScreenshotResult(multi, multiPath);
    assert.deepEqual(multiResult.data.savedPaths, [
      multiPath,
      path.join(dir, "multi-2.png")
    ]);
  });
});

test("persistScreenshotResult leaves results alone without savePath or payloads", async () => {
  const untouched = runtimeScreenshotResult();
  assert.equal(await persistScreenshotResult(untouched, undefined), untouched);
  assert.equal(untouched.data.responses[0].data, PNG_BASE64);

  await withTempDir(async (dir) => {
    const unavailable = {
      ok: true,
      data: { available: false, pending: true, responses: [] }
    };
    const result = await persistScreenshotResult(unavailable, path.join(dir, "none.png"));
    assert.deepEqual(result.data.savedPaths, []);
  });
});

test("capture adapters strip savePath before calling the bridge client", async () => {
  await withTempDir(async (dir) => {
    const savePath = path.join(dir, "adapter.png");
    const seen = {};
    const client = {
      async captureRuntimeScreenshot(request) {
        seen.runtime = request;
        return runtimeScreenshotResult();
      },
      async captureEditorScreenshot() {
        return editorScreenshotResult();
      },
      async captureViewportScreenshot(request) {
        seen.viewport = request;
        return editorScreenshotResult();
      }
    };

    const runtime = await captureRuntimeScreenshot({
      client,
      payload: { savePath, timeoutMsec: 500 }
    });
    assert.deepEqual(seen.runtime, { timeoutMsec: 500 });
    assert.deepEqual(runtime.data.savedPaths, [savePath]);

    const editor = await captureEditorScreenshot({
      client,
      payload: { savePath: path.join(dir, "editor.png") }
    });
    assert.equal(editor.data.data, "");

    const viewport = await captureViewportScreenshot({
      client,
      payload: { savePath: path.join(dir, "viewport.png"), viewport: "2d", index: 0 }
    });
    assert.deepEqual(seen.viewport, { viewport: "2d", index: 0 });
    assert.equal(viewport.data.data, "");
  });
});

function nodePropertiesResult() {
  return {
    ok: true,
    data: {
      available: true,
      responses: [
        {
          nodePath: "/root/Main",
          propertyCount: 3,
          properties: [
            { name: "hp", type: "float", value: 42 },
            { name: "position", type: "Vector2", value: { x: 0, y: 0 } },
            { name: "score", type: "int", value: 7 }
          ]
        }
      ]
    }
  };
}

test("filterRuntimeNodeProperties keeps only requested property names", () => {
  const result = filterRuntimeNodeProperties(nodePropertiesResult(), ["hp", "score"]);
  const response = result.data.responses[0];
  assert.deepEqual(response.properties.map((p) => p.name), ["hp", "score"]);
  assert.equal(response.propertyCount, 2);
  assert.equal(response.totalPropertyCount, 3);
});

test("filterRuntimeNodeProperties passes results through without a filter", () => {
  const result = filterRuntimeNodeProperties(nodePropertiesResult(), []);
  assert.equal(result.data.responses[0].properties.length, 3);
  assert.equal(result.data.responses[0].totalPropertyCount, undefined);
});

test("getRuntimeNodeProperties adapter forwards the properties filter to the bridge request", async () => {
  let seen;
  const client = {
    async getRuntimeNodeProperties(request) {
      seen = request;
      return nodePropertiesResult();
    }
  };

  const result = await getRuntimeNodeProperties({
    client,
    payload: { nodePath: "/root/Main", properties: ["hp"], timeoutMsec: 250 }
  });
  assert.deepEqual(seen, { nodePath: "/root/Main", timeoutMsec: 250, properties: ["hp"], verbose: undefined });
  assert.deepEqual(result.data.responses[0].properties.map((p) => p.name), ["hp"]);
  assert.deepEqual(result.data.responses[0].properties[0], {
    name: "hp",
    type: "float",
    value: 42
  });
});

test("getRuntimeState defaults maxDepth to 2 and drops events", async () => {
  const seen = [];
  const client = {
    async getRuntimeState(request) {
      seen.push(request);
      return {
        ok: true,
        data: {
          available: true,
          requestId: "snapshot:1",
          pending: false,
          sessionCount: 1,
          sessions: [{
            lastRuntimeMessage: { kind: "runtime_state", timeMsec: 1 },
            runtimeState: {
              currentScene: "res://main.tscn",
              root: { name: "Main", path: "/root/Main", type: "Node", childCount: 4 }
            }
          }],
          events: [{ kind: "runtime_state" }]
        }
      };
    }
  };

  const omitted = await getRuntimeState({ client, payload: {} });
  const full = await getRuntimeState({ client, payload: { maxDepth: 0 } });
  assert.deepEqual(seen, [{ maxDepth: 2 }, { maxDepth: 0 }]);
  assert.equal(omitted.data.events, undefined);
  assert.equal(full.data.events, undefined);
  assert.equal(omitted.data.nodeCount, 1);
  assert.equal(omitted.data.sessions[0].lastRuntimeMessage, undefined);
  assert.equal(omitted.data.sessions[0].runtimeState.currentScene, "res://main.tscn");
});

test("getRuntimeState savePath keeps the full snapshot on disk", async () => {
  await withTempDir(async (dir) => {
    const savePath = path.join(dir, "runtime.json");
    const client = {
      async getRuntimeState() {
        return {
          ok: true,
          data: {
            available: true,
            requestId: "snapshot:1",
            pending: false,
            sessionCount: 1,
            sessions: [{
              runtimeState: {
                currentScene: "res://main.tscn",
                root: { name: "Main", path: "/root/Main", type: "Node", childCount: 4 }
              }
            }],
            events: [{ kind: "runtime_state" }]
          }
        };
      }
    };

    const result = await getRuntimeState({ client, payload: { savePath } });
    assert.equal(result.data.savedPath, savePath);
    assert.equal(result.data.currentScene, "res://main.tscn");
    assert.equal(result.data.root.name, "Main");
    assert.equal(result.data.nodeCount, 1);
    assert.equal(result.data.sessions, undefined);
    const saved = JSON.parse(await readFile(savePath, "utf8"));
    assert.equal(saved.sessions[0].runtimeState.root.name, "Main");
    assert.equal(saved.events, undefined);
  });
});

test("captureRuntimeScreenshot omits inline pixels without savePath", async () => {
  const client = {
    async captureRuntimeScreenshot() {
      return runtimeScreenshotResult();
    }
  };
  const result = await captureRuntimeScreenshot({ client, payload: {} });
  assert.equal(result.data.responses[0].data, "");
  assert.equal(result.data.responses[0].omitted, true);
  assert.match(result.data.responses[0].hint, /savePath/);
});
