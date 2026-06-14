import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards assign_material calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/node/material/assign" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ ok: true, data: { assigned: true } }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      await server.request("tools/call", {
        name: "assign_material",
        arguments: {
          nodePath: "Track/Mesh",
          materialPath: "res://materials/neon.tres",
          surfaceIndex: 0
        }
      });

      assert.deepEqual(receivedBody, {
        nodePath: "Track/Mesh",
        materialPath: "res://materials/neon.tres",
        surfaceIndex: 0
      });
    } finally {
      await server.close();
    }
  });
});
