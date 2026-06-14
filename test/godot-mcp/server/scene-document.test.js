import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards scene creation and save-as calls to the editor bridge", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8"))
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        endpoint: req.url
      }
    }));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      await server.request("tools/call", {
        name: "create_scene",
        arguments: {
          path: "res://scenes/generated.tscn",
          rootType: "Node3D",
          rootName: "GeneratedRoot"
        }
      });
      await server.request("tools/call", {
        name: "save_scene_as",
        arguments: {
          path: "res://scenes/generated_copy.tscn"
        }
      });

      assert.deepEqual(received, [
        {
          method: "POST",
          url: "/scene/create",
          body: {
            path: "res://scenes/generated.tscn",
            rootType: "Node3D",
            rootName: "GeneratedRoot"
          }
        },
        {
          method: "POST",
          url: "/scene/save-as",
          body: {
            path: "res://scenes/generated_copy.tscn"
          }
        }
      ]);
    } finally {
      await server.close();
    }
  });
});
