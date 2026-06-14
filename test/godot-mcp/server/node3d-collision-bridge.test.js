import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server creates curated 3D collision shapes", async () => {
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
          nodePath: "PlayerBody/PlayerCapsuleCollision",
          type: "CollisionShape3D",
          parentPath: "PlayerBody"
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
        name: "create_collision_shape_3d",
        arguments: {
          shapeKind: "capsule",
          shapePath: "res://physics/player_capsule.tres",
          name: "PlayerCapsuleCollision",
          parentPath: "PlayerBody",
          position: [0, 0.9, 0],
          rotationDegrees: [0, 0, 0],
          radius: 0.45,
          height: 1.8,
          disabled: false,
          overwrite: true
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.shapeKind, "capsule");
      assert.equal(payload.data.shapeClassName, "CapsuleShape3D");
      assert.equal(payload.data.node.nodePath, "PlayerBody/PlayerCapsuleCollision");
      assert.deepEqual(received, [
        {
          method: "POST",
          url: "/resource/create",
          body: {
            path: "res://physics/player_capsule.tres",
            className: "CapsuleShape3D",
            properties: {
              radius: 0.45,
              height: 1.8
            },
            open: false,
            overwrite: true
          }
        },
        {
          method: "POST",
          url: "/scene/node/create",
          body: {
            type: "CollisionShape3D",
            name: "PlayerCapsuleCollision",
            parentPath: "PlayerBody",
            properties: {
              position: { type: "Vector3", x: 0, y: 0.9, z: 0 },
              rotation_degrees: { type: "Vector3", x: 0, y: 0, z: 0 },
              disabled: false,
              shape: {
                type: "Resource",
                path: "res://physics/player_capsule.tres"
              }
            }
          }
        }
      ]);
    } finally {
      await server.close();
    }
  });
});
