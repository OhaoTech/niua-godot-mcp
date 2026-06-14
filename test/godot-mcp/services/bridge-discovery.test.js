import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  discoverEditorBridges
} from "../../../src/godot-mcp/services/bridge-discovery.js";

async function readServiceSource(file) {
  return readFile(new URL(`../../../src/godot-mcp/services/${file}`, import.meta.url), "utf8");
}

async function withJsonBridge(run) {
  const server = createServer((req, res) => {
    res.setHeader("content-type", "application/json");

    if (req.url === "/health") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          status: "ok",
          service: "niua-godot-mcp"
        }
      }));
      return;
    }

    if (req.url === "/project/info") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          projectRoot: "/tmp/niua-bridge-project",
          name: "Bridge Project"
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  });
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

test("bridge discovery delegates port probe and result domains", async () => {
  const facade = await readServiceSource("bridge-discovery.js");
  const ports = await readServiceSource("bridge-discovery/ports.js");
  const probe = await readServiceSource("bridge-discovery/probe.js");
  const results = await readServiceSource("bridge-discovery/results.js");

  assert.match(facade, /from "\.\/bridge-discovery\/ports\.js"/);
  assert.match(facade, /from "\.\/bridge-discovery\/probe\.js"/);
  assert.match(facade, /from "\.\/bridge-discovery\/results\.js"/);
  assert.doesNotMatch(facade, /export function bridgeDiscoveryPorts/);
  assert.doesNotMatch(facade, /fetchWithTimeout/);
  assert.doesNotMatch(facade, /knownProjectByRoot/);

  assert.match(ports, /export function bridgeDiscoveryPorts/);
  assert.match(ports, /export function bridgeDiscoveryRange/);
  assert.match(ports, /export function parseDiscoveryPorts/);
  assert.match(ports, /export function uniquePorts/);
  assert.match(ports, /openProjectProcesses/);

  assert.match(probe, /export async function probeEditorBridge/);
  assert.match(probe, /export async function fetchJsonFromBridge/);
  assert.match(probe, /fetchWithTimeout/);
  assert.match(probe, /not a NIUA Godot bridge/);

  assert.match(results, /export function buildBridgeDiscoveryData/);
  assert.match(results, /knownProjectByRoot/);
  assert.match(results, /openProjectByRoot/);
  assert.match(results, /bridges\.sort/);
});

test("discoverEditorBridges probes explicit bridge ports", async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), "niua-godot-bridge-discovery-"));
  const previousRegistry = process.env.GODOT_MCP_PROJECT_REGISTRY;
  process.env.GODOT_MCP_PROJECT_REGISTRY = path.join(workspace, "registry.json");

  try {
    await withJsonBridge(async (port) => {
      const result = await discoverEditorBridges({
        host: "127.0.0.1",
        ports: [port],
        timeoutMs: 500
      });

      assert.equal(result.ok, true);
      assert.equal(result.data.bridges.length, 1);
      assert.equal(result.data.bridges[0].port, port);
      assert.equal(result.data.bridges[0].health.status, "ok");
      assert.equal(result.data.bridges[0].project.name, "Bridge Project");
    });
  } finally {
    if (previousRegistry === undefined) {
      delete process.env.GODOT_MCP_PROJECT_REGISTRY;
    } else {
      process.env.GODOT_MCP_PROJECT_REGISTRY = previousRegistry;
    }
    await rm(workspace, { recursive: true, force: true });
  }
});
