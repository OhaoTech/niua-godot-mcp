import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createMcpProcess } from "../helpers/server-harness.js";

test("Godot MCP server creates projects under allowed roots and installs the addon", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-allowed-"));
  const projectRoot = path.join(allowedRoot, "demo");

  try {
    const server = createMcpProcess({
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json")
    });

    try {
      const response = await server.request("tools/call", {
        name: "create_project",
        arguments: {
          projectRoot,
          name: "NIUA Demo",
          installAddon: true
        }
      });

      assert.equal(response.result.content[0].type, "text");
      const payload = JSON.parse(response.result.content[0].text);
      assert.equal(payload.ok, true);
      assert.equal(payload.data.projectRoot, projectRoot);
      assert.equal(payload.data.name, "NIUA Demo");
      assert.equal(payload.data.addonInstalled, true);
      assert.equal(existsSync(path.join(projectRoot, "project.godot")), true);
      assert.equal(existsSync(path.join(projectRoot, "scenes")), true);
      assert.equal(existsSync(path.join(projectRoot, "scripts")), true);
      assert.equal(existsSync(path.join(projectRoot, "addons/niua_mcp/plugin.cfg")), true);

      const projectText = readFileSync(path.join(projectRoot, "project.godot"), "utf8");
      assert.match(projectText, /config\/name="NIUA Demo"/);
      assert.doesNotMatch(projectText, /run\/main_scene/);
      assert.match(projectText, /res:\/\/addons\/niua_mcp\/plugin.cfg/);
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server rejects project creation outside allowed roots", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-allowed-"));
  const outsideRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-outside-"));

  try {
    const server = createMcpProcess({
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot
    });

    try {
      const response = await server.request("tools/call", {
        name: "create_project",
        arguments: {
          projectRoot: path.join(outsideRoot, "demo"),
          name: "Outside Demo"
        }
      });

      assert.equal(response.error.code, -32000);
      assert.match(response.error.message, /outside allowed project roots/);
      assert.equal(existsSync(path.join(outsideRoot, "demo/project.godot")), false);
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
    await rm(outsideRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server installs the NIUA addon for existing allowed projects", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-addon-"));
  const projectRoot = path.join(allowedRoot, "demo");

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Addon Demo\"",
      ""
    ].join("\n"));

    const server = createMcpProcess({
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json")
    });

    try {
      const response = await server.request("tools/call", {
        name: "install_project_addon",
        arguments: {
          projectRoot
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.projectRoot, projectRoot);
      assert.equal(payload.data.addonInstalled, true);
      assert.equal(payload.data.setup.ready, true);
      assert.equal(existsSync(path.join(projectRoot, "addons/niua_mcp/plugin.cfg")), true);

      const projectText = readFileSync(path.join(projectRoot, "project.godot"), "utf8");
      assert.match(projectText, /res:\/\/addons\/niua_mcp\/plugin.cfg/);
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server rejects addon installs outside allowed roots", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-addon-allowed-"));
  const outsideRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-addon-outside-"));
  const projectRoot = path.join(outsideRoot, "demo");

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), "config_version=5\n");

    const server = createMcpProcess({
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot
    });

    try {
      const response = await server.request("tools/call", {
        name: "install_project_addon",
        arguments: {
          projectRoot
        }
      });

      assert.equal(response.error.code, -32000);
      assert.match(response.error.message, /outside allowed project roots/);
      assert.equal(existsSync(path.join(projectRoot, "addons/niua_mcp/plugin.cfg")), false);
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
    await rm(outsideRoot, { recursive: true, force: true });
  }
});
