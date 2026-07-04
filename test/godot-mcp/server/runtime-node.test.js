import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards get_runtime_node_properties calls to the editor bridge", async () => {
  const seenUrls = [];

  await withBridgeServer(async (req, res) => {
    seenUrls.push(req.url);

    if (req.url === "/runtime/node/properties?nodePath=%2Froot%2FRuntimeSmoke&refresh=true" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          nodePath: "/root/RuntimeSmoke",
          requestId: "node_properties:1",
          pending: true,
          responses: []
        }
      }));
      return;
    }

    if (req.url === "/runtime/node/properties?nodePath=%2Froot%2FRuntimeSmoke&refresh=false&requestId=node_properties%3A1" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          nodePath: "/root/RuntimeSmoke",
          requestId: "node_properties:1",
          pending: false,
          responses: [
            {
              sessionId: 0,
              exists: true,
              type: "Node",
              properties: [
                {
                  name: "name",
                  type: "String",
                  value: "RuntimeSmoke"
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
        name: "get_runtime_node_properties",
        arguments: {
          nodePath: "/root/RuntimeSmoke",
          timeoutMsec: 1000,
          pollIntervalMsec: 1
        }
      });

      assert.match(response.result.content[0].text, /"nodePath":"\/root\/RuntimeSmoke"/);
      assert.match(response.result.content[0].text, /"value":"RuntimeSmoke"/);
      assert.deepEqual(seenUrls, [
        "/runtime/node/properties?nodePath=%2Froot%2FRuntimeSmoke&refresh=true",
        "/runtime/node/properties?nodePath=%2Froot%2FRuntimeSmoke&refresh=false&requestId=node_properties%3A1"
      ]);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards set_runtime_node_property calls to the editor bridge", async () => {
  const seenRequests = [];

  await withBridgeServer(async (req, res) => {
    seenRequests.push({ method: req.method, url: req.url });

    if (req.url === "/runtime/node/property/set" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      assert.deepEqual(body, {
        nodePath: "/root/RuntimeSmoke",
        property: "name",
        value: "RuntimeSmokeRenamed"
      });
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          requestId: "set_node_property:1",
          pending: true,
          responses: []
        }
      }));
      return;
    }

    if (req.url === "/runtime/node/property/set/result?requestId=set_node_property%3A1" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          requestId: "set_node_property:1",
          pending: false,
          responses: [
            {
              sessionId: 0,
              nodePath: "/root/RuntimeSmoke",
              property: "name",
              exists: true,
              set: true,
              value: "RuntimeSmokeRenamed"
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
        name: "set_runtime_node_property",
        arguments: {
          nodePath: "/root/RuntimeSmoke",
          property: "name",
          value: "RuntimeSmokeRenamed",
          timeoutMsec: 1000,
          pollIntervalMsec: 1
        }
      });

      assert.match(response.result.content[0].text, /"set":true/);
      assert.match(response.result.content[0].text, /"value":"RuntimeSmokeRenamed"/);
      assert.deepEqual(seenRequests, [
        { method: "POST", url: "/runtime/node/property/set" },
        { method: "GET", url: "/runtime/node/property/set/result?requestId=set_node_property%3A1" }
      ]);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards call_runtime_node_method calls to the editor bridge", async () => {
  const seenRequests = [];

  await withBridgeServer(async (req, res) => {
    seenRequests.push({ method: req.method, url: req.url });

    if (req.url === "/runtime/node/method/call" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      assert.deepEqual(body, {
        nodePath: "/root/RuntimeSmoke",
        method: "take_damage",
        args: [5, { type: "Vector3", x: 1, y: 2, z: 3 }]
      });
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          requestId: "call_node_method:1",
          pending: true,
          responses: []
        }
      }));
      return;
    }

    if (req.url === "/runtime/node/method/call/result?requestId=call_node_method%3A1" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          requestId: "call_node_method:1",
          pending: false,
          responses: [
            {
              sessionId: 0,
              nodePath: "/root/RuntimeSmoke",
              method: "take_damage",
              exists: true,
              called: true,
              returnValue: 95,
              returnType: "int"
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
        name: "call_runtime_node_method",
        arguments: {
          nodePath: "/root/RuntimeSmoke",
          method: "take_damage",
          args: [5, { type: "Vector3", x: 1, y: 2, z: 3 }],
          timeoutMsec: 1000,
          pollIntervalMsec: 1
        }
      });

      assert.match(response.result.content[0].text, /"called":true/);
      assert.match(response.result.content[0].text, /"returnValue":95/);
      assert.deepEqual(seenRequests, [
        { method: "POST", url: "/runtime/node/method/call" },
        { method: "GET", url: "/runtime/node/method/call/result?requestId=call_node_method%3A1" }
      ]);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards send_runtime_input calls to the editor bridge", async () => {
  const seenRequests = [];

  await withBridgeServer(async (req, res) => {
    seenRequests.push({ method: req.method, url: req.url });

    if (req.url === "/runtime/input/send" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      assert.deepEqual(body, {
        actions: [{ action: "move_forward", pressed: true }],
        holdMs: 1000,
        mouseMotion: { dx: 12, dy: -4 }
      });
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          requestId: "send_input:1",
          pending: true,
          responses: []
        }
      }));
      return;
    }

    if (req.url === "/runtime/input/send/result?requestId=send_input%3A1" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          requestId: "send_input:1",
          pending: false,
          responses: [
            {
              sessionId: 0,
              requestId: "send_input:1",
              ok: true,
              applied: {
                actions: [{ action: "move_forward", pressed: true, strength: 1.0 }],
                mouseMotion: { dx: 12, dy: -4 },
                heldMs: 1000
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
        name: "send_runtime_input",
        arguments: {
          actions: [{ action: "move_forward", pressed: true }],
          holdMs: 1000,
          mouseMotion: { dx: 12, dy: -4 },
          timeoutMsec: 1000,
          pollIntervalMsec: 1
        }
      });

      assert.match(response.result.content[0].text, /"heldMs":1000/);
      assert.match(response.result.content[0].text, /"action":"move_forward"/);
      assert.deepEqual(seenRequests, [
        { method: "POST", url: "/runtime/input/send" },
        { method: "GET", url: "/runtime/input/send/result?requestId=send_input%3A1" }
      ]);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards capture_runtime_screenshot calls to the editor bridge", async () => {
  const seenRequests = [];

  await withBridgeServer(async (req, res) => {
    seenRequests.push({ method: req.method, url: req.url });

    if (req.url === "/runtime/screenshot" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      assert.deepEqual(JSON.parse(Buffer.concat(chunks).toString("utf8")), {});
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          requestId: "runtime_screenshot:1",
          pending: true,
          responses: []
        }
      }));
      return;
    }

    if (req.url === "/runtime/screenshot/result?requestId=runtime_screenshot%3A1" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          available: true,
          requestId: "runtime_screenshot:1",
          pending: false,
          responses: [
            {
              sessionId: 0,
              available: true,
              width: 64,
              height: 64,
              mimeType: "image/png",
              encoding: "base64",
              data: "iVBORw0KGgo="
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
        name: "capture_runtime_screenshot",
        arguments: {
          timeoutMsec: 1000,
          pollIntervalMsec: 1
        }
      });

      assert.match(response.result.content[0].text, /"mimeType":"image\/png"/);
      assert.match(response.result.content[0].text, /"encoding":"base64"/);
      assert.deepEqual(seenRequests, [
        { method: "POST", url: "/runtime/screenshot" },
        { method: "GET", url: "/runtime/screenshot/result?requestId=runtime_screenshot%3A1" }
      ]);
    } finally {
      await server.close();
    }
  });
});
