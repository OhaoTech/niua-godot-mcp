import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

import { MULTIPLAYER_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/multiplayer/index.js";

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
  return MULTIPLAYER_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

test("MULTIPLAYER_TOOL_DEFINITIONS exposes the curated Multiplayer subsystem tools", () => {
  assert.deepEqual(MULTIPLAYER_TOOL_DEFINITIONS.map((tool) => tool.name), [
    "create_enet_multiplayer_script",
    "create_multiplayer_spawner",
    "create_multiplayer_synchronizer",
    "create_multiplayer_state_script"
  ]);
  assert.ok(MULTIPLAYER_TOOL_DEFINITIONS.length <= 10);
  assert.ok(MULTIPLAYER_TOOL_DEFINITIONS.every((tool) => tool.inputSchema?.type === "object"));
});

test("create_multiplayer_synchronizer forwards replicated properties", async () => {
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
        nodePath: "SharedState/StateSynchronizer",
        propertyPaths: [".:synced_value"]
      }
    }));
  }, async (port) => {
    const result = await toolByName("create_multiplayer_synchronizer").handler({
      port,
      parentPath: "SharedState",
      name: "StateSynchronizer",
      rootPath: "..",
      propertyPaths: [".:synced_value"]
    });
    const payload = parseToolText(result);

    assert.equal(seenUrl, "/multiplayer/synchronizer/create");
    assert.equal(payload.data.nodePath, "SharedState/StateSynchronizer");
    assert.deepEqual(receivedBody, {
      parentPath: "SharedState",
      name: "StateSynchronizer",
      rootPath: "..",
      propertyPaths: [".:synced_value"]
    });
  });
});

test("create_enet_multiplayer_script forwards host/client script settings", async () => {
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
        nodePath: "",
        scriptPath: "res://scripts/multiplayer_probe.gd"
      }
    }));
  }, async (port) => {
    const result = await toolByName("create_enet_multiplayer_script").handler({
      port,
      nodePath: "",
      scriptPath: "res://scripts/multiplayer_probe.gd",
      statePath: "SharedState",
      propertyName: "synced_value",
      hostValue: "HOST_SYNCED"
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.scriptPath, "res://scripts/multiplayer_probe.gd");
    assert.deepEqual(receivedBody, {
      nodePath: "",
      scriptPath: "res://scripts/multiplayer_probe.gd",
      statePath: "SharedState",
      propertyName: "synced_value",
      hostValue: "HOST_SYNCED"
    });
  });
});
