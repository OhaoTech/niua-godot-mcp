import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards get_project_settings calls to the editor bridge", async () => {
  await withBridgeServer(async (req, res) => {
    if (req.url === "/project/settings?prefix=application%2F&query=config&editorVisible=true&basic=false&internal=false&restartIfChanged=false" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          prefix: "application/",
          query: "config",
          filters: {
            editorVisible: true,
            basic: false,
            internal: false,
            restartIfChanged: false
          },
          settingCount: 1,
          settings: [
            {
              name: "application/config/name",
              category: "application",
              section: "application/config",
              usageFlags: ["storage", "editor"]
            }
          ],
          categories: [
            {
              name: "application",
              path: "application",
              settingCount: 1,
              sections: [
                {
                  name: "config",
                  path: "application/config",
                  settingCount: 1
                }
              ]
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
        name: "get_project_settings",
        arguments: {
          prefix: "application/",
          query: "config",
          editorVisible: true,
          basic: false,
          internal: false,
          restartIfChanged: false
        }
      });

      assert.match(response.result.content[0].text, /"query":"config"/);
      assert.match(response.result.content[0].text, /"settingCount":1/);
      assert.match(response.result.content[0].text, /"category":"application"/);
      assert.match(response.result.content[0].text, /"path":"application\/config"/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards set_project_setting calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/project/setting/set" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          name: "application/config/name",
          value: "Neon Racer"
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
        name: "set_project_setting",
        arguments: {
          name: "application/config/name",
          value: "Neon Racer",
          save: true
        }
      });

      assert.match(response.result.content[0].text, /"value":"Neon Racer"/);
      assert.deepEqual(receivedBody, {
        name: "application/config/name",
        value: "Neon Racer",
        save: true
      });
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards set_project_setting_metadata calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/project/setting/metadata/set" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          name: "application/config/name",
          value: "Neon Racer",
          order: 10,
          updatedMetadata: {
            order: 10,
            basic: true,
            internal: false,
            restartIfChanged: true
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
        name: "set_project_setting_metadata",
        arguments: {
          name: "application/config/name",
          order: 10,
          initialValue: "Neon Racer",
          basic: true,
          internal: false,
          restartIfChanged: true,
          save: true
        }
      });

      assert.match(response.result.content[0].text, /"updatedMetadata"/);
      assert.deepEqual(receivedBody, {
        name: "application/config/name",
        order: 10,
        initialValue: "Neon Racer",
        basic: true,
        internal: false,
        restartIfChanged: true,
        save: true
      });
    } finally {
      await server.close();
    }
  });
});
