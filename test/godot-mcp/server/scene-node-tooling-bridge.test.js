import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards search_node_types calls to the editor bridge", async () => {
  let seenUrl = null;

  await withBridgeServer((req, res) => {
    if (req.url?.startsWith("/node-types/search") && req.method === "GET") {
      seenUrl = req.url;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          query: "camera",
          baseType: "Node3D",
          matches: [
            {
              name: "Camera3D",
              parentClass: "Node3D",
              canInstantiate: true,
              enabled: true,
              inheritsBase: true,
              isBaseType: false,
              inheritanceDepth: 1,
              inheritanceChain: ["Camera3D", "Node3D"]
            }
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
        name: "search_node_types",
        arguments: {
          query: "camera",
          baseType: "Node3D",
          includeDisabled: true,
          limit: 12
        }
      });

      assert.equal(response.result.content[0].type, "text");
      assert.match(response.result.content[0].text, /"Camera3D"/);
      assert.equal(seenUrl, "/node-types/search?query=camera&baseType=Node3D&includeAbstract=false&includeDisabled=true&limit=12");
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards create_node_with_script calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/scene/node/create-with-script" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          node: { path: "Player", type: "Node3D" },
          script: { path: "res://scripts/player.gd", type: "GDScript" },
          attached: true
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
        name: "create_node_with_script",
        arguments: {
          type: "Node3D",
          name: "Player",
          scriptPath: "res://scripts/player.gd",
          scriptTemplate: "tool_node",
          scriptClassName: "PlayerNode"
        }
      });

      assert.equal(response.result.content[0].type, "text");
      assert.match(response.result.content[0].text, /"attached": true/);
      assert.deepEqual(receivedBody, {
        type: "Node3D",
        name: "Player",
        scriptPath: "res://scripts/player.gd",
        scriptTemplate: "tool_node",
        scriptClassName: "PlayerNode"
      });
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards reorder_node calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/scene/node/reorder" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: "Third",
          index: 0,
          siblingOrder: ["Third", "First", "Second"]
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
        name: "reorder_node",
        arguments: {
          nodePath: "Third",
          index: 0
        }
      });

      assert.equal(response.result.content[0].type, "text");
      assert.match(response.result.content[0].text, /"siblingOrder": \[/);
      assert.deepEqual(receivedBody, {
        nodePath: "Third",
        index: 0
      });
    } finally {
      await server.close();
    }
  });
});
