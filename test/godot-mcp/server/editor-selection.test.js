import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards editor selection and focus calls to the editor bridge", async () => {
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
        name: "set_selection",
        arguments: {
          nodePaths: ["Player", "Player/Camera"]
        }
      });
      await server.request("tools/call", {
        name: "focus_node",
        arguments: {
          nodePath: "Player/Camera"
        }
      });
      await server.request("tools/call", {
        name: "focus_resource",
        arguments: {
          path: "res://scenes/main.tscn"
        }
      });

      assert.deepEqual(received, [
        {
          method: "POST",
          url: "/selection/set",
          body: { nodePaths: ["Player", "Player/Camera"] }
        },
        {
          method: "POST",
          url: "/selection/focus/node",
          body: { nodePath: "Player/Camera" }
        },
        {
          method: "POST",
          url: "/resource/focus",
          body: { path: "res://scenes/main.tscn" }
        }
      ]);
    } finally {
      await server.close();
    }
  });
});
