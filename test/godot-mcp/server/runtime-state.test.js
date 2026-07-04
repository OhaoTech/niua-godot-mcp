import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards install_runtime_probe calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/runtime/probe/install" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          autoloadName: "NiuaMcpRuntimeProbe",
          path: "res://addons/niua_mcp/niua_mcp_runtime_probe.gd",
          enabled: true,
          saved: true
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
        name: "install_runtime_probe",
        arguments: {
          save: true
        }
      });

      assert.match(response.result.content[0].text, /"autoloadName":"NiuaMcpRuntimeProbe"/);
      assert.deepEqual(receivedBody, { save: true });
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards get_runtime_state calls to the editor bridge", async () => {
  const seenUrls = [];

  await withBridgeServer(async (req, res) => {
    seenUrls.push(req.url);
    if ((req.url === "/runtime/state?maxDepth=2" || req.url === "/runtime/state") && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          sessionCount: 1,
          sessions: [
            {
              id: 0,
              hasRuntimeState: true,
              runtimeState: {
                kind: "snapshot",
                currentScene: "res://scenes/main.tscn"
              }
            }
          ],
          events: []
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      const toolResponse = await server.request("tools/call", {
        name: "get_runtime_state",
        arguments: {
          maxDepth: 2
        }
      });
      assert.match(toolResponse.result.content[0].text, /"currentScene":"res:\/\/scenes\/main\.tscn"/);

      const resourceResponse = await server.request("resources/read", {
        uri: "godot://runtime/state",
        arguments: {}
      });
      assert.match(resourceResponse.result.contents[0].text, /"hasRuntimeState":true/);
      assert.deepEqual(seenUrls, [
        "/runtime/state?maxDepth=2",
        "/runtime/state"
      ]);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards get_runtime_events calls to the editor bridge", async () => {
  const seenUrls = [];

  await withBridgeServer((req, res) => {
    seenUrls.push(req.url);
    res.setHeader("content-type", "application/json");

    if (req.url === "/runtime/events?limit=10&kinds=runtime_state&sinceMsec=500") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          eventCount: 1,
          totalMatched: 1,
          limit: 10,
          kinds: ["runtime_state"],
          sinceMsec: 500,
          events: [
            {
              kind: "runtime_state",
              sessionId: 0,
              timeMsec: 900,
              currentScene: "res://scenes/main.tscn"
            }
          ]
        }
      }));
      return;
    }

    if (req.url === "/runtime/events") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          eventCount: 1,
          totalMatched: 1,
          limit: 100,
          kinds: [],
          sinceMsec: -1,
          events: [
            {
              kind: "session_started",
              sessionId: 0,
              timeMsec: 100
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
      const toolResponse = await server.request("tools/call", {
        name: "get_runtime_events",
        arguments: {
          limit: 10,
          kinds: ["runtime_state"],
          sinceMsec: 500
        }
      });
      assert.match(toolResponse.result.content[0].text, /"currentScene":"res:\/\/scenes\/main\.tscn"/);

      const resourceResponse = await server.request("resources/read", {
        uri: "godot://runtime/events",
        arguments: {}
      });
      assert.match(resourceResponse.result.contents[0].text, /"kind":"session_started"/);
      assert.deepEqual(seenUrls, [
        "/runtime/events?limit=10&kinds=runtime_state&sinceMsec=500",
        "/runtime/events"
      ]);
    } finally {
      await server.close();
    }
  });
});
