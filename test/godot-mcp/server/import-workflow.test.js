import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards set_import_options calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/import/options/set" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://assets/ship.glb",
          importMetadataPath: "res://assets/ship.glb.import",
          updatedOptions: {
            "nodes/root_type": "CharacterBody3D"
          },
          reimport: {
            requested: true,
            reimported: true
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
        name: "set_import_options",
        arguments: {
          path: "res://assets/ship.glb",
          options: {
            "nodes/root_type": "CharacterBody3D"
          },
          reimport: true
        }
      });

      assert.match(response.result.content[0].text, /"updatedOptions"/);
      assert.deepEqual(receivedBody, {
        path: "res://assets/ship.glb",
        options: {
          "nodes/root_type": "CharacterBody3D"
        },
        reimport: true
      });
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards get_import_diagnostics calls to the editor bridge", async () => {
  await withBridgeServer(async (req, res) => {
    if (req.url === "/import/diagnostics?path=res%3A%2F%2Fassets%2Fship.glb" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://assets/ship.glb",
          status: "warning",
          issues: [
            {
              code: "missing_import_target",
              severity: "error",
              path: "res://.godot/imported/ship.mesh"
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
        name: "get_import_diagnostics",
        arguments: {
          path: "res://assets/ship.glb"
        }
      });

      assert.match(response.result.content[0].text, /"missing_import_target"/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards reimport_assets calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/import/reimport" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          paths: ["res://assets/ship.glb"],
          reimported: true,
          scanned: false
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
        name: "reimport_assets",
        arguments: {
          paths: ["res://assets/ship.glb"]
        }
      });

      assert.match(response.result.content[0].text, /"reimported": true/);
      assert.deepEqual(receivedBody, {
        paths: ["res://assets/ship.glb"]
      });
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards get_import_events calls to the editor bridge", async () => {
  await withBridgeServer(async (req, res) => {
    if (req.url === "/import/events?limit=20&kinds=resources_reimported%2Csources_changed&sinceMsec=123" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          events: [
            {
              kind: "resources_reimported",
              paths: ["res://assets/ship.glb"],
              invalidPaths: [],
              timeMsec: 456
            }
          ],
          total: 1,
          limit: 20
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
        name: "get_import_events",
        arguments: {
          limit: 20,
          kinds: ["resources_reimported", "sources_changed"],
          sinceMsec: 123
        }
      });

      assert.match(response.result.content[0].text, /"resources_reimported"/);
      assert.match(response.result.content[0].text, /"res:\/\/assets\/ship\.glb"/);
    } finally {
      await server.close();
    }
  });
});
