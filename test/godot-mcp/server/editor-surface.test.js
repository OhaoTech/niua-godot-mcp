import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards set_editor_main_screen calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/editor/main-screen/set" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          screen: "Script",
          mainScreen: { available: true, name: "Script" }
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
        name: "set_editor_main_screen",
        arguments: {
          screen: "Script"
        }
      });

      assert.deepEqual(receivedBody, { screen: "Script" });
      assert.match(response.result.content[0].text, /"screen":"Script"/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards invoke_editor_action calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/editor/action/invoke" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          action: "select_file",
          invoked: true,
          params: { path: "res://scenes/main.tscn" }
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
        name: "invoke_editor_action",
        arguments: {
          action: "select_file",
          params: { path: "res://scenes/main.tscn" }
        }
      });

      assert.deepEqual(receivedBody, {
        action: "select_file",
        params: { path: "res://scenes/main.tscn" }
      });
      assert.match(response.result.content[0].text, /"invoked":true/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards capture_editor_screenshot calls to the editor bridge", async () => {
  await withBridgeServer(async (req, res) => {
    if (req.url === "/editor/screenshot" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          width: 128,
          height: 72,
          mimeType: "image/png",
          encoding: "base64",
          data: "iVBORw0KGgo="
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
        name: "capture_editor_screenshot",
        arguments: {}
      });

      assert.match(response.result.content[0].text, /"mimeType":"image\/png"/);
      assert.match(response.result.content[0].text, /"available":true/);
    } finally {
      await server.close();
    }
  });
});
