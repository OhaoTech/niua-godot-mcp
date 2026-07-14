import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  bridgeSessionPath,
  clearBridgeSession,
  loadBridgeSession,
  writeBridgeSession
} from "../../../src/godot-mcp/services/bridge-session.js";
import { resolveBridgeConnection, resolveBridgeToken } from "../../../src/godot-mcp/services/bridge-auth.js";
import { connect } from "../../../src/godot-mcp/sdk/index.js";

test("write/load/clear bridge session under .godot", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "niua-session-"));
  try {
    const filePath = writeBridgeSession(root, {
      host: "127.0.0.1",
      port: 9199,
      token: "secret-token"
    });
    assert.equal(filePath, bridgeSessionPath(root));
    assert.match(filePath, /\.godot[/\\]niua_mcp_bridge\.json$/);

    const raw = JSON.parse(await readFile(filePath, "utf8"));
    assert.equal(raw.port, 9199);
    assert.equal(raw.token, "secret-token");

    const loaded = loadBridgeSession(root);
    assert.equal(loaded.port, 9199);
    assert.equal(loaded.token, "secret-token");

    assert.equal(clearBridgeSession(root), true);
    assert.equal(loadBridgeSession(root), null);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("resolveBridgeToken prefers project session over empty env", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "niua-session-tok-"));
  const prev = process.env.GODOT_MCP_TOKEN;
  delete process.env.GODOT_MCP_TOKEN;
  delete process.env.NIUA_MCP_TOKEN;
  try {
    writeBridgeSession(root, { host: "127.0.0.1", port: 9174, token: "from-file" });
    assert.equal(
      resolveBridgeToken({ host: "127.0.0.1", port: 9174, expectedProjectRoot: root }),
      "from-file"
    );
  } finally {
    if (prev === undefined) delete process.env.GODOT_MCP_TOKEN;
    else process.env.GODOT_MCP_TOKEN = prev;
    await rm(root, { recursive: true, force: true });
  }
});

test("connect() auto-loads token from project session without env", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "niua-session-sdk-"));
  const prev = process.env.GODOT_MCP_TOKEN;
  delete process.env.GODOT_MCP_TOKEN;
  delete process.env.NIUA_MCP_TOKEN;
  try {
    writeBridgeSession(root, { host: "127.0.0.1", port: 9321, token: "sdk-auto" });
    const godot = connect({
      expectedProjectRoot: root,
      tools: [
        {
          name: "get_godot_version",
          category: "runtime",
          handler: async (args) => ({ ok: true, token: args.token, port: args.port })
        }
      ]
    });
    assert.equal(godot.connection.token, "sdk-auto");
    assert.equal(godot.connection.port, 9321);
    assert.equal(godot.connection.fromSession, true);

    const result = await godot.runtime.get_godot_version({});
    assert.equal(result.token, "sdk-auto");
  } finally {
    if (prev === undefined) delete process.env.GODOT_MCP_TOKEN;
    else process.env.GODOT_MCP_TOKEN = prev;
    await rm(root, { recursive: true, force: true });
  }
});

test("resolveBridgeConnection fills host/port from session", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "niua-session-conn-"));
  try {
    writeBridgeSession(root, { host: "127.0.0.1", port: 9401, token: "t" });
    const conn = resolveBridgeConnection({ expectedProjectRoot: root });
    assert.equal(conn.port, 9401);
    assert.equal(conn.token, "t");
    assert.equal(conn.fromSession, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
