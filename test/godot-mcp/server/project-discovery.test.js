import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createMcpProcess } from "../helpers/server-harness.js";

test("Godot MCP server discovers projects under allowlisted roots and can remember them", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-discovery-"));
  const firstProject = path.join(allowedRoot, "one");
  const secondProject = path.join(allowedRoot, "nested/two");

  try {
    await mkdir(firstProject, { recursive: true });
    await mkdir(secondProject, { recursive: true });
    await writeFile(path.join(firstProject, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"One\"",
      ""
    ].join("\n"));
    await writeFile(path.join(secondProject, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Two\"",
      ""
    ].join("\n"));

    const server = createMcpProcess({
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json")
    });

    try {
      const discoverResponse = await server.request("tools/call", {
        name: "discover_projects",
        arguments: {
          maxDepth: 3,
          remember: true
        }
      });
      const discoverPayload = JSON.parse(discoverResponse.result.content[0].text);
      const discovered = discoverPayload.data.projects
        .map((project) => ({ projectRoot: project.projectRoot, name: project.name }))
        .sort((left, right) => left.projectRoot.localeCompare(right.projectRoot));

      assert.equal(discoverPayload.ok, true);
      assert.deepEqual(discovered, [
        { projectRoot: secondProject, name: "Two" },
        { projectRoot: firstProject, name: "One" }
      ]);

      const listResponse = await server.request("tools/call", {
        name: "list_known_projects"
      });
      const listPayload = JSON.parse(listResponse.result.content[0].text);
      const remembered = listPayload.data.projects
        .map((project) => ({ projectRoot: project.projectRoot, source: project.source }))
        .sort((left, right) => left.projectRoot.localeCompare(right.projectRoot));
      assert.deepEqual(remembered, [
        { projectRoot: secondProject, source: "discovered" },
        { projectRoot: firstProject, source: "discovered" }
      ]);
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server rejects project discovery outside allowed roots", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-allowed-"));
  const outsideRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-outside-"));

  try {
    const server = createMcpProcess({
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json")
    });

    try {
      const response = await server.request("tools/call", {
        name: "discover_projects",
        arguments: {
          roots: [outsideRoot]
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

test("Godot MCP server lists scene files under an allowlisted project", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-scenes-"));
  const projectRoot = path.join(allowedRoot, "scene-list-demo");

  try {
    await mkdir(path.join(projectRoot, "scenes/nested"), { recursive: true });
    await mkdir(path.join(projectRoot, "scripts"), { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Scene List Demo\"",
      "run/main_scene=\"res://scenes/main.tscn\"",
      ""
    ].join("\n"));
    await writeFile(path.join(projectRoot, "scenes/main.tscn"), "[gd_scene format=3]\n");
    await writeFile(path.join(projectRoot, "scenes/nested/challenge.scn"), "binary placeholder\n");
    await writeFile(path.join(projectRoot, "scripts/player.gd"), "extends Node\n");

    const server = createMcpProcess({
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot
    });

    try {
      const response = await server.request("tools/call", {
        name: "list_scenes",
        arguments: {
          projectRoot,
          rootPath: "res://scenes",
          recursive: true
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.projectRoot, projectRoot);
      assert.equal(payload.data.rootPath, "res://scenes/");
      assert.equal(payload.data.mainScene, "res://scenes/main.tscn");
      assert.deepEqual(payload.data.scenes.map((scene) => scene.path), [
        "res://scenes/main.tscn",
        "res://scenes/nested/challenge.scn"
      ]);
      assert.equal(payload.data.scenes[0].isMainScene, true);
      assert.equal(payload.data.scenes[1].isMainScene, false);
      assert.equal(payload.data.sceneCount, 2);
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});
