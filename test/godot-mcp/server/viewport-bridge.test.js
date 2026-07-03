import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards capture_viewport_screenshot calls to the editor bridge", async () => {
  await withBridgeServer(async (req, res) => {
    if (req.url === "/viewport/screenshot?viewport=2d&index=0" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          viewport: "2d",
          index: 0,
          width: 32,
          height: 32,
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
        name: "capture_viewport_screenshot",
        arguments: {
          viewport: "2d"
        }
      });

      assert.match(response.result.content[0].text, /"viewport":"2d"/);
      assert.match(response.result.content[0].text, /"mimeType":"image\/png"/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards get_viewport_state calls to the editor bridge", async () => {
  let seenUrl = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/viewport/state?viewport=3d&index=1" && req.method === "GET") {
      seenUrl = req.url;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          viewport: "3d",
          index: 1,
          available: true,
          size: { type: "Vector2", x: 640, y: 480 },
          camera3D: { available: false }
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
        name: "get_viewport_state",
        arguments: {
          viewport: "3d",
          index: 1
        }
      });

      assert.equal(seenUrl, "/viewport/state?viewport=3d&index=1");
      assert.match(response.result.content[0].text, /"viewport":"3d"/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards set_viewport_camera calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/viewport/camera/set" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          viewport: "2d",
          index: 0,
          available: true,
          camera2D: {
            available: true,
            position: { type: "Vector2", x: 100, y: 200 },
            zoom: { type: "Vector2", x: 1.5, y: 1.5 },
            rotation: 0.25
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
        name: "set_viewport_camera",
        arguments: {
          viewport: "2d",
          position: { type: "Vector2", x: 100, y: 200 },
          zoom: { type: "Vector2", x: 1.5, y: 1.5 },
          rotation: 0.25
        }
      });

      assert.deepEqual(receivedBody, {
        viewport: "2d",
        position: { type: "Vector2", x: 100, y: 200 },
        zoom: { type: "Vector2", x: 1.5, y: 1.5 },
        rotation: 0.25
      });
      assert.match(response.result.content[0].text, /"camera2D"/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards send_viewport_input calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/viewport/input/send" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          viewport: "2d",
          index: 0,
          local: true,
          eventsSent: receivedBody.events.length
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
        name: "send_viewport_input",
        arguments: {
          viewport: "2d",
          events: [
            { type: "mouse_click", position: [64, 96] }
          ]
        }
      });

      assert.deepEqual(receivedBody, {
        viewport: "2d",
        index: 0,
        local: true,
        notifyMouseEntered: true,
        updateMouseCursorState: true,
        events: [
          {
            type: "mouse_button",
            position: { type: "Vector2", x: 64, y: 96 },
            globalPosition: { type: "Vector2", x: 64, y: 96 },
            buttonIndex: 1,
            buttonMask: 1,
            pressed: true,
            doubleClick: false,
            factor: 1
          },
          {
            type: "mouse_button",
            position: { type: "Vector2", x: 64, y: 96 },
            globalPosition: { type: "Vector2", x: 64, y: 96 },
            buttonIndex: 1,
            buttonMask: 0,
            pressed: false,
            doubleClick: false,
            factor: 1
          }
        ]
      });
      assert.match(response.result.content[0].text, /"eventsSent":2/);
    } finally {
      await server.close();
    }
  });
});
