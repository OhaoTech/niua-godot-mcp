import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server exposes UI tools only under the full profile", async () => {
  const fullServer = createMcpProcess({ NIUA_MCP_PROFILE: "full" });
  const v1Server = createMcpProcess({ NIUA_MCP_PROFILE: "" });

  try {
    await fullServer.request("initialize", {});
    const fullTools = await fullServer.request("tools/list");
    const fullNames = fullTools.result.tools.map(({ name }) => name);
    assert.ok(fullNames.includes("create_ui_control"));
    assert.ok(fullNames.includes("create_ui_theme"));
    assert.ok(fullNames.includes("connect_ui_signal"));

    await v1Server.request("initialize", {});
    const v1Tools = await v1Server.request("tools/list");
    const v1Names = v1Tools.result.tools.map(({ name }) => name);
    assert.ok(!v1Names.includes("create_ui_control"));

    const blocked = await v1Server.request("tools/call", {
      name: "create_ui_control",
      arguments: {
        type: "Label",
        name: "Title"
      }
    });
    assert.match(blocked.error.message, /not in the "core" tool profile/);
  } finally {
    await fullServer.close();
    await v1Server.close();
  }
});

test("Godot MCP server forwards UI write calls to the editor bridge", async () => {
  const requests = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    requests.push({
      method: req.method,
      url: req.url,
      body: chunks.length > 0 ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : null
    });

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const server = createMcpProcess({
      GODOT_MCP_PORT: String(port),
      NIUA_MCP_PROFILE: "full"
    });

    try {
      await server.request("tools/call", {
        name: "set_control_layout",
        arguments: {
          nodePath: "Menu/Title",
          anchors: { left: 0, top: 0, right: 1, bottom: 0 },
          offsets: { left: 32, top: 24, right: -32, bottom: 96 }
        }
      });
      await server.request("tools/call", {
        name: "connect_ui_signal",
        arguments: {
          sourcePath: "Menu/StartButton",
          signalName: "pressed",
          targetPath: "Menu",
          methodName: "_on_start_button_pressed"
        }
      });
    } finally {
      await server.close();
    }
  });

  assert.deepEqual(requests, [
    {
      method: "POST",
      url: "/ui/control/layout",
      body: {
        nodePath: "Menu/Title",
        anchors: { left: 0, top: 0, right: 1, bottom: 0 },
        offsets: { left: 32, top: 24, right: -32, bottom: 96 }
      }
    },
    {
      method: "POST",
      url: "/ui/signal/connect",
      body: {
        sourcePath: "Menu/StartButton",
        signalName: "pressed",
        targetPath: "Menu",
        methodName: "_on_start_button_pressed"
      }
    }
  ]);
});
