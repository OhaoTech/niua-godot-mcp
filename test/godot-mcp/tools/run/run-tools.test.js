import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

import { toolDefinitionsFromManifest } from "../../../../src/godot-mcp/manifest/index.js";
import { RUN_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/run/index.js";
import { RUN_TOOL_MANIFEST } from "../../../../src/godot-mcp/tools/run/manifest.js";

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
  return RUN_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

test("RUN_TOOL_DEFINITIONS exposes run tool descriptors", () => {
  const generatedDefinitions = toolDefinitionsFromManifest(RUN_TOOL_MANIFEST);

  assert.deepEqual(RUN_TOOL_DEFINITIONS.map((tool) => tool.name), [
    "get_run_settings",
    "set_main_scene",
    "get_run_status",
    "run_main_scene",
    "run_current_scene",
    "run_custom_scene",
    "stop_running_scene",
    "reload_running_scene"
  ]);
  assert.deepEqual(
    RUN_TOOL_DEFINITIONS.map(({ handler, ...definition }) => definition),
    generatedDefinitions.map(({ handler, ...definition }) => definition)
  );
  assert.ok(RUN_TOOL_DEFINITIONS.every((tool) => tool.inputSchema?.type === "object"));
});

test("run tool implementation is generated from the manifest", async () => {
  const tools = await readFile(new URL("../../../../src/godot-mcp/tools/run/index.js", import.meta.url), "utf8");

  assert.match(tools, /toolDefinitionsFromManifest\(RUN_TOOL_MANIFEST\)/);
  assert.doesNotMatch(tools, /async handler/);
});

test("get_run_settings handler reads run settings from the bridge", async () => {
  await withJsonBridge((req, res) => {
    res.setHeader("content-type", "application/json");

    if (req.url === "/run/settings" && req.method === "GET") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          mainScene: "res://scenes/main.tscn",
          mainSceneExists: true
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const result = await toolByName("get_run_settings").handler({ port });
    const payload = parseToolText(result);

    assert.equal(payload.ok, true);
    assert.equal(payload.data.mainScene, "res://scenes/main.tscn");
  });
});

test("run_custom_scene handler forwards payload through the bridge", async () => {
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    res.setHeader("content-type", "application/json");

    if (req.url === "/run/custom" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.end(JSON.stringify({
        ok: true,
        data: {
          playing: true,
          playingScene: "res://scenes/smoke.tscn"
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const result = await toolByName("run_custom_scene").handler({
      port,
      path: "res://scenes/smoke.tscn",
      saveBeforeRun: true
    });
    const payload = parseToolText(result);

    assert.deepEqual(receivedBody, {
      path: "res://scenes/smoke.tscn",
      saveBeforeRun: true
    });
    assert.equal(payload.data.playing, true);
  });
});
