import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards scene tab control calls to the editor bridge", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    received.push({
      method: req.method,
      url: req.url,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")
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
        name: "switch_scene_tab",
        arguments: { path: "res://scenes/two.tscn" }
      });
      await server.request("tools/call", {
        name: "close_scene",
        arguments: { path: "res://scenes/two.tscn", saveBeforeClose: true }
      });
      await server.request("tools/call", {
        name: "mark_scene_unsaved",
        arguments: { path: "res://scenes/main.tscn" }
      });
      await server.request("tools/call", {
        name: "undo_editor_action",
        arguments: { historyId: 7 }
      });
      await server.request("tools/call", {
        name: "redo_editor_action",
        arguments: { historyId: 7 }
      });

      assert.deepEqual(received, [
        {
          method: "POST",
          url: "/scene/switch",
          body: { path: "res://scenes/two.tscn" }
        },
        {
          method: "POST",
          url: "/scene/close",
          body: { path: "res://scenes/two.tscn", saveBeforeClose: true }
        },
        {
          method: "POST",
          url: "/scene/mark-unsaved",
          body: { path: "res://scenes/main.tscn" }
        },
        {
          method: "POST",
          url: "/editor/undo",
          body: { historyId: 7 }
        },
        {
          method: "POST",
          url: "/editor/redo",
          body: { historyId: 7 }
        }
      ]);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards get_open_scene_tabs calls to the editor bridge", async () => {
  await withBridgeServer(async (req, res) => {
    if (req.url === "/scene/tabs" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          currentScene: "res://scenes/main.tscn",
          currentIndex: 0,
          openScenes: ["res://scenes/main.tscn", "res://scenes/two.tscn"],
          tabs: [
            {
              index: 0,
              path: "res://scenes/main.tscn",
              current: true,
              rootName: "Main",
              rootType: "Node3D",
              rootPath: "/root/Main",
              rootSceneFilePath: "res://scenes/main.tscn",
              edited: true,
              unsaved: true,
              dirtySource: "EditorInterface.is_object_edited",
              historyId: 7,
              historyVersion: 12,
              hasUndo: true,
              hasRedo: false
            },
            {
              index: 1,
              path: "res://scenes/two.tscn",
              current: false,
              rootName: "Two",
              rootType: "Node2D",
              rootPath: "/root/Two",
              rootSceneFilePath: "res://scenes/two.tscn",
              edited: false,
              unsaved: false,
              dirtySource: "EditorInterface.is_object_edited",
              historyId: 8,
              historyVersion: 3,
              hasUndo: false,
              hasRedo: false
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
        name: "get_open_scene_tabs",
        arguments: {}
      });

      assert.match(response.result.content[0].text, /"tabs"/);
      assert.match(response.result.content[0].text, /"currentIndex":0/);
      assert.match(response.result.content[0].text, /"unsaved":true/);
      assert.match(response.result.content[0].text, /"historyVersion":12/);
    } finally {
      await server.close();
    }
  });
});
