import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server exposes Navigation tools only under the full profile", async () => {
  const fullServer = createMcpProcess({ NIUA_MCP_PROFILE: "full" });
  const v1Server = createMcpProcess({ NIUA_MCP_PROFILE: "" });

  try {
    await fullServer.request("initialize", {});
    const fullTools = await fullServer.request("tools/list");
    const fullNames = fullTools.result.tools.map(({ name }) => name);
    assert.ok(fullNames.includes("create_navigation_region_3d"));
    assert.ok(fullNames.includes("bake_navigation_mesh_3d"));
    assert.ok(fullNames.includes("create_navigation_agent_3d"));

    await v1Server.request("initialize", {});
    const v1Tools = await v1Server.request("tools/list");
    const v1Names = v1Tools.result.tools.map(({ name }) => name);
    assert.ok(!v1Names.includes("create_navigation_region_3d"));

    const blocked = await v1Server.request("tools/call", {
      name: "create_navigation_region_3d",
      arguments: {
        name: "NavRegion"
      }
    });
    assert.match(blocked.error.message, /not in the "v1" tool profile/);
  } finally {
    await fullServer.close();
    await v1Server.close();
  }
});

test("Godot MCP server forwards Navigation write calls to the editor bridge", async () => {
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
        name: "bake_navigation_mesh_3d",
        arguments: {
          regionPath: "NavRegion"
        }
      });
      await server.request("tools/call", {
        name: "create_navigation_agent_3d",
        arguments: {
          parentPath: "AgentBody",
          name: "NavigationAgent3D",
          targetDesiredDistance: 0.4
        }
      });
    } finally {
      await server.close();
    }
  });

  assert.deepEqual(requests, [
    {
      method: "POST",
      url: "/navigation/mesh/bake",
      body: {
        regionPath: "NavRegion"
      }
    },
    {
      method: "POST",
      url: "/navigation/agent/create",
      body: {
        parentPath: "AgentBody",
        name: "NavigationAgent3D",
        targetDesiredDistance: 0.4
      }
    }
  ]);
});
