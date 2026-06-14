import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  renderClaudeConfig,
  renderCodexConfig,
  writeClientConfig
} from "../../src/godot-mcp/setup/writers.js";

const serverConfig = {
  command: "/usr/bin/node",
  args: ["/repo/src/godot-mcp/server.js"],
  env: {
    NIUA_MCP_PROFILE: "v1",
    GODOT_BIN: "godot",
    GODOT_MCP_ALLOWED_PROJECT_ROOTS: "/home/example/Godot"
  }
};

test("renderClaudeConfig merges the niua server into existing JSON", () => {
  const rendered = renderClaudeConfig(
    JSON.stringify({ mcpServers: { existing: { command: "keep" } }, preferences: { theme: "dark" } }),
    "niua-godot",
    serverConfig
  );
  const parsed = JSON.parse(rendered);

  assert.equal(parsed.preferences.theme, "dark");
  assert.equal(parsed.mcpServers.existing.command, "keep");
  assert.deepEqual(parsed.mcpServers["niua-godot"], serverConfig);
});

test("renderCodexConfig appends a managed niua server table", () => {
  const rendered = renderCodexConfig(
    "model = \"gpt-5.5\"\n\n[mcp_servers.existing]\ncommand = \"keep\"\n",
    "niua-godot",
    serverConfig,
    { startupTimeoutSec: 120 }
  );

  assert.match(rendered, /model = "gpt-5\.5"/);
  assert.match(rendered, /\[mcp_servers\.existing\]\ncommand = "keep"/);
  assert.match(rendered, /\[mcp_servers\.niua-godot\]\ncommand = "\/usr\/bin\/node"/);
  assert.match(rendered, /startup_timeout_sec = 120/);
  assert.match(rendered, /args = \["\/repo\/src\/godot-mcp\/server\.js"\]/);
  assert.match(rendered, /\[mcp_servers\.niua-godot\.env\]\nNIUA_MCP_PROFILE = "v1"/);
});

test("renderCodexConfig replaces an existing managed niua server table", () => {
  const rendered = renderCodexConfig(
    [
      "model = \"gpt-5.5\"",
      "",
      "[mcp_servers.niua-godot]",
      "command = \"old\"",
      "",
      "[mcp_servers.niua-godot.env]",
      "NIUA_MCP_PROFILE = \"old\"",
      "",
      "[mcp_servers.other]",
      "command = \"keep\"",
      ""
    ].join("\n"),
    "niua-godot",
    serverConfig,
    { startupTimeoutSec: 120 }
  );

  assert.doesNotMatch(rendered, /command = "old"/);
  assert.match(rendered, /\[mcp_servers\.other\]\ncommand = "keep"/);
  assert.equal((rendered.match(/\[mcp_servers\.niua-godot\]/g) || []).length, 1);
});

test("writeClientConfig dry-run does not create files", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "niua-setup-writer-"));
  const configPath = path.join(root, "claude.json");

  const result = await writeClientConfig({
    client: "claude",
    serverName: "niua-godot",
    configPath,
    serverConfig,
    startupTimeoutSec: 120,
    write: false
  });

  assert.equal(result.written, false);
  assert.equal(result.backupPath, "");
  assert.match(result.renderedConfig, /niua-godot/);
  await assert.rejects(() => stat(configPath), /ENOENT/);
});

test("writeClientConfig writes files and creates a backup for existing config", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "niua-setup-writer-"));
  const configPath = path.join(root, "claude.json");
  await writeFile(configPath, JSON.stringify({ mcpServers: { old: { command: "old" } } }));

  const result = await writeClientConfig({
    client: "claude",
    serverName: "niua-godot",
    configPath,
    serverConfig,
    startupTimeoutSec: 120,
    write: true
  });

  assert.equal(result.written, true);
  assert.match(result.backupPath, /claude\.json\.bak-/);
  const parsed = JSON.parse(await readFile(configPath, "utf8"));
  assert.equal(parsed.mcpServers.old.command, "old");
  assert.deepEqual(parsed.mcpServers["niua-godot"], serverConfig);

  const entries = await readdir(root);
  assert.equal(entries.filter((entry) => entry.startsWith("claude.json.bak-")).length, 1);
});
