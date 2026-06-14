import test from "node:test";
import assert from "node:assert/strict";

import { ACTIVE_TOOL_PROFILE, TOOL_DEFINITIONS } from "../../../src/godot-mcp/server.js";
import { selectProfileTools } from "../../../src/godot-mcp/server/tool-profiles.js";
import { GODOT_MCP_TOOLS } from "../../../src/godot-mcp/tools/index.js";

test("GODOT_MCP_TOOLS is the ordered public tool catalog with handlers", () => {
  const names = GODOT_MCP_TOOLS.map(({ name }) => name);
  const profiledNames = selectProfileTools(GODOT_MCP_TOOLS, ACTIVE_TOOL_PROFILE)
    .map(({ name }) => name);

  assert.deepEqual(profiledNames, TOOL_DEFINITIONS.map(({ name }) => name));
  assert.equal(new Set(names).size, names.length);

  for (const tool of GODOT_MCP_TOOLS) {
    assert.equal(typeof tool.description, "string");
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(typeof tool.handler, "function");
  }
});
