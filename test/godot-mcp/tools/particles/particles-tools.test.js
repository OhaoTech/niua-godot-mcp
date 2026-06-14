import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

import { PARTICLES_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/particles/index.js";

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
  return PARTICLES_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

test("PARTICLES_TOOL_DEFINITIONS exposes the curated Particles subsystem tools", () => {
  assert.deepEqual(PARTICLES_TOOL_DEFINITIONS.map((tool) => tool.name), [
    "create_gpu_particles_3d",
    "create_gpu_particles_2d",
    "configure_particle_process_material",
    "set_particles_emitting"
  ]);
  assert.ok(PARTICLES_TOOL_DEFINITIONS.length <= 10);
  assert.ok(PARTICLES_TOOL_DEFINITIONS.every((tool) => tool.inputSchema?.type === "object"));
});

test("create_gpu_particles_3d handler forwards material payloads", async () => {
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
        nodePath: "Emitter",
        type: "GPUParticles3D"
      }
    }));
  }, async (port) => {
    const result = await toolByName("create_gpu_particles_3d").handler({
      port,
      name: "Emitter",
      amount: 96,
      oneShot: false,
      emitting: true,
      material: {
        emissionShape: "sphere",
        emissionSphereRadius: 0.4,
        initialVelocityMin: 2,
        gravity: { type: "Vector3", x: 0, y: -1, z: 0 }
      }
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.type, "GPUParticles3D");
    assert.deepEqual(receivedBody, {
      name: "Emitter",
      amount: 96,
      oneShot: false,
      emitting: true,
      material: {
        emissionShape: "sphere",
        emissionSphereRadius: 0.4,
        initialVelocityMin: 2,
        gravity: { type: "Vector3", x: 0, y: -1, z: 0 }
      }
    });
  });
});

test("set_particles_emitting handler forwards restart requests", async () => {
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
        nodePath: "Emitter",
        emitting: true
      }
    }));
  }, async (port) => {
    const result = await toolByName("set_particles_emitting").handler({
      port,
      nodePath: "Emitter",
      emitting: true,
      restart: true
    });
    const payload = parseToolText(result);

    assert.equal(seenUrl, "/particles/emitting/set");
    assert.equal(payload.data.emitting, true);
    assert.deepEqual(receivedBody, {
      nodePath: "Emitter",
      emitting: true,
      restart: true
    });
  });
});
