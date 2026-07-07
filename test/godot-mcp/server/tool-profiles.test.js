import test from "node:test";
import assert from "node:assert/strict";

import {
  CORE_TOOL_NAMES,
  DEFAULT_TOOL_PROFILE,
  V1_TOOL_NAMES,
  resolveToolProfile,
  selectProfileTools
} from "../../../src/godot-mcp/server/tool-profiles.js";
import { GODOT_MCP_TOOLS } from "../../../src/godot-mcp/tools/index.js";
import { createMcpProcess } from "../helpers/server-harness.js";

test("resolveToolProfile defaults to core, honors aliases, and validates explicit values", () => {
  assert.equal(DEFAULT_TOOL_PROFILE, "core");
  assert.equal(resolveToolProfile(undefined), "core");
  assert.equal(resolveToolProfile(""), "core");
  assert.equal(resolveToolProfile("   "), "core");
  assert.equal(resolveToolProfile("core"), "core");
  assert.equal(resolveToolProfile("full"), "full");
  assert.equal(resolveToolProfile(" FULL "), "full");
  assert.equal(resolveToolProfile("compact"), "compact");
  // permanent aliases: existing configs keep working
  assert.equal(resolveToolProfile("v1"), "core");
  assert.equal(resolveToolProfile("dispatch"), "compact");

  assert.throws(() => resolveToolProfile("lite"), /Invalid NIUA_MCP_PROFILE: "lite"/);
});

test("core projection derives from manifest tiers (no hand list, no drift)", () => {
  // no tool is tier-less: every catalog entry carries a valid tier
  const invalidTier = GODOT_MCP_TOOLS
    .filter((tool) => tool.tier !== "essential" && tool.tier !== "standard")
    .map(({ name, tier }) => ({ name, tier }));
  assert.deepEqual(invalidTier, []);

  // the derived list is deduplicated and non-empty
  assert.ok(CORE_TOOL_NAMES.length > 0);
  assert.equal(new Set(CORE_TOOL_NAMES).size, CORE_TOOL_NAMES.length);

  // core projection === essential-tier set
  const essential = GODOT_MCP_TOOLS
    .filter((tool) => tool.tier === "essential")
    .map(({ name }) => name);
  assert.deepEqual([...CORE_TOOL_NAMES].sort(), [...new Set(essential)].sort());

  // selectProfileTools("core") returns exactly the essential set
  const core = selectProfileTools(GODOT_MCP_TOOLS, "core").map(({ name }) => name);
  assert.deepEqual([...core].sort(), [...new Set(essential)].sort());

  // the navigation primitive is part of every projection, core included
  assert.ok(CORE_TOOL_NAMES.includes("describe_tools"));
});

test("core profile names all exist in the implemented tool catalog", () => {
  const implemented = new Set(GODOT_MCP_TOOLS.map(({ name }) => name));
  const missing = CORE_TOOL_NAMES.filter((name) => !implemented.has(name));

  assert.deepEqual(missing, []);
  assert.equal(new Set(CORE_TOOL_NAMES).size, CORE_TOOL_NAMES.length);
  // back-compat export for external tooling
  assert.equal(V1_TOOL_NAMES, CORE_TOOL_NAMES);
});

test("selectProfileTools filters to core, passes full through, and throws on drift", () => {
  const full = selectProfileTools(GODOT_MCP_TOOLS, "full");
  assert.equal(full.length, GODOT_MCP_TOOLS.length);

  const core = selectProfileTools(GODOT_MCP_TOOLS, "core");
  assert.deepEqual(
    core.map(({ name }) => name).sort(),
    [...CORE_TOOL_NAMES].sort()
  );
  // Catalog order is preserved, not profile-list order.
  const fullNames = GODOT_MCP_TOOLS.map(({ name }) => name);
  const coreNames = core.map(({ name }) => name);
  assert.deepEqual(
    coreNames,
    fullNames.filter((name) => CORE_TOOL_NAMES.includes(name))
  );

  assert.throws(
    () => selectProfileTools(GODOT_MCP_TOOLS.slice(0, 5), "core"),
    /core tool profile references unknown tools/
  );
});

test("MCP server defaults to the core tool profile over stdio", async () => {
  const server = createMcpProcess({ NIUA_MCP_PROFILE: "" });

  try {
    await server.request("initialize", {});

    const tools = await server.request("tools/list");
    const names = tools.result.tools.map(({ name }) => name);
    assert.deepEqual([...names].sort(), [...V1_TOOL_NAMES].sort());

    const blocked = await server.request("tools/call", {
      name: "remove_audio_bus",
      arguments: {}
    });
    assert.match(blocked.error.message, /not in the "core" tool profile/);
    assert.match(blocked.error.message, /NIUA_MCP_PROFILE=full/);

    const unknown = await server.request("tools/call", {
      name: "definitely_not_a_tool",
      arguments: {}
    });
    assert.match(unknown.error.message, /Unknown Godot MCP tool/);
  } finally {
    await server.close();
  }
});

test("MCP server exposes the whole catalog under the full profile", async () => {
  const server = createMcpProcess({ NIUA_MCP_PROFILE: "full" });

  try {
    await server.request("initialize", {});

    const tools = await server.request("tools/list");
    assert.equal(tools.result.tools.length, GODOT_MCP_TOOLS.length);
  } finally {
    await server.close();
  }
});

test("MCP server refuses to start with an invalid tool profile", async () => {
  const server = createMcpProcess({ NIUA_MCP_PROFILE: "lite" });

  try {
    await assert.rejects(
      () => server.request("initialize", {}),
      /Invalid NIUA_MCP_PROFILE: "lite"/
    );
  } finally {
    await server.close();
  }
});
