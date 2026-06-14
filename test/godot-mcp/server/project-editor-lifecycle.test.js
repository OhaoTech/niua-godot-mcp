import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  createFakeGodotExecutable,
  createMcpProcess,
  waitForFileText
} from "../helpers/server-harness.js";

test("Godot MCP server opens, lists, and closes project editor processes", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-lifecycle-"));
  const projectRoot = path.join(allowedRoot, "demo");

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Lifecycle Demo\"",
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
          waitForBridge: false
        }
      });
      const openPayload = JSON.parse(openResponse.result.content[0].text);

      assert.equal(openPayload.ok, true);
      assert.equal(openPayload.data.projectRoot, projectRoot);
      assert.equal(openPayload.data.status, "running");
      assert.equal(typeof openPayload.data.projectId, "string");
      assert.equal(typeof openPayload.data.pid, "number");

      const logText = await waitForFileText(logPath);
      const fakeLaunch = JSON.parse(logText.trim().split("\n").at(-1));
      assert.deepEqual(fakeLaunch.argv, [
        "--headless",
        "--path",
        projectRoot,
        "--editor"
      ]);

      const listResponse = await server.request("tools/call", {
        name: "get_open_projects",
        arguments: {
          activeOnly: true
        }
      });
      const listPayload = JSON.parse(listResponse.result.content[0].text);
      assert.equal(listPayload.ok, true);
      assert.deepEqual(listPayload.data.projects.map((project) => project.projectId), [
        openPayload.data.projectId
      ]);
      assert.equal(listPayload.data.projects[0].status, "running");

      const closeResponse = await server.request("tools/call", {
        name: "close_project",
        arguments: {
          projectId: openPayload.data.projectId,
          timeoutMs: 2000
        }
      });
      const closePayload = JSON.parse(closeResponse.result.content[0].text);
      assert.equal(closePayload.ok, true);
      assert.equal(closePayload.data.projectId, openPayload.data.projectId);
      assert.equal(closePayload.data.status, "exited");

      const closedListResponse = await server.request("tools/call", {
        name: "get_open_projects",
        arguments: {
          activeOnly: true
        }
      });
      const closedListPayload = JSON.parse(closedListResponse.result.content[0].text);
      assert.deepEqual(closedListPayload.data.projects, []);
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server closes the current running editor after reopening the same project root", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-reopen-close-"));
  const projectRoot = path.join(allowedRoot, "demo");

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Reopen Close Demo\"",
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
      const firstOpenResponse = await server.request("tools/call", {
        name: "open_project",
        arguments: {
          projectRoot,
          headless: true,
          installAddon: false,
          waitForBridge: false
        }
      });
      const firstOpenPayload = JSON.parse(firstOpenResponse.result.content[0].text);

      const firstCloseResponse = await server.request("tools/call", {
        name: "close_project",
        arguments: {
          projectRoot,
          timeoutMs: 2000
        }
      });
      const firstClosePayload = JSON.parse(firstCloseResponse.result.content[0].text);
      assert.equal(firstClosePayload.data.projectId, firstOpenPayload.data.projectId);
      assert.equal(firstClosePayload.data.status, "exited");

      const secondOpenResponse = await server.request("tools/call", {
        name: "open_project",
        arguments: {
          projectRoot,
          headless: true,
          installAddon: false,
          waitForBridge: false,
          reuseExisting: false
        }
      });
      const secondOpenPayload = JSON.parse(secondOpenResponse.result.content[0].text);
      assert.notEqual(secondOpenPayload.data.projectId, firstOpenPayload.data.projectId);

      const secondCloseResponse = await server.request("tools/call", {
        name: "close_project",
        arguments: {
          projectRoot,
          timeoutMs: 2000
        }
      });
      const secondClosePayload = JSON.parse(secondCloseResponse.result.content[0].text);
      assert.equal(secondClosePayload.data.projectId, secondOpenPayload.data.projectId);
      assert.equal(secondClosePayload.data.status, "exited");

      const listResponse = await server.request("tools/call", {
        name: "get_open_projects",
        arguments: {
          activeOnly: true
        }
      });
      const listPayload = JSON.parse(listResponse.result.content[0].text);
      assert.deepEqual(listPayload.data.projects, []);
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server includes launched editor process output in get_output_logs", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-logs-"));
  const projectRoot = path.join(allowedRoot, "demo");

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Logs Demo\"",
      ""
    ].join("\n"));

    const { fakeGodot, logPath } = await createFakeGodotExecutable(allowedRoot);
    const server = createMcpProcess({
      GODOT_BIN: fakeGodot,
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json"),
      NIUA_FAKE_GODOT_LOG: logPath,
      NIUA_FAKE_GODOT_STDOUT: "EDITOR STDOUT READY",
      NIUA_FAKE_GODOT_STDERR: "EDITOR STDERR WARNING"
    });
    let projectId = null;

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
      projectId = openPayload.data.projectId;

      let payload = null;
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const response = await server.request("tools/call", {
          name: "get_output_logs",
          arguments: {
            projectId,
            includeBridge: false
          }
        });
        assert.equal(response.error, undefined);
        payload = JSON.parse(response.result.content[0].text);
        if (payload.data.stdout.includes("EDITOR STDOUT READY")
          && payload.data.stderr.includes("EDITOR STDERR WARNING")) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 25));
      }

      assert.equal(payload.ok, true);
      assert.equal(payload.data.bridge.available, false);
      assert.deepEqual(payload.data.logs, []);
      assert.deepEqual(payload.data.stdout, ["EDITOR STDOUT READY"]);
      assert.deepEqual(payload.data.stderr, ["EDITOR STDERR WARNING"]);
      assert.equal(payload.data.processLogs[0].projectId, projectId);
      assert.deepEqual(payload.data.processLogs[0].stdout, ["EDITOR STDOUT READY"]);
      assert.deepEqual(payload.data.processLogs[0].stderr, ["EDITOR STDERR WARNING"]);
    } finally {
      if (projectId) {
        await server.request("tools/call", {
          name: "close_project",
          arguments: {
            projectId,
            timeoutMs: 2000
          }
        });
      }
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});
