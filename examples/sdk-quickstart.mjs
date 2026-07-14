#!/usr/bin/env node
/**
 * JS SDK quickstart — no token setup.
 *
 * Happy path:
 *   1. In your AI client, open the project once with open_project (writes a local session file)
 *   2. Run:
 *        node examples/sdk-quickstart.mjs /path/to/project
 *
 * The SDK reads host/port/token from <project>/.godot/niua_mcp_bridge.json automatically.
 */
import path from "node:path";
import { connect, loadBridgeSession } from "../src/godot-mcp/sdk/index.js";

const projectRoot = path.resolve(process.argv[2] ?? "");
if (!projectRoot || projectRoot === path.resolve("")) {
  console.error("Usage: node examples/sdk-quickstart.mjs /path/to/GodotProject");
  console.error("Tip: open the project once via MCP open_project first — no token env needed.");
  process.exit(2);
}

const session = loadBridgeSession(projectRoot);
if (!session) {
  console.error(`No local bridge session at ${path.join(projectRoot, ".godot", "niua_mcp_bridge.json")}`);
  console.error("Ask your AI to call open_project on this folder first, then re-run this script.");
  process.exit(2);
}

// Friction-free: only the project path. Token/host/port come from the session file.
const godot = connect({ expectedProjectRoot: projectRoot });

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
    if (result && result.ok === false) {
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
    overwrite: true
  })
);
await step("create_node", () =>
  nodes.create_node({
    type: "MeshInstance3D",
    name: "Marker",
    parentPath: ""
  })
);
await step("save", () => scene.save_scene_as({ path: scenePath }));
await step("set_main", () => run.set_main_scene({ path: scenePath, save: true }));
await step("run", () => run.run_main_scene({ saveBeforeRun: true }));
await step("probe", () => dbg.install_runtime_probe({ save: true }));
await step("events", () => dbg.get_runtime_events({}));
await step("stop", () => run.stop_running_scene({}));

console.log(godot.summarize("sdk-quickstart", { ok, fail, notes }));
process.exit(fail > 0 ? 1 : 0);
