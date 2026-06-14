import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server exposes Particles tools only under the full profile", async () => {
  const fullServer = createMcpProcess({ NIUA_MCP_PROFILE: "full" });
  const v1Server = createMcpProcess({ NIUA_MCP_PROFILE: "" });

  try {
    await fullServer.request("initialize", {});
    const fullTools = await fullServer.request("tools/list");
    const fullNames = fullTools.result.tools.map(({ name }) => name);
    assert.ok(fullNames.includes("create_gpu_particles_3d"));
    assert.ok(fullNames.includes("create_gpu_particles_2d"));
    assert.ok(fullNames.includes("configure_particle_process_material"));

    await v1Server.request("initialize", {});
    const v1Tools = await v1Server.request("tools/list");
    const v1Names = v1Tools.result.tools.map(({ name }) => name);
    assert.ok(!v1Names.includes("create_gpu_particles_3d"));

    const blocked = await v1Server.request("tools/call", {
      name: "create_gpu_particles_3d",
      arguments: {
        name: "Emitter"
      }
    });
    assert.match(blocked.error.message, /not in the "v1" tool profile/);
  } finally {
    await fullServer.close();
    await v1Server.close();
  }
});

test("Godot MCP server forwards Particles write calls to the editor bridge", async () => {
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
        name: "configure_particle_process_material",
        arguments: {
          nodePath: "Emitter",
          material: {
            emissionShape: "box",
            emissionBoxExtents: { type: "Vector3", x: 1, y: 1, z: 1 }
          }
        }
      });
      await server.request("tools/call", {
        name: "create_gpu_particles_2d",
        arguments: {
          name: "Rain2D",
          amount: 32,
          oneShot: true
        }
      });
    } finally {
      await server.close();
    }
  });

  assert.deepEqual(requests, [
    {
      method: "POST",
      url: "/particles/material/configure",
      body: {
        nodePath: "Emitter",
        material: {
          emissionShape: "box",
          emissionBoxExtents: { type: "Vector3", x: 1, y: 1, z: 1 }
        }
      }
    },
    {
      method: "POST",
      url: "/particles/create-2d",
      body: {
        name: "Rain2D",
        amount: 32,
        oneShot: true
      }
    }
  ]);
});
