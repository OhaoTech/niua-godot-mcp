import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server exposes Localization tools only under the full profile", async () => {
  const fullServer = createMcpProcess({ NIUA_MCP_PROFILE: "full" });
  const v1Server = createMcpProcess({ NIUA_MCP_PROFILE: "" });

  try {
    await fullServer.request("initialize", {});
    const fullTools = await fullServer.request("tools/list");
    const fullNames = fullTools.result.tools.map(({ name }) => name);
    assert.ok(fullNames.includes("create_csv_translation"));
    assert.ok(fullNames.includes("register_translation_file"));
    assert.ok(fullNames.includes("set_locale"));
    assert.ok(fullNames.includes("get_localization_state"));

    await v1Server.request("initialize", {});
    const v1Tools = await v1Server.request("tools/list");
    const v1Names = v1Tools.result.tools.map(({ name }) => name);
    assert.ok(!v1Names.includes("create_csv_translation"));

    const blocked = await v1Server.request("tools/call", {
      name: "get_localization_state",
      arguments: {}
    });
    assert.match(blocked.error.message, /not in the "v1" tool profile/);
  } finally {
    await fullServer.close();
    await v1Server.close();
  }
});

test("Godot MCP server forwards Localization calls to the editor bridge", async () => {
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
        name: "get_localization_state",
        arguments: {}
      });
      await server.request("tools/call", {
        name: "create_csv_translation",
        arguments: {
          path: "res://locales/es.csv",
          locale: "es",
          messages: { HELLO: "Hola" }
        }
      });
      await server.request("tools/call", {
        name: "set_locale",
        arguments: { locale: "es" }
      });
    } finally {
      await server.close();
    }
  });

  assert.deepEqual(requests, [
    {
      method: "GET",
      url: "/localization/state",
      body: null
    },
    {
      method: "POST",
      url: "/localization/csv/create",
      body: {
        path: "res://locales/es.csv",
        locale: "es",
        messages: { HELLO: "Hola" }
      }
    },
    {
      method: "POST",
      url: "/localization/locale/set",
      body: { locale: "es" }
    }
  ]);
});
