import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards get_filesystem_dock_state calls to the editor bridge", async () => {
  await withBridgeServer(async (req, res) => {
    if (req.url === "/filesystem/state" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          selectedPaths: ["res://scripts/player.gd"],
          currentPath: "res://scripts/player.gd",
          currentDirectory: "res://scripts",
          scanning: false,
          scanningProgress: 1
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
        name: "get_filesystem_dock_state",
        arguments: {}
      });

      assert.match(response.result.content[0].text, /"selectedPaths"/);
      assert.match(response.result.content[0].text, /"currentDirectory":"res:\/\/scripts"/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards write_text_file calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/filesystem/file/write" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://scripts/player.gd",
          bytes: 13
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
        name: "write_text_file",
        arguments: {
          path: "res://scripts/player.gd",
          content: "extends Node\n"
        }
      });

      assert.match(response.result.content[0].text, /"path":"res:\/\/scripts\/player.gd"/);
      assert.deepEqual(receivedBody, {
        path: "res://scripts/player.gd",
        content: "extends Node\n"
      });
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards write_binary_file calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/filesystem/file/write-binary" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://assets/shrine.glb",
          bytes: 4
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
        name: "write_binary_file",
        arguments: {
          path: "res://assets/shrine.glb",
          contentBase64: "Z2xiAA=="
        }
      });

      assert.match(response.result.content[0].text, /"path":"res:\/\/assets\/shrine.glb"/);
      assert.deepEqual(receivedBody, {
        path: "res://assets/shrine.glb",
        contentBase64: "Z2xiAA=="
      });
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards copy_filesystem_entry calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/filesystem/copy" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          fromPath: "res://scripts/hero.gd",
          toPath: "res://scripts/hero_copy.gd",
          type: "file",
          overwrite: true,
          copiedEntries: [
            {
              path: "res://scripts/hero_copy.gd",
              type: "file"
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
        name: "copy_filesystem_entry",
        arguments: {
          fromPath: "res://scripts/hero.gd",
          toPath: "res://scripts/hero_copy.gd",
          overwrite: true
        }
      });

      assert.match(response.result.content[0].text, /"toPath":"res:\/\/scripts\/hero_copy.gd"/);
      assert.deepEqual(receivedBody, {
        fromPath: "res://scripts/hero.gd",
        toPath: "res://scripts/hero_copy.gd",
        overwrite: true
      });
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards batch_filesystem_operations calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/filesystem/batch" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          okCount: 2,
          errorCount: 0,
          processedCount: 2,
          continueOnError: true,
          dryRun: false,
          operations: [
            {
              index: 0,
              kind: "copy",
              ok: true,
              data: {
                fromPath: "res://scripts/hero.gd",
                toPath: "res://scripts/hero_backup.gd"
              }
            },
            {
              index: 1,
              kind: "delete",
              ok: true,
              data: {
                path: "res://scripts/old.gd"
              }
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
        name: "batch_filesystem_operations",
        arguments: {
          operations: [
            {
              kind: "copy",
              fromPath: "res://scripts/hero.gd",
              toPath: "res://scripts/hero_backup.gd",
              overwrite: true
            },
            {
              kind: "delete",
              path: "res://scripts/old.gd"
            }
          ],
          continueOnError: true,
          dryRun: false
        }
      });

      assert.match(response.result.content[0].text, /"okCount":2/);
      assert.deepEqual(receivedBody, {
        operations: [
          {
            kind: "copy",
            fromPath: "res://scripts/hero.gd",
            toPath: "res://scripts/hero_backup.gd",
            overwrite: true
          },
          {
            kind: "delete",
            path: "res://scripts/old.gd"
          }
        ],
        continueOnError: true,
        dryRun: false
      });
    } finally {
      await server.close();
    }
  });
});
