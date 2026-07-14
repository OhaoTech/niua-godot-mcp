import assert from "node:assert/strict";
import { test } from "node:test";
import { GODOT_MCP_TOOLS } from "../../../src/godot-mcp/tools/index.js";
import {
  assessTrustworthiness,
  staticCheck,
  steps,
  treeHasChildren
} from "../../../scripts/probes/sdk-token-ruler.mjs";

// A minimal, honest raw tool-call envelope: { content: [{ type, text }] }
// where text is the JSON-stringified { ok, data: { root } } bridge payload
// (see niua_mcp_editor_state_operations.gd scene_tree() /
// niua_mcp_node_snapshot.gd serialize_node()). Both the baseline callTool
// path and the facade godot.scene.get_scene_tree path resolve to this same
// shape, so one fixture builder covers both.
function treeEnvelope(data) {
  return { content: [{ type: "text", text: JSON.stringify({ ok: true, data }) }] };
}

const NON_EMPTY_TREE = treeEnvelope({
  currentScene: "res://__ruler_a.tscn",
  root: { name: "Blockout", path: "Blockout", type: "Node3D", sceneFilePath: "", children: [
    { name: "Floor", path: "Blockout/Floor", type: "StaticBody3D", sceneFilePath: "", children: [] }
  ] }
});

const EMPTY_TREE = treeEnvelope({
  currentScene: "res://__ruler_a.tscn",
  root: { name: "Blockout", path: "Blockout", type: "Node3D", sceneFilePath: "", children: [] }
});

// pathFilter didn't resolve to any node at all (nothing was built).
const NOT_FOUND_TREE = {
  content: [{
    type: "text",
    text: JSON.stringify({ ok: false, error: "pathFilter node not found: Blockout", errorCode: "not_found" })
  }]
};

// Static, editor-free correctness gate for the sdk-token-ruler probe
// (docs/godot-mcp/token-efficiency-roadmap.md Tier 3 #8). Guards against the
// steps() blockout drifting from the real tool schemas without needing a
// live Godot editor bridge.

test("sdk-token-ruler module imports and parses cleanly", async () => {
  const mod = await import("../../../scripts/probes/sdk-token-ruler.mjs");
  assert.equal(typeof mod.steps, "function");
  assert.equal(typeof mod.staticCheck, "function");
});

test("every ruler step tool exists in the live GODOT_MCP_TOOLS registry", () => {
  const names = new Set(GODOT_MCP_TOOLS.map((t) => t.name));
  const used = new Set(steps("res://__check.tscn").map((s) => s.tool));
  assert.ok(used.size > 0, "steps() produced no tool calls");
  for (const name of used) {
    assert.ok(names.has(name), `steps() uses unknown tool "${name}"`);
  }
});

test("every ruler step tool carries a category for facade namespace lookup", () => {
  const byName = new Map(GODOT_MCP_TOOLS.map((t) => [t.name, t]));
  for (const { tool } of steps("res://__check.tscn")) {
    const entry = byName.get(tool);
    assert.ok(entry, `unknown tool ${tool}`);
    assert.ok(entry.category, `tool ${tool} has no category`);
  }
});

test("staticCheck() reports ok:true against the live registry", () => {
  const report = staticCheck();
  assert.equal(report.ok, true, JSON.stringify(report));
  assert.equal(report.missingTools.length, 0);
  assert.equal(report.missingCategory.length, 0);
});

// Honesty gate (whole-branch review finding): the identical-outcome check
// alone can pass on an identical FAILURE — if both paths fail to build, both
// trees are the same near-empty tree, "identical" is trivially true, and a
// naive report would print a bogus cutPct over zero real work. These tests
// pin treeHasChildren()/assessTrustworthiness() so that never regresses.

test("treeHasChildren is true for a tree with a real child node", () => {
  assert.equal(treeHasChildren(NON_EMPTY_TREE), true);
});

test("treeHasChildren is false for a root with no children", () => {
  assert.equal(treeHasChildren(EMPTY_TREE), false);
});

test("treeHasChildren is false when pathFilter resolved nothing was built", () => {
  assert.equal(treeHasChildren(NOT_FOUND_TREE), false);
});

test("assessTrustworthiness: identical outcome + clean builds + real tree is trustworthy", () => {
  const verdict = assessTrustworthiness({
    identical: true,
    baselineFails: [],
    facadeFails: [],
    treeA: NON_EMPTY_TREE,
    treeB: NON_EMPTY_TREE
  });
  assert.deepEqual(verdict, { trustworthy: true });
});

test("assessTrustworthiness: identical outcome on a failed build is NOT trustworthy (the bug this guards)", () => {
  // Both paths "failed the same way" -> identicalOutcome would be true, but
  // both trees are empty and both fail lists are non-empty: must not be
  // trustworthy, and a caller must not read cutPct/tokensBaseline/tokensFacade
  // out of this verdict (this object simply doesn't carry them).
  const verdict = assessTrustworthiness({
    identical: true,
    baselineFails: ["create_scene: boom"],
    facadeFails: ["create_scene: boom"],
    treeA: EMPTY_TREE,
    treeB: EMPTY_TREE
  });
  assert.equal(verdict.trustworthy, false);
  assert.equal(verdict.reason, "build had failures");
  assert.ok(!("cutPct" in verdict));
  assert.ok(!("tokensBaseline" in verdict));
  assert.ok(!("tokensFacade" in verdict));
});

test("assessTrustworthiness: identical outcome over an empty tree (no fails reported) is NOT trustworthy", () => {
  const verdict = assessTrustworthiness({
    identical: true,
    baselineFails: [],
    facadeFails: [],
    treeA: EMPTY_TREE,
    treeB: EMPTY_TREE
  });
  assert.equal(verdict.trustworthy, false);
  assert.equal(verdict.reason, "empty scene");
});

test("assessTrustworthiness: non-identical outcome is NOT trustworthy even with clean builds", () => {
  const verdict = assessTrustworthiness({
    identical: false,
    baselineFails: [],
    facadeFails: [],
    treeA: NON_EMPTY_TREE,
    treeB: NON_EMPTY_TREE
  });
  assert.equal(verdict.trustworthy, false);
  assert.equal(verdict.reason, "outcome differs");
});
