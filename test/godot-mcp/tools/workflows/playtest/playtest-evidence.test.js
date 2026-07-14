import assert from "node:assert/strict";
import test from "node:test";
import { createRunPlaytestEvidence } from "../../../../../src/godot-mcp/tools/workflows/playtest/evidence.js";
import { CORE_TOOL_NAMES } from "../../../../../src/godot-mcp/server/tool-profiles.js";
import { GODOT_MCP_TOOLS } from "../../../../../src/godot-mcp/tools/index.js";
import { normalizeBridgeResponse } from "../../../../../src/godot-mcp/protocol.js";

test("run_playtest_evidence is essential/core", () => {
  assert.ok(CORE_TOOL_NAMES.includes("run_playtest_evidence"));
  const tool = GODOT_MCP_TOOLS.find((t) => t.name === "run_playtest_evidence");
  assert.ok(tool);
  assert.equal(tool.tier, "essential");
});

test("run_playtest_evidence returns compact evidence on happy path", async () => {
  const calls = [];
  const callTool = async (name, args) => {
    calls.push(name);
    const table = {
      get_run_settings: { ok: true, data: { mainScene: "res://main.tscn", mainSceneExists: true } },
      run_main_scene: { ok: true, data: { playing: true, displayServer: "headless", interactive: false } },
      install_runtime_probe: { ok: true, data: { installed: true } },
      get_runtime_state: { ok: true, data: { nodeCount: 3, tree: { name: "Main" } } },
      get_runtime_events: { ok: true, data: { events: [{ name: "run.start" }] } },
      capture_runtime_screenshot: { ok: true, data: { available: false, reason: "headless" } },
      stop_running_scene: { ok: true, data: { playing: false } },
      get_run_status: { ok: true, data: { playing: false, displayServer: "headless", interactive: false } }
    };
    return table[name] ?? { ok: true, data: {} };
  };

  const run = createRunPlaytestEvidence({ callTool });
  const result = await run({ settleMs: 0 });
  assert.equal(result.ok, true);
  assert.equal(result.evidence.schemaVersion, 1);
  assert.equal(result.evidence.claims.ran, true);
  assert.equal(result.evidence.screenshot.available, false);
  assert.equal(result.evidence.screenshot.reason, "headless_or_no_renderer");
  assert.equal(result.evidence.environment.headless, true);
  assert.ok(calls.includes("run_main_scene"));
  assert.ok(calls.includes("capture_runtime_screenshot"));
  assert.ok(calls.includes("stop_running_scene"));
});

test("run_playtest_evidence scenarios can assert properties after input", async () => {
  const callTool = async (name, args) => {
    if (name === "get_run_settings") {
      return { ok: true, data: { mainScene: "res://main.tscn", mainSceneExists: true } };
    }
    if (name === "get_runtime_node_properties") {
      return {
        ok: true,
        data: { properties: { global_position: { value: { x: 1, y: 0, z: 2 } } } }
      };
    }
    if (name === "capture_runtime_screenshot") {
      return { ok: true, data: { available: false, reason: "headless" } };
    }
    return { ok: true, data: { playing: true, events: [] } };
  };
  const run = createRunPlaytestEvidence({ callTool });
  const result = await run({
    settleMs: 0,
    scenarios: [
      { type: "wait", ms: 1 },
      {
        type: "assert_property",
        nodePath: "Player",
        property: "global_position",
        near: [1, 0, 2],
        epsilon: 0.1
      }
    ]
  });
  assert.equal(result.ok, true);
  assert.equal(result.evidence.claims.scenariosPassed, true);
  assert.equal(result.evidence.scenarios.length, 2);
});

test("run_playtest_evidence fails clearly without main or scenePath", async () => {
  const callTool = async (name) => {
    if (name === "get_run_settings") {
      return { ok: true, data: { mainScene: "", mainSceneExists: false } };
    }
    return { ok: true, data: {} };
  };
  const run = createRunPlaytestEvidence({ callTool });
  const result = await run({ settleMs: 0 });
  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "no_main_scene");
  assert.equal(result.recovery.tool, "set_main_scene");
});

test("normalizeBridgeResponse preserves recovery hints", () => {
  const normalized = normalizeBridgeResponse({
    ok: false,
    error: "no main scene",
    errorCode: "no_main_scene",
    recovery: { tool: "set_main_scene", hint: "set it" }
  });
  assert.equal(normalized.errorCode, "no_main_scene");
  assert.equal(normalized.recovery.tool, "set_main_scene");
});
