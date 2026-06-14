import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards script creation and attachment calls to the editor bridge", async () => {
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
        name: "create_script",
        arguments: {
          path: "res://scripts/player.gd",
          baseType: "Node3D",
          template: "node_lifecycle",
          className: "PlayerController"
        }
      });
      await server.request("tools/call", {
        name: "attach_script",
        arguments: {
          nodePath: "Player",
          scriptPath: "res://scripts/player.gd",
          createIfMissing: true,
          template: "node_process",
          className: "AttachedController",
          saveScene: true
        }
      });

      assert.deepEqual(received, [
        {
          method: "POST",
          url: "/script/create",
          body: {
            path: "res://scripts/player.gd",
            baseType: "Node3D",
            template: "node_lifecycle",
            className: "PlayerController"
          }
        },
        {
          method: "POST",
          url: "/script/attach",
          body: {
            nodePath: "Player",
            scriptPath: "res://scripts/player.gd",
            createIfMissing: true,
            template: "node_process",
            className: "AttachedController",
            saveScene: true
          }
        }
      ]);
    } finally {
      await server.close();
    }
  });
});
