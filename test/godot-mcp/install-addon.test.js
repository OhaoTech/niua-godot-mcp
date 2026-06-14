import assert from "node:assert/strict";
import { mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { installAddon } from "../../scripts/install-niua-godot-addon.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function makeProject(projectText) {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "niua-godot-project-"));
  await writeFile(path.join(projectRoot, "project.godot"), projectText);
  return projectRoot;
}

test("installAddon copies the NIUA MCP addon and enables the editor plugin", async () => {
  const projectRoot = await makeProject(`config_version=5

[application]
config/name="Install Check"
`);

  const result = await installAddon({ projectRoot, repoRoot });

  assert.equal(result.pluginPath, "res://addons/niua_mcp/plugin.cfg");
  await stat(path.join(projectRoot, "addons/niua_mcp/plugin.cfg"));
  await stat(path.join(projectRoot, "addons/niua_mcp/niua_mcp_bridge.gd"));

  const projectText = await readFile(path.join(projectRoot, "project.godot"), "utf8");
  assert.match(projectText, /\[editor_plugins\]/);
  assert.match(projectText, /enabled=PackedStringArray\("res:\/\/addons\/niua_mcp\/plugin.cfg"\)/);
});

test("installAddon preserves existing editor plugins and avoids duplicates", async () => {
  const projectRoot = await makeProject(`config_version=5

[editor_plugins]
enabled=PackedStringArray("res://addons/other/plugin.cfg", "res://addons/niua_mcp/plugin.cfg")
`);

  await installAddon({ projectRoot, repoRoot });

  const projectText = await readFile(path.join(projectRoot, "project.godot"), "utf8");
  assert.match(
    projectText,
    /enabled=PackedStringArray\("res:\/\/addons\/other\/plugin.cfg", "res:\/\/addons\/niua_mcp\/plugin.cfg"\)/
  );
});
