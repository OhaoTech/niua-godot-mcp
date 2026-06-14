import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  isPortAvailable,
  resolveBridgePort
} from "../../../src/godot-mcp/services/process-manager.js";

const serviceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../src/godot-mcp/services");

async function readServiceSource(name) {
  return readFile(path.join(serviceRoot, name), "utf8");
}

async function withOccupiedPort(run) {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  try {
    return await run(port);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

test("resolveBridgePort negotiates a free port when the preferred port is occupied", async () => {
  const previousPort = process.env.GODOT_MCP_PORT;

  try {
    await withOccupiedPort(async (occupiedPort) => {
      process.env.GODOT_MCP_PORT = String(occupiedPort);

      const selection = await resolveBridgePort({ bridgeHost: "127.0.0.1" });

      assert.equal(selection.requestedPort, occupiedPort);
      assert.equal(selection.source, "allocated");
      assert.equal(selection.negotiated, true);
      assert.notEqual(selection.port, occupiedPort);
      assert.equal(await isPortAvailable(selection.port, "127.0.0.1"), true);
    });
  } finally {
    if (previousPort === undefined) {
      delete process.env.GODOT_MCP_PORT;
    } else {
      process.env.GODOT_MCP_PORT = previousPort;
    }
  }
});

test("process manager delegates focused service domains", async () => {
  const facade = await readServiceSource("process-manager.js");
  const store = await readServiceSource("process-store.js");
  const logs = await readServiceSource("process-logs.js");
  const wait = await readServiceSource("process-wait.js");
  const bridge = await readServiceSource("bridge-health.js");
  const bridgePorts = await readServiceSource("bridge-health/ports.js");
  const bridgePolling = await readServiceSource("bridge-health/polling.js");

  assert.match(facade, /from "\.\/process-store\.js"/);
  assert.match(facade, /from "\.\/process-logs\.js"/);
  assert.match(facade, /from "\.\/process-wait\.js"/);
  assert.match(facade, /from "\.\/bridge-health\.js"/);
  assert.doesNotMatch(facade, /new Map/);
  assert.doesNotMatch(facade, /createNetServer/);
  assert.doesNotMatch(facade, /appendProcessOutput\(entry, stream, chunk\)/);
  assert.doesNotMatch(facade, /fetchWithTimeout\(url, timeoutMs\)/);

  assert.match(store, /export const openProjectProcesses = new Map\(\)/);
  assert.match(store, /export function findOpenProjectEntry/);
  assert.match(store, /export function getRunningProjectByRoot/);
  assert.match(store, /export function openProjectByRoot/);
  assert.match(store, /export function serializeProjectProcess/);

  assert.match(logs, /export function selectedProcessLogEntries/);
  assert.match(logs, /export function serializeProjectProcessLogs/);
  assert.match(logs, /export function appendProcessOutput/);
  assert.match(logs, /entry\[stream\]\.push/);
  assert.match(logs, /entry\[stream\]\.splice/);

  assert.match(wait, /export async function waitForChildSpawn/);
  assert.match(wait, /export async function waitForProjectExit/);
  assert.match(wait, /child\.once\("spawn"/);
  assert.match(wait, /entry\.child\.once\("exit"/);

  assert.match(bridge, /from "\.\/bridge-health\/ports\.js"/);
  assert.match(bridge, /from "\.\/bridge-health\/polling\.js"/);
  assert.doesNotMatch(bridge, /createServer as createNetServer/);
  assert.doesNotMatch(bridge, /export async function resolveBridgePort/);
  assert.doesNotMatch(bridge, /export async function pollBridgeHealth/);

  assert.match(bridgePorts, /createServer as createNetServer/);
  assert.match(bridgePorts, /export async function resolveBridgePort/);
  assert.match(bridgePorts, /export function normalizePort/);
  assert.match(bridgePorts, /export async function isPortAvailable/);
  assert.match(bridgePorts, /export async function allocateFreePort/);

  assert.match(bridgePolling, /export async function pollBridgeHealth/);
  assert.match(bridgePolling, /export async function fetchWithTimeout/);
  assert.match(bridgePolling, /AbortController/);
  assert.match(bridgePolling, /function sleep/);
});
