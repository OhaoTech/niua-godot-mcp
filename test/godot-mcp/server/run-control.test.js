import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards run settings and main scene calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/run/settings" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          mainScene: "res://scenes/main.tscn",
          mainSceneExists: true
        }
      }));
      return;
    }

    if (req.url === "/run/main-scene/set" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          mainScene: "res://scenes/main.tscn",
          mainSceneExists: true,
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
      const settingsResponse = await server.request("tools/call", {
        name: "get_run_settings",
        arguments: {}
      });
      assert.match(settingsResponse.result.content[0].text, /"mainScene":"res:\/\/scenes\/main\.tscn"/);

      const setResponse = await server.request("tools/call", {
        name: "set_main_scene",
        arguments: {
          path: "res://scenes/main.tscn",
          save: true
        }
      });

      assert.match(setResponse.result.content[0].text, /"saved":true/);
      assert.deepEqual(receivedBody, {
        path: "res://scenes/main.tscn",
        save: true
      });
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server exposes run settings as a resource", async () => {
  await withBridgeServer(async (req, res) => {
    if (req.url === "/run/settings" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          mainScene: "res://scenes/main.tscn",
          mainSceneExists: true
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      const resourceResponse = await server.request("resources/read", {
        uri: "godot://run/settings"
      });

      assert.match(resourceResponse.result.contents[0].text, /"mainScene":"res:\/\/scenes\/main\.tscn"/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards run_custom_scene calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/run/custom" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          playing: true,
          playingScene: "res://scenes/smoke.tscn"
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
        name: "run_custom_scene",
        arguments: {
          path: "res://scenes/smoke.tscn",
          saveBeforeRun: true
        }
      });

      assert.match(response.result.content[0].text, /"playing":true/);
      assert.deepEqual(receivedBody, {
        path: "res://scenes/smoke.tscn",
        saveBeforeRun: true
      });
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server rejects run calls when expected project root does not match the bridge", async () => {
  let runCalls = 0;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/project/info" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          projectRoot: "/tmp/qsim",
          projectName: "Qsim"
        }
      }));
      return;
    }

    if (req.url === "/run/main" && req.method === "POST") {
      runCalls += 1;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          playing: true
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
        name: "run_main_scene",
        arguments: {
          expectedProjectRoot: "/tmp/moonwell"
        }
      });

      assert.equal(runCalls, 0);
      assert.equal(response.error.code, -32000);
      assert.match(response.error.message, /project root mismatch/);
      assert.match(response.error.message, /\/tmp\/moonwell/);
      assert.match(response.error.message, /\/tmp\/qsim/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server forwards reload_running_scene calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/run/reload" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          requestedReload: true,
          previousScene: "res://scenes/main.tscn",
          mode: "reload"
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
        name: "reload_running_scene",
        arguments: {
          saveBeforeRun: true
        }
      });

      assert.deepEqual(receivedBody, { saveBeforeRun: true });
      assert.match(response.result.content[0].text, /"requestedReload":true/);
    } finally {
      await server.close();
    }
  });
});
