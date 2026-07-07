import assert from "node:assert/strict";
import test from "node:test";

import {
  EXPERIMENTAL_ENV_VAR,
  experimentalEnabled,
  servableTools
} from "../../../src/godot-mcp/server/capability-graph.js";
import { GODOT_MCP_TOOLS } from "../../../src/godot-mcp/tools/index.js";
import { selectProfileTools } from "../../../src/godot-mcp/server/tool-profiles.js";
import { describeTools } from "../../../src/godot-mcp/tools/describe/index.js";

// Reputation contract: a tool that only a test harness has ever exercised is
// "experimental" and must be invisible in every serving profile by default.
// Users meet proven tools; the catalog stays honest about what else exists.

const experimental = GODOT_MCP_TOOLS.filter((tool) => tool.stability === "experimental");

test("the experimental set is exactly the audited gate-only subsystems", () => {
  assert.equal(experimental.length, 32);
  for (const tool of experimental) {
    assert.notEqual(tool.tier, "essential", `${tool.name} cannot be experimental and essential`);
  }
});

test("experimental tools are hidden from every profile by default", () => {
  const served = servableTools(GODOT_MCP_TOOLS, {});
  assert.equal(served.length, GODOT_MCP_TOOLS.length - 32);

  for (const profile of ["core", "full"]) {
    const names = new Set(selectProfileTools(served, profile).map((tool) => tool.name));
    for (const tool of experimental) {
      assert.ok(!names.has(tool.name), `${tool.name} leaked into the ${profile} profile`);
    }
  }
  const compactActions = selectProfileTools(served, "compact")
    .flatMap((router) => router.inputSchema?.properties?.action?.enum ?? []);
  for (const tool of experimental) {
    assert.ok(!compactActions.includes(tool.name), `${tool.name} leaked into a compact router`);
  }
});

test("the env opt-in exposes the full catalog", () => {
  assert.equal(experimentalEnabled({}), false);
  assert.equal(experimentalEnabled({ [EXPERIMENTAL_ENV_VAR]: "on" }), true);
  assert.equal(experimentalEnabled({ [EXPERIMENTAL_ENV_VAR]: "off" }), false);
  assert.equal(servableTools(GODOT_MCP_TOOLS, { [EXPERIMENTAL_ENV_VAR]: "on" }).length, GODOT_MCP_TOOLS.length);
});

test("describe_tools stays honest: lists, labels, and explains how to enable", async () => {
  const root = await describeTools({});
  assert.equal(root.data.experimentalHidden, 32);
  assert.match(root.data.experimentalNote, new RegExp(EXPERIMENTAL_ENV_VAR));

  const one = await describeTools({ name: "export_project" });
  assert.equal(one.data.stability, "experimental");
  assert.match(one.data.note, /under development/i);

  const domain = await describeTools({ domain: "godot_run" });
  const entry = domain.data.tools.find((tool) => tool.name === "export_project");
  assert.equal(entry.stability, "experimental");
});
