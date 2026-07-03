import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards rename_node calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/scene/node/rename" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: "Hero",
          previousPath: "Player"
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
        name: "rename_node",
        arguments: {
          nodePath: "Player",
          newName: "Hero"
        }
      });

      assert.match(response.result.content[0].text, /"nodePath":"Hero"/);
      assert.deepEqual(receivedBody, {
        nodePath: "Player",
        newName: "Hero"
      });
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards create_node calls to the editor bridge", async () => {
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
          nodePath: "Player",
          type: "Node3D"
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
        name: "create_node",
        arguments: {
          type: "Node3D",
          name: "Player",
          parentPath: ""
        }
      });

      assert.equal(response.result.content[0].type, "text");
      assert.match(response.result.content[0].text, /"nodePath":"Player"/);
      assert.deepEqual(receivedBody, {
        type: "Node3D",
        name: "Player",
        parentPath: ""
      });
    } finally {
      await server.close();
    }
  });
});
