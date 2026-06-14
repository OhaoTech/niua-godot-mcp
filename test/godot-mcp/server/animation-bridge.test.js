import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server exposes Animation tools only under the full profile", async () => {
  const fullServer = createMcpProcess({ NIUA_MCP_PROFILE: "full" });
  const v1Server = createMcpProcess({ NIUA_MCP_PROFILE: "" });

  try {
    await fullServer.request("initialize", {});
    const fullTools = await fullServer.request("tools/list");
    const fullNames = fullTools.result.tools.map(({ name }) => name);
    assert.ok(fullNames.includes("upsert_animation"));
    assert.ok(fullNames.includes("list_animations"));
    assert.ok(fullNames.includes("play_animation"));

    await v1Server.request("initialize", {});
    const v1Tools = await v1Server.request("tools/list");
    const v1Names = v1Tools.result.tools.map(({ name }) => name);
    assert.ok(!v1Names.includes("upsert_animation"));

    const blocked = await v1Server.request("tools/call", {
      name: "upsert_animation",
      arguments: {
        playerPath: "AnimationPlayer",
        animationName: "hover",
        tracks: []
      }
    });
    assert.match(blocked.error.message, /not in the "v1" tool profile/);
  } finally {
    await fullServer.close();
    await v1Server.close();
  }
});

test("Godot MCP server forwards Animation write calls to the editor bridge", async () => {
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
        name: "play_animation",
        arguments: {
          playerPath: "AnimationPlayer",
          animationName: "hover",
          customSpeed: 1.25
        }
      });
      await server.request("tools/call", {
        name: "travel_animation_tree",
        arguments: {
          treePath: "AnimationTree",
          state: "Run"
        }
      });
    } finally {
      await server.close();
    }
  });

  assert.deepEqual(requests, [
    {
      method: "POST",
      url: "/animation/play",
      body: {
        playerPath: "AnimationPlayer",
        animationName: "hover",
        customSpeed: 1.25
      }
    },
    {
      method: "POST",
      url: "/animation/tree/travel",
      body: {
        treePath: "AnimationTree",
        state: "Run"
      }
    }
  ]);
});

test("Godot MCP server forwards Animation read calls to the editor bridge", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const server = createMcpProcess({
      GODOT_MCP_PORT: String(port),
      NIUA_MCP_PROFILE: "full"
    });

    try {
      await server.request("tools/call", {
        name: "list_animations",
        arguments: {
          scenePath: "res://assets/animated.glb"
        }
      });
      await server.request("tools/call", {
        name: "get_animation_state",
        arguments: {
          playerPath: "ImportedShip/AnimationPlayer"
        }
      });
    } finally {
      await server.close();
    }
  });

  assert.deepEqual(seenUrls, [
    "/animation/list?scenePath=res%3A%2F%2Fassets%2Fanimated.glb",
    "/animation/state?playerPath=ImportedShip%2FAnimationPlayer"
  ]);
});
