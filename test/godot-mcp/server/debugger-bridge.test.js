import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards get_debugger_state calls to the editor bridge", async () => {
  await withBridgeServer(async (req, res) => {
    if (req.url === "/debugger/state" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          sessions: [{ id: 0, active: true, debuggable: true, breaked: false }],
          breakpoints: [{ path: "res://player.gd", line: 12, raw: "res://player.gd:12" }],
          monitors: { timeFps: 60 }
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
        name: "get_debugger_state",
        arguments: {}
      });

      assert.match(response.result.content[0].text, /"sessions"/);
      assert.match(response.result.content[0].text, /"breakpoints"/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards set_debugger_breakpoint calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/debugger/breakpoint/set" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          requestedBreakpoint: {
            path: "res://player.gd",
            line: 12,
            enabled: false,
            appliedSessions: [0]
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
        name: "set_debugger_breakpoint",
        arguments: {
          path: "res://player.gd",
          line: 12,
          enabled: false
        }
      });

      assert.match(response.result.content[0].text, /"appliedSessions"/);
      assert.deepEqual(receivedBody, {
        path: "res://player.gd",
        line: 12,
        enabled: false
      });
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards toggle_debugger_profiler calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/debugger/profiler/toggle" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          requestedProfiler: {
            profiler: "scripts",
            enabled: false,
            data: [],
            appliedSessions: [0]
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
        name: "toggle_debugger_profiler",
        arguments: {
          profiler: "scripts",
          enabled: false
        }
      });

      assert.match(response.result.content[0].text, /"requestedProfiler"/);
      assert.deepEqual(receivedBody, {
        profiler: "scripts",
        enabled: false
      });
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards send_debugger_message calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/debugger/message/send" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          requestedMessage: {
            message: "niua_mcp:snapshot",
            data: [],
            activeOnly: true,
            requestedSessions: [0]
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
        name: "send_debugger_message",
        arguments: {
          message: "niua_mcp:snapshot"
        }
      });

      assert.match(response.result.content[0].text, /"requestedMessage"/);
      assert.deepEqual(receivedBody, {
        message: "niua_mcp:snapshot"
      });
    } finally {
      await server.close();
    }
  });
});
