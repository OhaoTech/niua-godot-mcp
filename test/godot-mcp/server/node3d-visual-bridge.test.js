import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server creates curated 3D lights", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/scene/node/create" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: "KeyLight",
          type: "SpotLight3D",
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
        name: "create_light_3d",
        arguments: {
          kind: "spot",
          name: "KeyLight",
          parentPath: "",
          position: [2, 4, 3],
          rotationDegrees: { x: -45, y: 35, z: 0 },
          color: "#ffd7a1",
          energy: 3.25,
          range: 18,
          angleDegrees: 42,
          shadowEnabled: true,
          properties: {
            light_specular: 0.7
          }
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.kind, "spot");
      assert.equal(payload.data.type, "SpotLight3D");
      assert.equal(payload.data.node.nodePath, "KeyLight");
      assert.deepEqual(receivedBody, {
        type: "SpotLight3D",
        name: "KeyLight",
        parentPath: "",
        properties: {
          position: { type: "Vector3", x: 2, y: 4, z: 3 },
          rotation_degrees: { type: "Vector3", x: -45, y: 35, z: 0 },
          light_color: {
            type: "Color",
            r: 1,
            g: 0.8431372549019608,
            b: 0.6313725490196078,
            a: 1
          },
          light_energy: 3.25,
          shadow_enabled: true,
          spot_range: 18,
          spot_angle: 42,
          light_specular: 0.7
        }
      });
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server creates curated 3D cameras", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/scene/node/create" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: "PreviewCamera",
          type: "Camera3D",
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
        name: "create_camera_3d",
        arguments: {
          name: "PreviewCamera",
          parentPath: "",
          position: [0, 3, 8],
          rotationDegrees: { x: -20, y: 0, z: 0 },
          current: true,
          fov: 55,
          near: 0.05,
          far: 300,
          projection: "perspective",
          properties: {
            cull_mask: 1048575
          }
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.type, "Camera3D");
      assert.equal(payload.data.node.nodePath, "PreviewCamera");
      assert.deepEqual(receivedBody, {
        type: "Camera3D",
        name: "PreviewCamera",
        parentPath: "",
        properties: {
          position: { type: "Vector3", x: 0, y: 3, z: 8 },
          rotation_degrees: { type: "Vector3", x: -20, y: 0, z: 0 },
          current: true,
          fov: 55,
          near: 0.05,
          far: 300,
          projection: 0,
          cull_mask: 1048575
        }
      });
    } finally {
      await server.close();
    }
  });
});
