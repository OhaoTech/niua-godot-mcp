import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards replace_in_scripts calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/script/refactor/replace" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          dryRun: true,
          scannedFiles: 1,
          matchedFiles: 1,
          totalReplacements: 2,
          changes: [{ path: "res://scripts/player.gd", replacements: 2 }]
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
        name: "replace_in_scripts",
        arguments: {
          search: "old_name",
          replacement: "new_name",
          paths: ["res://scripts/player.gd"],
          dryRun: true
        }
      });

      assert.match(response.result.content[0].text, /"totalReplacements": 2/);
      assert.deepEqual(receivedBody, {
        search: "old_name",
        replacement: "new_name",
        paths: ["res://scripts/player.gd"],
        dryRun: true
      });
    } finally {
      await server.close();
    }
  });
});
