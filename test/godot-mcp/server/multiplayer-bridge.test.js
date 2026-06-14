import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server exposes Multiplayer tools only under the full profile", async () => {
  const fullServer = createMcpProcess({ NIUA_MCP_PROFILE: "full" });
  const v1Server = createMcpProcess({ NIUA_MCP_PROFILE: "" });

  try {
    await fullServer.request("initialize", {});
    const fullTools = await fullServer.request("tools/list");
    const fullNames = fullTools.result.tools.map(({ name }) => name);
    assert.ok(fullNames.includes("create_enet_multiplayer_script"));
    assert.ok(fullNames.includes("create_multiplayer_spawner"));
    assert.ok(fullNames.includes("create_multiplayer_synchronizer"));
    assert.ok(fullNames.includes("create_multiplayer_state_script"));

    await v1Server.request("initialize", {});
    const v1Tools = await v1Server.request("tools/list");
    const v1Names = v1Tools.result.tools.map(({ name }) => name);
    assert.ok(!v1Names.includes("create_enet_multiplayer_script"));

    const blocked = await v1Server.request("tools/call", {
      name: "create_multiplayer_spawner",
      arguments: { parentPath: "" }
    });
    assert.match(blocked.error.message, /not in the "v1" tool profile/);
  } finally {
    await fullServer.close();
    await v1Server.close();
  }
});

test("Godot MCP server forwards Multiplayer calls to the editor bridge", async () => {
  const requests = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    requests.push({
      method: req.method,
      url: req.url,
      body: chunks.length > 0 ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : null
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const server = createMcpProcess({
      GODOT_MCP_PORT: String(port),
      NIUA_MCP_PROFILE: "full"
    });

    try {
      await server.request("tools/call", {
        name: "create_multiplayer_spawner",
        arguments: {
          parentPath: "",
          spawnPath: "."
        }
      });
      await server.request("tools/call", {
        name: "create_multiplayer_state_script",
        arguments: {
          nodePath: "SharedState",
          scriptPath: "res://scripts/state.gd",
          propertyName: "synced_value"
        }
      });
    } finally {
      await server.close();
    }
  });

  assert.deepEqual(requests, [
    {
      method: "POST",
      url: "/multiplayer/spawner/create",
      body: {
        parentPath: "",
        spawnPath: "."
      }
    },
    {
      method: "POST",
      url: "/multiplayer/state-script/create",
      body: {
        nodePath: "SharedState",
        scriptPath: "res://scripts/state.gd",
        propertyName: "synced_value"
      }
    }
  ]);
});
