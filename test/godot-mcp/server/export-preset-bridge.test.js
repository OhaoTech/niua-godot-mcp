import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards list_export_presets calls to the editor bridge", async () => {
  await withBridgeServer(async (req, res) => {
    if (req.url === "/export/presets" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          exists: true,
          presets: [
            { index: 0, name: "Linux", platform: "Linux" }
          ]
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
        name: "list_export_presets",
        arguments: {}
      });

      assert.match(response.result.content[0].text, /"name": "Linux"/);
      assert.match(response.result.content[0].text, /"platform": "Linux"/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards upsert_export_preset calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/export/preset/upsert" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://export_presets.cfg",
          preset: {
            index: 0,
            name: "Linux",
            platform: "Linux",
            exportPath: "build/game.x86_64"
          }
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
        name: "upsert_export_preset",
        arguments: {
          name: "Linux",
          platform: "Linux",
          exportPath: "build/game.x86_64",
          options: {
            "binary_format/embed_pck": false
          }
        }
      });

      assert.match(response.result.content[0].text, /"name": "Linux"/);
      assert.equal(receivedBody.name, "Linux");
      assert.equal(receivedBody.platform, "Linux");
    } finally {
      await server.close();
    }
  });
});
