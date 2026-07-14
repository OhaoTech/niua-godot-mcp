#!/usr/bin/env node
// scripts/probes/sdk-token-ruler.mjs
//
// Ruler for token-efficiency-roadmap.md Tier 3 #8 (code-execution facade).
// Builds an identical ~12-node blockout two ways:
//   (a) tool-by-tool via callTool  [baseline — every intermediate tool result
//       would enter model context]
//   (b) one SDK script against connect()'s domain namespaces [facade — only
//       a one-line summary reaches context]
// then compares the bytes that would enter model context for each path.
//
// Honest by construction: if the editor bridge is unreachable, or the tool
// profile/token don't line up, this reports { measured:false, reason } and
// exits 0 — it never fabricates a number. `--check` runs a static, editor-free
// self-check: every tool name used in steps() must exist (with a category)
// in the live GODOT_MCP_TOOLS registry, and this module must import/parse
// cleanly. See test/godot-mcp/sdk/ruler-steps.test.js for the same gate
// wired into `npm test`.
import { fileURLToPath } from "node:url";
import { GODOT_MCP_TOOLS } from "../../src/godot-mcp/tools/index.js";
import { connect } from "../../src/godot-mcp/sdk/index.js";

const CHARS_PER_TOKEN = 4; // stated approximation
const RUN = Date.now().toString(36); // unique per invocation, so create_scene starts a fresh blank scene instead of reusing a still-open tab from a prior run

const conn = {
  host: process.env.GODOT_MCP_HOST || "127.0.0.1",
  port: Number(process.env.GODOT_MCP_PORT || 9174),
  token: process.env.GODOT_MCP_TOKEN,
  expectedProjectRoot: process.env.RULER_PROJECT_ROOT
};

// The ~12-step blockout, as {tool,args} — identical for both paths.
//
// Argument names below were verified against the real input schemas (the
// task-4 brief's draft used ASSUMED names for several node tools; corrected
// here against the split schema files):
//   scene/tabs/schemas.js CREATE_SCENE_SCHEMA           -> create_scene (draft was already correct)
//   scene/manifest.js                                    -> save_current_scene, get_scene_tree (already correct)
//   inspector/schemas.js SET_NODE_PROPERTY_SCHEMA        -> set_node_property (already correct)
//   nodes/node3d/schemas/physics/static-body.js          -> create_static_body_3d (already correct: parentPath, name, position)
//   nodes/node3d/schemas/physics/character-body.js       -> create_character_body_3d (already correct: parentPath, name)
//   nodes/node3d/schemas/visual/camera.js                -> create_camera_3d (already correct: parentPath, name, position)
//   nodes/node3d/schemas/physics/collision-shape.js      -> create_collision_shape_3d
//     CORRECTED: draft used `shape`; the real property is `shapeKind`, and
//     `shapePath` is REQUIRED (a Shape3D resource output path) — the draft
//     omitted it entirely.
//   nodes/node3d/schemas/visual/light.js                 -> create_light_3d
//     CORRECTED: draft used `light`; the real property is `kind`.
//   nodes/node3d/schemas/visual/mesh-instance.js         -> create_mesh_instance_3d
//     CORRECTED: draft used `mesh`; the real property is `meshKind`, and
//     `meshPath` is REQUIRED (a Mesh resource output path) — the draft
//     omitted it entirely.
export function steps(scenePath) {
  return [
    { tool: "create_scene", args: { path: scenePath, rootType: "Node3D", rootName: "Blockout" } },
    { tool: "create_static_body_3d", args: { parentPath: "Blockout", name: "Floor" } },
    { tool: "create_collision_shape_3d", args: {
      parentPath: "Floor",
      name: "FloorShape",
      shapeKind: "box", overwrite: true,
      shapePath: "res://floor_shape.tres",
      size: [10, 0.2, 10]
    } },
    { tool: "create_mesh_instance_3d", args: {
      parentPath: "Floor",
      name: "FloorMesh",
      meshKind: "box", overwrite: true,
      meshPath: "res://floor_mesh.tres",
      size: [10, 0.2, 10]
    } },
    { tool: "create_character_body_3d", args: { parentPath: "Blockout", name: "Player" } },
    { tool: "create_collision_shape_3d", args: {
      parentPath: "Player",
      name: "PlayerShape",
      shapeKind: "capsule", overwrite: true,
      shapePath: "res://player_shape.tres",
      radius: 0.4,
      height: 1.8
    } },
    { tool: "create_camera_3d", args: { parentPath: "Player", name: "Cam", position: [0, 1.6, 0] } },
    { tool: "create_light_3d", args: {
      parentPath: "Blockout",
      name: "Sun",
      kind: "directional",
      position: [0, 5, 0]
    } },
    { tool: "create_static_body_3d", args: { parentPath: "Blockout", name: "WallA", position: [0, 1, -5] } },
    { tool: "create_collision_shape_3d", args: {
      parentPath: "WallA",
      name: "WallAShape",
      shapeKind: "box", overwrite: true,
      shapePath: "res://wallA_shape.tres",
      size: [10, 2, 0.2]
    } },
    { tool: "set_node_property", args: { nodePath: "Player", property: "position", value: [0, 1, 0] } },
    { tool: "save_current_scene", args: {} }
  ];
}

// Auxiliary tools called outside steps() (tree comparison + reachability).
// get_project_info (not get_godot_version) is the reachability probe: it is
// the only essential-tier tool among these that actually round-trips the
// editor's HTTP bridge — get_godot_version is a local Godot-CLI check and
// proves nothing about bridge/token reachability.
const AUX_TOOLS = ["get_project_info", "get_scene_tree"];

function bytes(x) {
  return Buffer.byteLength(typeof x === "string" ? x : JSON.stringify(x), "utf8");
}

const CATS = new Map(GODOT_MCP_TOOLS.map((t) => [t.name, t.category || "misc"]));
function categoryOf(name) { return CATS.get(name); }

// Static, editor-free self-check (the deliverable's correctness gate): every
// tool name used in steps() (plus the auxiliary tree/reachability tools)
// must exist in the live GODOT_MCP_TOOLS registry, and every steps() tool
// must carry a category so the facade path's godot[category][tool] lookup
// resolves. No network, no editor required.
export function staticCheck() {
  const names = new Set(GODOT_MCP_TOOLS.map((t) => t.name));
  const stepTools = [...new Set(steps("res://__check.tscn").map((s) => s.tool))];
  const allUsed = [...new Set([...stepTools, ...AUX_TOOLS])];
  const missingTools = allUsed.filter((n) => !names.has(n));
  const missingCategory = stepTools.filter((n) => names.has(n) && !categoryOf(n));
  const ok = missingTools.length === 0 && missingCategory.length === 0;
  return {
    ok,
    stepToolCount: stepTools.length,
    stepTools,
    auxTools: AUX_TOOLS,
    missingTools,
    missingCategory
  };
}

function stripNames(tree) {
  // Compare structure minus the two scenes' incidental differences: the scene
  // file names (__ruler_a vs _b) and Godot's auto-generated instance names
  // (@CollisionShape3D@18612 vs @18641) — instance counters differ across two
  // separately-built scenes, so normalize them; only the structure matters.
  return JSON.stringify(tree)
    .replace(/__ruler_[a-z0-9]+_[ab]/g, "__R")
    .replace(/Blockout/g, "B")
    .replace(/@(\w+)@\d+/g, "@$1@N");
}

// `tree` is a raw tool-call result: { content: [{ type:"text", text:"<json>" }] }
// (both the baseline callTool path and the facade godot.scene.get_scene_tree
// path resolve to the same manifest handler, so the shape is identical for
// both). The JSON text unwraps to { ok, data: { currentScene, root } } per
// niua_mcp_editor_state_operations.gd scene_tree() / niua_mcp_node_snapshot.gd
// serialize_node() — root is null when pathFilter ("Blockout") didn't resolve
// (nothing was built at all), and root.children is [] when the root node
// exists but no child steps landed. Either case means the tree is trivial and
// must not be trusted as evidence of a real build.
export function treeHasChildren(tree) {
  try {
    const parsed = JSON.parse(tree?.content?.[0]?.text);
    const root = parsed?.data?.root;
    if (!root) return false;
    // At a maxDepth boundary a node's own children are elided (children: [])
    // but childrenTruncated still carries the real count — treat that as
    // "has children" too, so a shallow maxDepth doesn't read as an empty tree.
    return (Array.isArray(root.children) && root.children.length > 0) ||
      (typeof root.childrenTruncated === "number" && root.childrenTruncated > 0);
  } catch {
    return false;
  }
}

// Pure decision: is this run's byte comparison honest evidence, or would
// reporting cutPct/tokensBaseline/tokensFacade over it be misleading? Kept
// importable (and argument-shaped, not tree-shaped) so it's unit-testable
// without a live bridge.
export function assessTrustworthiness({ identical, baselineFails, facadeFails, treeA, treeB }) {
  const baselineOk = baselineFails.length === 0;
  const facadeOk = facadeFails.length === 0;
  const builtSomething = treeHasChildren(treeA) && treeHasChildren(treeB);
  if (identical && baselineOk && facadeOk && builtSomething) {
    return { trustworthy: true };
  }
  const reason = !identical
    ? "outcome differs"
    : (!baselineOk || !facadeOk)
      ? "build had failures"
      : "empty scene";
  return { trustworthy: false, reason };
}

async function bridgeReachable(callTool) {
  try {
    await callTool("get_project_info", conn);
    return true;
  } catch {
    return false;
  }
}

async function runBaseline(callTool, scenePath) {
  let contextBytes = 0;
  const fails = [];
  for (const s of steps(scenePath)) {
    try {
      const res = await callTool(s.tool, { ...conn, ...s.args }); // baseline: each result would enter context
      contextBytes += bytes(res);
    } catch (e) {
      fails.push(`${s.tool}: ${String(e?.message ?? e).slice(0, 80)}`);
    }
  }
  const tree = await callTool("get_scene_tree", { ...conn, maxDepth: 3 });
  return { contextBytes, tree, fails };
}

async function runFacade(scenePath) {
  const godot = connect(conn);
  const fails = [];
  let ok = 0;
  for (const s of steps(scenePath)) {
    try { await godot[categoryOf(s.tool)][s.tool](s.args); ok++; }
    catch (e) { fails.push(`${s.tool}: ${String(e?.message ?? e).slice(0, 80)}`); }
  }
  const tree = await godot.scene.get_scene_tree({ maxDepth: 3 });
  const summary = godot.summarize("ruler-facade", { ok, fail: fails }); // ONLY this reaches context
  return { contextBytes: bytes(summary), tree, fails };
}

async function main() {
  if (process.argv.includes("--check")) {
    const report = staticCheck();
    console.log(JSON.stringify({ check: "ruler-steps", ...report }, null, 2));
    if (!report.ok) process.exitCode = 1;
    return;
  }

  try {
    // Force the "full" tool profile for THIS process only, so the baseline
    // (callTool) path can reach every tool used in steps() — some (e.g.
    // create_collision_shape_3d) are tier:"standard" and excluded from the
    // default "core" profile that server/tool-catalog.js resolves at import
    // time. Must be set before that module is evaluated, hence the dynamic
    // import here rather than a static import at the top of this file.
    process.env.NIUA_MCP_PROFILE = process.env.NIUA_MCP_PROFILE || "full";
    const { callTool } = await import("../../src/godot-mcp/server/tool-catalog.js");

    if (!(await bridgeReachable(callTool))) {
      console.log(JSON.stringify({
        measured: false,
        reason: `bridge unreachable or unauthenticated at ${conn.host}:${conn.port} (get_project_info failed)`
      }));
      return;
    }

    const a = await runBaseline(callTool, `res://__ruler_${RUN}_a.tscn`);
    const b = await runFacade(`res://__ruler_${RUN}_b.tscn`);
    const identical = JSON.stringify(a.tree).length > 0 && stripNames(a.tree) === stripNames(b.tree);

    // A measurement is only trustworthy when the two paths produced the same
    // scene AND neither path silently swallowed build failures AND there is
    // an actual (non-trivial) built tree behind the byte counts. Otherwise a
    // "both paths failed identically" run would report a bogus cutPct over
    // near-empty trees — never emit tokens/cutPct in that case.
    const verdict = assessTrustworthiness({
      identical,
      baselineFails: a.fails,
      facadeFails: b.fails,
      treeA: a.tree,
      treeB: b.tree
    });

    if (!verdict.trustworthy) {
      console.log(JSON.stringify({
        measured: true,
        trustworthy: false,
        reason: verdict.reason,
        baselineFails: a.fails,
        facadeFails: b.fails
      }, null, 2));
      process.exitCode = 1;
      return;
    }

    const tokensBaseline = Math.round(a.contextBytes / CHARS_PER_TOKEN);
    const tokensFacade = Math.round(b.contextBytes / CHARS_PER_TOKEN);
    const report = {
      measured: true,
      identicalOutcome: identical,
      opsCount: steps("").length,
      baselineBytes: a.contextBytes,
      facadeBytes: b.contextBytes,
      tokensBaseline,
      tokensFacade,
      cutPct: Math.round((1 - tokensFacade / Math.max(1, tokensBaseline)) * 100),
      baselineFails: a.fails,
      facadeFails: b.fails,
      note: `~${CHARS_PER_TOKEN} chars/token approximation; per-op figures; SDK module read amortizes across a session`
    };
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    // Any unexpected failure (network, token mismatch, profile mismatch,
    // partial bridge state) degrades to the same honest, non-fatal contract
    // as an unreachable bridge — never a fabricated number, never a crash.
    console.log(JSON.stringify({
      measured: false,
      reason: `probe error: ${String(error?.message ?? error).slice(0, 200)}`
    }));
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  await main();
}
