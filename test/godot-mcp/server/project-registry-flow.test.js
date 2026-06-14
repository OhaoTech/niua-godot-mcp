import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  createFakeGodotExecutable,
  createMcpProcess
} from "../helpers/server-harness.js";

test("Godot MCP server imports, lists, persists, and forgets known projects", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-registry-"));
  const projectRoot = path.join(allowedRoot, "imported-demo");
  const registryFile = path.join(allowedRoot, "registry.json");

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Imported Demo\"",
      ""
    ].join("\n"));

    const registryEnv = {
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PROJECT_REGISTRY: registryFile
    };
    const server = createMcpProcess(registryEnv);

    try {
      const importResponse = await server.request("tools/call", {
        name: "import_project",
        arguments: {
          projectRoot,
          installAddon: false
        }
      });
      const importPayload = JSON.parse(importResponse.result.content[0].text);
      assert.equal(importPayload.ok, true);
      assert.equal(importPayload.data.projectRoot, projectRoot);
      assert.equal(importPayload.data.name, "Imported Demo");
      assert.equal(importPayload.data.source, "imported");

      const listResponse = await server.request("tools/call", {
        name: "list_known_projects"
      });
      const listPayload = JSON.parse(listResponse.result.content[0].text);
      assert.deepEqual(listPayload.data.projects.map((project) => project.projectRoot), [projectRoot]);
      assert.equal(listPayload.data.projects[0].name, "Imported Demo");
    } finally {
      await server.close();
    }

    const restartedServer = createMcpProcess(registryEnv);
    try {
      const persistedResponse = await restartedServer.request("tools/call", {
        name: "list_known_projects"
      });
      const persistedPayload = JSON.parse(persistedResponse.result.content[0].text);
      assert.deepEqual(persistedPayload.data.projects.map((project) => project.projectRoot), [projectRoot]);

      const forgetResponse = await restartedServer.request("tools/call", {
        name: "forget_project",
        arguments: {
          projectRoot
        }
      });
      const forgetPayload = JSON.parse(forgetResponse.result.content[0].text);
      assert.equal(forgetPayload.ok, true);
      assert.equal(forgetPayload.data.removed, true);

      const emptyResponse = await restartedServer.request("tools/call", {
        name: "list_known_projects"
      });
      const emptyPayload = JSON.parse(emptyResponse.result.content[0].text);
      assert.deepEqual(emptyPayload.data.projects, []);
    } finally {
      await restartedServer.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server auto-records created and opened projects", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-registry-"));
  const projectRoot = path.join(allowedRoot, "created-demo");
  const registryFile = path.join(allowedRoot, "registry.json");

  try {
    const { fakeGodot, logPath } = await createFakeGodotExecutable(allowedRoot);
    const server = createMcpProcess({
      GODOT_BIN: fakeGodot,
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PROJECT_REGISTRY: registryFile,
      NIUA_FAKE_GODOT_LOG: logPath
    });

    try {
      await server.request("tools/call", {
        name: "create_project",
        arguments: {
          projectRoot,
          name: "Created Demo",
          installAddon: false
        }
      });

      const createdListResponse = await server.request("tools/call", {
        name: "list_known_projects"
      });
      const createdListPayload = JSON.parse(createdListResponse.result.content[0].text);
      assert.equal(createdListPayload.data.projects[0].projectRoot, projectRoot);
      assert.equal(createdListPayload.data.projects[0].source, "created");
      assert.equal(typeof createdListPayload.data.projects[0].lastCreatedAt, "string");

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

      await server.request("tools/call", {
        name: "close_project",
        arguments: {
          projectId: openPayload.data.projectId,
          timeoutMs: 2000
        }
      });

      const openedListResponse = await server.request("tools/call", {
        name: "list_known_projects"
      });
      const openedListPayload = JSON.parse(openedListResponse.result.content[0].text);
      assert.equal(openedListPayload.data.projects[0].projectRoot, projectRoot);
      assert.equal(openedListPayload.data.projects[0].source, "opened");
      assert.equal(typeof openedListPayload.data.projects[0].lastOpenedAt, "string");
      assert.equal(typeof openedListPayload.data.projects[0].lastCreatedAt, "string");
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});
