import test from "node:test";
import assert from "node:assert/strict";

import { VIEWPORT2D_TOOL_DEFINITIONS } from "../../../src/godot-mcp/tools/viewport/viewport2d/index.js";

test("2D viewport module remains an explicit empty landing zone", () => {
  assert.deepEqual(VIEWPORT2D_TOOL_DEFINITIONS, []);
  assert.equal(Object.isFrozen(VIEWPORT2D_TOOL_DEFINITIONS), true);
});
