import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {
  buildSetupPlan,
  clientConfigPath,
  mcpServerConfig,
  parseSetupArgs
} from "../../src/godot-mcp/setup/config.js";

test("parseSetupArgs defaults to a dry-run core setup", () => {
  const options = parseSetupArgs([
    "--client",
    "claude",
    "--project-root",
    "/tmp/niua-games"
  ], {
    HOME: "/home/example",
    GODOT_BIN: "godot-custom"
  });

  assert.equal(options.client, "claude");
  assert.equal(options.projectRoot, "/tmp/niua-games");
  assert.equal(options.profile, "core");
  assert.equal(options.godotBin, "godot-custom");
  assert.equal(options.write, false);
  assert.equal(options.smoke, true);
});

test("mcpServerConfig uses absolute node and server paths", () => {
  const config = mcpServerConfig({
    nodeCommand: "/usr/bin/node",
    serverPath: "/repo/src/godot-mcp/server.js",
    projectRoot: "/home/example/Godot",
    profile: "v1",
    godotBin: "godot"
  });

  assert.equal(config.command, "/usr/bin/node");
  assert.deepEqual(config.args, ["/repo/src/godot-mcp/server.js"]);
  assert.deepEqual(config.env, {
    NIUA_MCP_PROFILE: "core",
    GODOT_BIN: "godot",
    GODOT_MCP_ALLOWED_PROJECT_ROOTS: "/home/example/Godot"
  });
});

test("mcpServerConfig preserves PATH-resolved executable names", () => {
  const config = mcpServerConfig({
    nodeCommand: "node",
    serverPath: "/repo/src/godot-mcp/server.js",
    projectRoot: "/home/example/Godot",
    profile: "v1",
    godotBin: "godot"
  });

  assert.equal(config.command, "node");
});

test("buildSetupPlan creates a claude dry-run plan", () => {
  const plan = buildSetupPlan({
    client: "claude",
    projectRoot: "/home/example/Godot",
    configPath: "/home/example/.config/Claude/claude_desktop_config.json",
    nodeCommand: "/usr/bin/node",
    serverPath: "/repo/src/godot-mcp/server.js",
    godotBin: "godot",
    profile: "v1",
    write: false,
    smoke: false
  });

  assert.equal(plan.client, "claude");
  assert.equal(plan.serverName, "niua-godot");
  assert.equal(plan.write, false);
  assert.equal(plan.startupTimeoutSec, 120);
  assert.equal(plan.configPath, "/home/example/.config/Claude/claude_desktop_config.json");
  assert.equal(plan.serverConfig.command, "/usr/bin/node");
  assert.deepEqual(plan.serverConfig.args, ["/repo/src/godot-mcp/server.js"]);
});

test("clientConfigPath resolves codex and claude defaults", () => {
  const env = {
    HOME: "/home/example",
    XDG_CONFIG_HOME: "/home/example/.config"
  };

  assert.equal(
    clientConfigPath("codex", env),
    path.join("/home/example", ".codex/config.toml")
  );
  assert.equal(
    clientConfigPath("claude", env),
    path.join("/home/example", ".config/Claude/claude_desktop_config.json")
  );
});

test("buildSetupPlan rejects unknown clients", () => {
  assert.throws(
    () => buildSetupPlan({
      client: "unknown",
      projectRoot: "/tmp/projects",
      nodeCommand: "/usr/bin/node",
      serverPath: "/repo/src/godot-mcp/server.js"
    }),
    /Unsupported MCP client/
  );
});
