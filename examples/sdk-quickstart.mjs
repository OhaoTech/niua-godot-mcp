#!/usr/bin/env node
/**
 * JS SDK quickstart — multi-step Godot work with intermediates kept local.
 *
 * Prerequisites:
 *   1. Godot editor open on a project with the NIUA addon + bridge up
 *   2. Shared token in env, e.g. GODOT_MCP_TOKEN / NIUA_MCP_TOKEN
 *
 * Usage (from repo root):
 *   GODOT_MCP_TOKEN=… node examples/sdk-quickstart.mjs /path/to/project
 *
 * Or after `npm link` / install:
 *   node --input-type=module -e "import { connect } from 'niua-godot-mcp/sdk'; …"
 */
import path from "node:path";
import { connect } from "../src/godot-mcp/sdk/index.js";

const projectRoot = path.resolve(process.argv[2] ?? process.cwd());
const host = process.env.GODOT_MCP_HOST ?? process.env.NIUA_GODOT_BRIDGE_HOST ?? "127.0.0.1";
const port = Number(process.env.GODOT_MCP_PORT ?? process.env.NIUA_GODOT_BRIDGE_PORT ?? 9174);
const token = process.env.GODOT_MCP_TOKEN ?? process.env.NIUA_MCP_TOKEN;

if (!token) {
  console.error("Set GODOT_MCP_TOKEN (or NIUA_MCP_TOKEN) to match the editor bridge.");
  process.exit(2);
}

const godot = connect({
  host,
  port,
  token,
  expectedProjectRoot: projectRoot,
});

// Bracket keys: some domains contain hyphens (nodes-common, project-management, …).
const scene = godot.scene;
const nodes = godot["nodes-common"];
const run = godot.run;
const runtime = godot.runtime;
const dbg = godot.debugger;

let ok = 0;
let fail = 0;
const notes = [];

async function step(label, fn) {
  try {
    const result = await fn();
    const failed = result && result.ok === false;
    if (failed) {
      fail += 1;
      notes.push(`${label}: ${result.error ?? "ok:false"}`);
      return result;
    }
    ok += 1;
    return result;
  } catch (error) {
    fail += 1;
    notes.push(`${label}: ${error?.message ?? error}`);
    return null;
  }
}

const scenePath = "res://sdk_quickstart.tscn";

await step("version", () => runtime.get_godot_version({}));
await step("create_scene", () =>
  scene.create_scene({
    path: scenePath,
    rootType: "Node3D",
    rootName: "SdkQuickstart",
    open: true,
    overwrite: true,
  })
);
await step("create_node", () =>
  nodes.create_node({
    type: "MeshInstance3D",
    name: "Marker",
    parentPath: "",
  })
);
await step("save", () => scene.save_scene_as({ path: scenePath }));
await step("set_main", () => run.set_main_scene({ path: scenePath, save: true }));
await step("run", () => run.run_main_scene({ saveBeforeRun: true }));
await step("probe", () => dbg.install_runtime_probe({ save: true }));
await step("events", () => dbg.get_runtime_events({}));
await step("stop", () => run.stop_running_scene({}));

// Only this line is meant for model/human context — not every step payload.
console.log(godot.summarize("sdk-quickstart", { ok, fail, notes }));
process.exit(fail > 0 ? 1 : 0);
