import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_TOOL_PROFILE,
  V1_TOOL_NAMES,
  resolveToolProfile,
  selectProfileTools
} from "../../../src/godot-mcp/server/tool-profiles.js";
import { GODOT_MCP_TOOLS } from "../../../src/godot-mcp/tools/index.js";
import { createMcpProcess } from "../helpers/server-harness.js";

test("resolveToolProfile defaults to v1 and validates explicit values", () => {
  assert.equal(DEFAULT_TOOL_PROFILE, "v1");
  assert.equal(resolveToolProfile(undefined), "v1");
  assert.equal(resolveToolProfile(""), "v1");
  assert.equal(resolveToolProfile("   "), "v1");
  assert.equal(resolveToolProfile("v1"), "v1");
  assert.equal(resolveToolProfile("full"), "full");
  assert.equal(resolveToolProfile(" FULL "), "full");

  assert.throws(() => resolveToolProfile("lite"), /Invalid NIUA_MCP_PROFILE: "lite"/);
});

test("v1 profile names all exist in the implemented tool catalog", () => {
  const implemented = new Set(GODOT_MCP_TOOLS.map(({ name }) => name));
  const missing = V1_TOOL_NAMES.filter((name) => !implemented.has(name));

  assert.deepEqual(missing, []);
  assert.equal(new Set(V1_TOOL_NAMES).size, V1_TOOL_NAMES.length);
});

test("selectProfileTools filters to v1, passes full through, and throws on drift", () => {
  const full = selectProfileTools(GODOT_MCP_TOOLS, "full");
  assert.equal(full.length, GODOT_MCP_TOOLS.length);

  const v1 = selectProfileTools(GODOT_MCP_TOOLS, "v1");
  assert.deepEqual(
    v1.map(({ name }) => name).sort(),
    [...V1_TOOL_NAMES].sort()
  );
  // Catalog order is preserved, not profile-list order.
  const fullNames = GODOT_MCP_TOOLS.map(({ name }) => name);
  const v1Names = v1.map(({ name }) => name);
  assert.deepEqual(
    v1Names,
    fullNames.filter((name) => V1_TOOL_NAMES.includes(name))
  );

  assert.throws(
    () => selectProfileTools(GODOT_MCP_TOOLS.slice(0, 5), "v1"),
    /v1 tool profile references unknown tools/
  );
});

test("MCP server defaults to the v1 tool profile over stdio", async () => {
  const server = createMcpProcess({ NIUA_MCP_PROFILE: "" });

  try {
    await server.request("initialize", {});

    const tools = await server.request("tools/list");
    const names = tools.result.tools.map(({ name }) => name);
    assert.deepEqual([...names].sort(), [...V1_TOOL_NAMES].sort());

    const blocked = await server.request("tools/call", {
      name: "list_export_presets",
      arguments: {}
    });
    assert.match(blocked.error.message, /not in the "v1" tool profile/);
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
