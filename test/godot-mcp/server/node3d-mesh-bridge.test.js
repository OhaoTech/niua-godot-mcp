import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server creates curated primitive MeshInstance3D nodes", async () => {
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
    if (req.url === "/scene/node/create" && req.method === "POST") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: "CrateMesh",
          type: "MeshInstance3D",
          parentPath: ""
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      const response = await server.request("tools/call", {
        name: "create_mesh_instance_3d",
        arguments: {
          meshKind: "box",
          meshPath: "res://meshes/crate_box.tres",
          name: "CrateMesh",
          parentPath: "",
          position: [1, 0.5, -2],
          rotationDegrees: [0, 45, 0],
          scale: [1, 2, 1],
          size: [2, 1, 3],
          materialPath: "res://materials/neon_blue.tres",
          overwrite: true,
          meshProperties: {
            subdivide_width: 2
          },
          nodeProperties: {
            cast_shadow: 1
          }
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.meshKind, "box");
      assert.equal(payload.data.meshClassName, "BoxMesh");
      assert.equal(payload.data.node.nodePath, "CrateMesh");
      assert.deepEqual(received, [
        {
          method: "POST",
          url: "/resource/create",
          body: {
            path: "res://meshes/crate_box.tres",
            className: "BoxMesh",
            properties: {
              size: { type: "Vector3", x: 2, y: 1, z: 3 },
              subdivide_width: 2
            },
            open: false,
            overwrite: true
          }
        },
        {
          method: "POST",
          url: "/scene/node/create",
          body: {
            type: "MeshInstance3D",
            name: "CrateMesh",
            parentPath: "",
            properties: {
              mesh: {
                type: "Resource",
                path: "res://meshes/crate_box.tres"
              },
              position: { type: "Vector3", x: 1, y: 0.5, z: -2 },
              rotation_degrees: { type: "Vector3", x: 0, y: 45, z: 0 },
              scale: { type: "Vector3", x: 1, y: 2, z: 1 },
              material_override: {
                type: "Resource",
                path: "res://materials/neon_blue.tres"
              },
              cast_shadow: 1
            }
          }
        }
      ]);
    } finally {
      await server.close();
    }
  });
});
