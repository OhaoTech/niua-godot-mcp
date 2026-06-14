import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards get_script_editor_state calls to the editor bridge", async () => {
  let seenUrl = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/script/editor/state" && req.method === "GET") {
      seenUrl = req.url;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          currentScript: { path: "res://scripts/player.gd", type: "GDScript" },
          openScripts: []
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
        name: "get_script_editor_state",
        arguments: {}
      });

      assert.equal(seenUrl, "/script/editor/state");
      assert.match(response.result.content[0].text, /"currentScript"/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards get_script_symbols calls to the editor bridge", async () => {
  let seenUrl = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/script/symbols?path=res%3A%2F%2Fscripts%2Fplayer.gd" && req.method === "GET") {
      seenUrl = req.url;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://scripts/player.gd",
          type: "GDScript",
          methods: [{ name: "_ready" }],
          properties: [{ name: "speed" }],
          signals: [{ name: "boosted" }],
          constants: { MAX_SPEED: 42 }
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
        name: "get_script_symbols",
        arguments: {
          path: "res://scripts/player.gd"
        }
      });

      assert.equal(seenUrl, "/script/symbols?path=res%3A%2F%2Fscripts%2Fplayer.gd");
      assert.match(response.result.content[0].text, /"methods"/);
      assert.match(response.result.content[0].text, /"_ready"/);
      assert.match(response.result.content[0].text, /"MAX_SPEED": 42/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards get_script_cursor_state calls to the editor bridge", async () => {
  let seenUrl = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/script/cursor/state" && req.method === "GET") {
      seenUrl = req.url;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          cursorAvailable: true,
          currentScript: { path: "res://scripts/player.gd", type: "GDScript" },
          carets: [{ index: 0, line: 2, lineOneBased: 3, column: 4, hasSelection: true }]
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
        name: "get_script_cursor_state",
        arguments: {}
      });

      assert.equal(seenUrl, "/script/cursor/state");
      assert.match(response.result.content[0].text, /"cursorAvailable": true/);
      assert.match(response.result.content[0].text, /"lineOneBased": 3/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards goto_script_line calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/script/goto-line" && req.method === "POST") {
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
          requestedLine: 13,
          editorLine: 13,
          column: 2,
          opened: true
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
        name: "goto_script_line",
        arguments: {
          path: "res://scripts/player.gd",
          line: 13,
          column: 2
        }
      });

      assert.deepEqual(receivedBody, {
        path: "res://scripts/player.gd",
        line: 13,
        column: 2
      });
      assert.match(response.result.content[0].text, /"editorLine": 13/);
    } finally {
      await server.close();
    }
  });
});
