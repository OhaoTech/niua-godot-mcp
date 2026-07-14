#!/usr/bin/env node
/**
 * P0–P2 smoke (no live Godot required for most checks).
 * Exit 0 = cold package path looks healthy.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CORE_TOOL_NAMES } from "../src/godot-mcp/server/tool-profiles.js";
import { GODOT_MCP_TOOLS } from "../src/godot-mcp/tools/index.js";
import { bridgeSessionPath, writeBridgeSession, loadBridgeSession, clearBridgeSession } from "../src/godot-mcp/services/bridge-session.js";
import { connect } from "../src/godot-mcp/sdk/index.js";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checks = [];

function check(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`${mark}  ${name}${detail ? ` — ${detail}` : ""}`);
}

// P0 cold path: package layout
check("cli exists", existsSync(path.join(root, "src/godot-mcp/cli.js")));
check("doctor exists", existsSync(path.join(root, "src/godot-mcp/doctor.js")));
check("addon plugin.cfg", existsSync(path.join(root, "godot/addons/niua_mcp/plugin.cfg")));
check("README exists", existsSync(path.join(root, "README.md")));
check("sdk quickstart example", existsSync(path.join(root, "examples/sdk-quickstart.mjs")));

// P0 session handoff
const tmp = await mkdtemp(path.join(tmpdir(), "p0p2-"));
try {
  writeBridgeSession(tmp, { host: "127.0.0.1", port: 9174, token: "smoke" });
  const loaded = loadBridgeSession(tmp);
  check("bridge session write/load", loaded?.token === "smoke", bridgeSessionPath(tmp));
  const godot = connect({
    expectedProjectRoot: tmp,
    tools: [{ name: "get_godot_version", category: "runtime", handler: async (a) => ({ ok: true, token: a.token }) }]
  });
  check("sdk connect from session (no env token)", godot.connection?.token === "smoke");
  clearBridgeSession(tmp);
} finally {
  await rm(tmp, { recursive: true, force: true });
}

// P1 tools registered
const names = new Set(GODOT_MCP_TOOLS.map((t) => t.name));
check("run_playtest_evidence registered", names.has("run_playtest_evidence"));
check("run_playtest_evidence in core", CORE_TOOL_NAMES.includes("run_playtest_evidence"));
check("find_nodes in core", CORE_TOOL_NAMES.includes("find_nodes"));
check("instance_scene in core", CORE_TOOL_NAMES.includes("instance_scene"));

// P2 import wait + diet
check("wait_for_imported_asset registered", names.has("wait_for_imported_asset"));
check("wait_for_imported_asset in core", CORE_TOOL_NAMES.includes("wait_for_imported_asset"));
check("core under 60 tools", CORE_TOOL_NAMES.length <= 60, `count=${CORE_TOOL_NAMES.length}`);
check(
  "core excludes create_mesh_instance_3d",
  !CORE_TOOL_NAMES.includes("create_mesh_instance_3d")
);

const failed = checks.filter((c) => !c.ok);
console.log("");
console.log(failed.length === 0 ? `P0–P2 smoke OK (${checks.length} checks)` : `P0–P2 smoke FAILED (${failed.length}/${checks.length})`);
process.exit(failed.length === 0 ? 0 : 1);
