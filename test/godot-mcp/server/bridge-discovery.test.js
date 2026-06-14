import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server discovers active editor bridges and matches known projects", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-bridge-discovery-"));
  const projectRoot = path.join(allowedRoot, "bridge-demo");
  const registryFile = path.join(allowedRoot, "registry.json");
  let bridgePort = 0;

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Bridge Demo\"",
      ""
    ].join("\n"));

    await withBridgeServer((req, res) => {
      res.setHeader("content-type", "application/json");
      if (req.url === "/health") {
        res.end(JSON.stringify({
          ok: true,
          data: {
            status: "ready",
            host: "127.0.0.1",
            port: bridgePort,
            readEndpoints: ["/health", "/project/info"],
            writeEndpoints: []
          }
        }));
        return;
      }

      if (req.url === "/project/info") {
        res.end(JSON.stringify({
          ok: true,
          data: {
            projectRoot,
            projectName: "Bridge Demo",
            godotVersion: { string: "4.6.2.test" }
          }
        }));
        return;
      }

      res.statusCode = 404;
      res.end(JSON.stringify({ ok: false, error: "not found" }));
    }, async (port) => {
      bridgePort = port;
      const server = createMcpProcess({
        GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
        GODOT_MCP_PROJECT_REGISTRY: registryFile
      });

      try {
        await server.request("tools/call", {
          name: "import_project",
          arguments: {
            projectRoot
          }
        });

        const response = await server.request("tools/call", {
          name: "discover_editor_bridges",
          arguments: {
            ports: [bridgePort],
            timeoutMs: 1000
          }
        });
        const payload = JSON.parse(response.result.content[0].text);

        assert.equal(payload.ok, true);
        assert.equal(payload.data.bridges.length, 1);
        assert.equal(payload.data.bridges[0].host, "127.0.0.1");
        assert.equal(payload.data.bridges[0].port, bridgePort);
        assert.equal(payload.data.bridges[0].health.status, "ready");
        assert.equal(payload.data.bridges[0].project.projectRoot, projectRoot);
        assert.equal(payload.data.bridges[0].project.projectName, "Bridge Demo");
        assert.equal(payload.data.bridges[0].knownProject.projectRoot, projectRoot);
        assert.equal(payload.data.bridges[0].openProject, null);
      } finally {
        await server.close();
      }
    });
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server reports unavailable bridge discovery probes when requested", async () => {
  await withBridgeServer((_req, res) => {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: false,
      data: {
        status: "plain-http"
      }
    }));
  }, async (plainPort) => {
    const server = createMcpProcess();

    try {
      const response = await server.request("tools/call", {
        name: "discover_editor_bridges",
        arguments: {
          ports: [plainPort],
          includeUnavailable: true,
          timeoutMs: 200
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.bridges.length, 0);
      assert.equal(payload.data.probes.length, 1);
      assert.equal(payload.data.probes[0].available, false);
      assert.equal(payload.data.probes[0].port, plainPort);
      assert.match(payload.data.probes[0].error, /not a NIUA Godot bridge/);
    } finally {
      await server.close();
    }
  });
});
