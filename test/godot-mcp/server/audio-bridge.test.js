import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server exposes Audio tools only under the full profile", async () => {
  const fullServer = createMcpProcess({ NIUA_MCP_PROFILE: "full" });
  const v1Server = createMcpProcess({ NIUA_MCP_PROFILE: "" });

  try {
    await fullServer.request("initialize", {});
    const fullTools = await fullServer.request("tools/list");
    const fullNames = fullTools.result.tools.map(({ name }) => name);
    assert.ok(fullNames.includes("list_audio_buses"));
    assert.ok(fullNames.includes("upsert_audio_bus"));
    assert.ok(fullNames.includes("upsert_audio_bus_effect"));
    assert.ok(fullNames.includes("create_audio_stream_player"));

    await v1Server.request("initialize", {});
    const v1Tools = await v1Server.request("tools/list");
    const v1Names = v1Tools.result.tools.map(({ name }) => name);
    assert.ok(!v1Names.includes("list_audio_buses"));

    const blocked = await v1Server.request("tools/call", {
      name: "list_audio_buses",
      arguments: {}
    });
    assert.match(blocked.error.message, /not in the "v1" tool profile/);
  } finally {
    await fullServer.close();
    await v1Server.close();
  }
});

test("Godot MCP server forwards Audio calls to the editor bridge", async () => {
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
        name: "list_audio_buses",
        arguments: {}
      });
      await server.request("tools/call", {
        name: "upsert_audio_bus",
        arguments: {
          name: "Music",
          volumeDb: -6,
          muted: false
        }
      });
      await server.request("tools/call", {
        name: "create_audio_stream_player",
        arguments: {
          name: "MusicPlayer",
          busName: "Music",
          autoplay: true
        }
      });
    } finally {
      await server.close();
    }
  });

  assert.deepEqual(requests, [
    {
      method: "GET",
      url: "/audio/buses",
      body: null
    },
    {
      method: "POST",
      url: "/audio/bus/upsert",
      body: {
        name: "Music",
        volumeDb: -6,
        muted: false
      }
    },
    {
      method: "POST",
      url: "/audio/player/create",
      body: {
        name: "MusicPlayer",
        busName: "Music",
        autoplay: true
      }
    }
  ]);
});
