import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  createFakeGodotExecutable,
  createMcpProcess,
  getFreeHttpPort,
  waitForFileText
} from "../helpers/server-harness.js";

test("Godot MCP server rejects opening projects outside allowed roots", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-allowed-"));
  const outsideRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-outside-"));

  try {
    const server = createMcpProcess({
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot
    });

    try {
      const response = await server.request("tools/call", {
        name: "open_project",
        arguments: {
          projectRoot: path.join(outsideRoot, "demo")
        }
      });

      assert.equal(response.error.code, -32000);
      assert.match(response.error.message, /outside allowed project roots/);
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
    await rm(outsideRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server passes requested bridge ports to launched editors", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-port-"));
  const projectRoot = path.join(allowedRoot, "demo");
  const bridgePort = await getFreeHttpPort();

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Bridge Port Demo\"",
      ""
    ].join("\n"));

    const { fakeGodot, logPath } = await createFakeGodotExecutable(allowedRoot);
    const server = createMcpProcess({
      GODOT_BIN: fakeGodot,
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json"),
      NIUA_FAKE_GODOT_LOG: logPath
    });

    try {
      const openResponse = await server.request("tools/call", {
        name: "open_project",
        arguments: {
          projectRoot,
          headless: true,
          installAddon: false,
          waitForBridge: false,
          bridgePort
        }
      });
      const openPayload = JSON.parse(openResponse.result.content[0].text);
      assert.equal(openPayload.data.bridge.port, bridgePort);

      const logText = await waitForFileText(logPath);
      const fakeLaunch = JSON.parse(logText.trim().split("\n").at(-1));
      assert.equal(fakeLaunch.env.NIUA_MCP_PORT, String(bridgePort));
      assert.equal(fakeLaunch.env.GODOT_MCP_PORT, String(bridgePort));
      assert.match(fakeLaunch.env.NIUA_MCP_TOKEN, /^[A-Za-z0-9_-]{32,}$/);
      assert.equal(fakeLaunch.env.GODOT_MCP_TOKEN, fakeLaunch.env.NIUA_MCP_TOKEN);
      assert.equal(openPayload.data.bridge.tokenConfigured, true);
      assert.equal("token" in openPayload.data.bridge, false);

      await server.request("tools/call", {
        name: "close_project",
        arguments: {
          projectId: openPayload.data.projectId,
          timeoutMs: 2000
        }
      });
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server can default editor launches to headless from the environment", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-headless-env-"));
  const projectRoot = path.join(allowedRoot, "demo");

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Headless Env Demo\"",
      ""
    ].join("\n"));

    const { fakeGodot, logPath } = await createFakeGodotExecutable(allowedRoot);
    const server = createMcpProcess({
      GODOT_BIN: fakeGodot,
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_HEADLESS: "1",
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json"),
      NIUA_FAKE_GODOT_LOG: logPath
    });

    try {
      const openResponse = await server.request("tools/call", {
        name: "open_project",
        arguments: {
          projectRoot,
          installAddon: false,
          waitForBridge: false
        }
      });
      const openPayload = JSON.parse(openResponse.result.content[0].text);
      assert.equal(openPayload.data.headless, true);

      const logText = await waitForFileText(logPath);
      const fakeLaunch = JSON.parse(logText.trim().split("\n").at(-1));
      assert.equal(fakeLaunch.argv[0], "--headless");

      await server.request("tools/call", {
        name: "close_project",
        arguments: {
          projectId: openPayload.data.projectId,
          timeoutMs: 2000
        }
      });
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server negotiates a free bridge port when the preferred port is occupied", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-port-"));
  const projectRoot = path.join(allowedRoot, "demo");
  const occupiedServer = createServer((_req, res) => res.end("occupied"));
  await new Promise((resolve) => occupiedServer.listen(0, "127.0.0.1", resolve));
  const occupiedPort = occupiedServer.address().port;

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Negotiated Port Demo\"",
      ""
    ].join("\n"));

    const { fakeGodot, logPath } = await createFakeGodotExecutable(allowedRoot);
    const server = createMcpProcess({
      GODOT_BIN: fakeGodot,
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PORT: String(occupiedPort),
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json"),
      NIUA_FAKE_GODOT_LOG: logPath
    });

    try {
      const openResponse = await server.request("tools/call", {
        name: "open_project",
        arguments: {
          projectRoot,
          headless: true,
          installAddon: false,
          waitForBridge: false
        }
      });
      const openPayload = JSON.parse(openResponse.result.content[0].text);
      assert.notEqual(openPayload.data.bridge.port, occupiedPort);
      assert.equal(openPayload.data.bridge.port > 0, true);

      const logText = await waitForFileText(logPath);
      const fakeLaunch = JSON.parse(logText.trim().split("\n").at(-1));
      assert.equal(fakeLaunch.env.NIUA_MCP_PORT, String(openPayload.data.bridge.port));
      assert.equal(fakeLaunch.env.GODOT_MCP_PORT, String(openPayload.data.bridge.port));
      assert.match(fakeLaunch.env.NIUA_MCP_TOKEN, /^[A-Za-z0-9_-]{32,}$/);
      assert.equal(fakeLaunch.env.GODOT_MCP_TOKEN, fakeLaunch.env.NIUA_MCP_TOKEN);
      assert.equal(openPayload.data.bridge.tokenConfigured, true);
      assert.equal("token" in openPayload.data.bridge, false);

      await server.request("tools/call", {
        name: "close_project",
        arguments: {
          projectId: openPayload.data.projectId,
          timeoutMs: 2000
        }
      });
    } finally {
      await server.close();
    }
  } finally {
    await new Promise((resolve) => occupiedServer.close(resolve));
    await rm(allowedRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server preserves negotiated bridge metadata after health polling", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-polled-port-"));
  const projectRoot = path.join(allowedRoot, "demo");
  const occupiedServer = createServer((_req, res) => res.end("occupied"));
  await new Promise((resolve) => occupiedServer.listen(0, "127.0.0.1", resolve));
  const occupiedPort = occupiedServer.address().port;
  let bridgeServer = null;

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Polled Negotiated Port Demo\"",
      ""
    ].join("\n"));

    const { fakeGodot, logPath } = await createFakeGodotExecutable(allowedRoot);
    const server = createMcpProcess({
      GODOT_BIN: fakeGodot,
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PORT: String(occupiedPort),
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json"),
      NIUA_FAKE_GODOT_LOG: logPath
    });

    try {
      const openPromise = server.request("tools/call", {
        name: "open_project",
        arguments: {
          projectRoot,
          headless: true,
          installAddon: false,
          waitForBridge: true,
          timeoutMs: 2000
        }
      });

      const logText = await waitForFileText(logPath);
      const fakeLaunch = JSON.parse(logText.trim().split("\n").at(-1));
      const negotiatedPort = Number(fakeLaunch.env.NIUA_MCP_PORT);
      const token = fakeLaunch.env.NIUA_MCP_TOKEN;
      bridgeServer = createServer((req, res) => {
        res.setHeader("content-type", "application/json");
        if (req.headers["x-niua-mcp-token"] !== token) {
          res.statusCode = 401;
          res.end(JSON.stringify({ ok: false, error: "missing token" }));
          return;
        }
        res.end(JSON.stringify({ ok: true, data: { status: "ready" } }));
      });
      await new Promise((resolve) => bridgeServer.listen(negotiatedPort, "127.0.0.1", resolve));

      const openResponse = await openPromise;
      const openPayload = JSON.parse(openResponse.result.content[0].text);
      assert.equal(openPayload.data.bridge.requestedPort, occupiedPort);
      assert.equal(openPayload.data.bridge.negotiated, true);
      assert.equal(openPayload.data.bridge.port, negotiatedPort);
      assert.equal(openPayload.data.bridge.available, true);

      await server.request("tools/call", {
        name: "close_project",
        arguments: {
          projectId: openPayload.data.projectId,
          timeoutMs: 2000
        }
      });
    } finally {
      await server.close();
    }
  } finally {
    if (bridgeServer) {
      await new Promise((resolve) => bridgeServer.close(resolve));
    }
    await new Promise((resolve) => occupiedServer.close(resolve));
    await rm(allowedRoot, { recursive: true, force: true });
  }
});
