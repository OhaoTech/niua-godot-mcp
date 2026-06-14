import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards resource create and save calls to the editor bridge", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      await server.request("tools/call", {
        name: "create_resource",
        arguments: {
          path: "res://materials/neon.tres",
          className: "StandardMaterial3D",
          properties: {
            albedo_color: { type: "Color", r: 0, g: 1, b: 1, a: 1 }
          },
          open: true
        }
      });
      await server.request("tools/call", {
        name: "save_resource",
        arguments: {
          path: "res://materials/neon.tres",
          properties: {
            metallic: 0.5
          }
        }
      });

      assert.deepEqual(received, [
        {
          method: "POST",
          url: "/resource/create",
          body: {
            path: "res://materials/neon.tres",
            className: "StandardMaterial3D",
            properties: {
              albedo_color: { type: "Color", r: 0, g: 1, b: 1, a: 1 }
            },
            open: true
          }
        },
        {
          method: "POST",
          url: "/resource/save",
          body: {
            path: "res://materials/neon.tres",
            properties: {
              metallic: 0.5
            }
          }
        }
      ]);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server creates curated StandardMaterial3D resources", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    received.push({
      method: req.method,
      url: req.url,
      body
    });

    res.setHeader("content-type", "application/json");
    if (req.url === "/resource/create" && req.method === "POST") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: body.path,
          type: body.className,
          properties: body.properties
        }
      }));
      return;
    }
    if (req.url === "/node/material/assign" && req.method === "POST") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: body.nodePath,
          materialPath: body.materialPath,
          surfaceIndex: body.surfaceIndex
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "unexpected endpoint" }));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      const response = await server.request("tools/call", {
        name: "create_material",
        arguments: {
          path: "res://materials/neon_hull.tres",
          name: "Neon Cyan Hull",
          albedoColor: "#00e5ffcc",
          metallic: 0.75,
          roughness: 0.2,
          emissionColor: { r: 0, g: 0.85, b: 1, a: 1 },
          emissionEnergyMultiplier: 2.5,
          transparency: "alpha",
          cullMode: "back",
          open: true,
          overwrite: true,
          assignToNode: {
            nodePath: "/root/Ship",
            surfaceIndex: 0
          }
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.path, "res://materials/neon_hull.tres");
      assert.equal(payload.data.className, "StandardMaterial3D");
      assert.equal(payload.data.assigned, true);
      assert.deepEqual(received, [
        {
          method: "POST",
          url: "/resource/create",
          body: {
            path: "res://materials/neon_hull.tres",
            className: "StandardMaterial3D",
            properties: {
              resource_name: "Neon Cyan Hull",
              albedo_color: {
                type: "Color",
                r: 0,
                g: 0.8980392156862745,
                b: 1,
                a: 0.8
              },
              metallic: 0.75,
              roughness: 0.2,
              emission_enabled: true,
              emission: {
                type: "Color",
                r: 0,
                g: 0.85,
                b: 1,
                a: 1
              },
              emission_energy_multiplier: 2.5,
              transparency: 1,
              cull_mode: 0
            },
            open: true,
            overwrite: true
          }
        },
        {
          method: "POST",
          url: "/node/material/assign",
          body: {
            nodePath: "/root/Ship",
            materialPath: "res://materials/neon_hull.tres",
            surfaceIndex: 0
          }
        }
      ]);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server creates curated ShaderMaterial resources", async () => {
  const received = [];
  const code = [
    "shader_type spatial;",
    "uniform vec4 glow_color : source_color = vec4(0.0, 1.0, 1.0, 1.0);",
    "void fragment() {",
    "  ALBEDO = glow_color.rgb;",
    "}"
  ].join("\n");

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    received.push({
      method: req.method,
      url: req.url,
      body
    });

    res.setHeader("content-type", "application/json");
    if (req.url === "/resource/shader-material/create" && req.method === "POST") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: body.path,
          shaderPath: body.shaderPath,
          parameterNames: Object.keys(body.parameters)
        }
      }));
      return;
    }
    if (req.url === "/node/material/assign" && req.method === "POST") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: body.nodePath,
          materialPath: body.materialPath,
          surfaceIndex: body.surfaceIndex
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "unexpected endpoint" }));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      const response = await server.request("tools/call", {
        name: "create_shader_material",
        arguments: {
          path: "res://materials/hologram_panel.tres",
          shaderPath: "res://materials/hologram_panel.gdshader",
          resourceName: "Hologram Panel",
          code,
          parameters: {
            glow_color: "#00ffffcc",
            mask_texture: "res://textures/holo_mask.png"
          },
          open: true,
          overwrite: true,
          overwriteShader: true,
          assignToNode: {
            nodePath: "/root/Ship/HologramPanel",
            surfaceIndex: 0
          }
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.path, "res://materials/hologram_panel.tres");
      assert.equal(payload.data.shaderPath, "res://materials/hologram_panel.gdshader");
      assert.equal(payload.data.assigned, true);
      assert.deepEqual(received, [
        {
          method: "POST",
          url: "/resource/shader-material/create",
          body: {
            path: "res://materials/hologram_panel.tres",
            shaderPath: "res://materials/hologram_panel.gdshader",
            resourceName: "Hologram Panel",
            code,
            parameters: {
              glow_color: { type: "Color", r: 0, g: 1, b: 1, a: 0.8 },
              mask_texture: { type: "Resource", path: "res://textures/holo_mask.png" }
            },
            open: true,
            overwrite: true,
            overwriteShader: true
          }
        },
        {
          method: "POST",
          url: "/node/material/assign",
          body: {
            nodePath: "/root/Ship/HologramPanel",
            materialPath: "res://materials/hologram_panel.tres",
            surfaceIndex: 0
          }
        }
      ]);
    } finally {
      await server.close();
    }
  });
});
