import assert from "node:assert/strict";
import { test } from "node:test";

import { serverInstructions } from "../../../src/godot-mcp/server/instructions.js";
import { handleRequest } from "../../../src/godot-mcp/server/request-handler.js";

test("initialize serves golden-path instructions to every client", async () => {
  const result = await handleRequest({ method: "initialize", params: {} });
  assert.equal(typeof result.instructions, "string");
  // the load-bearing guidance must survive edits
  assert.match(result.instructions, /apply_scene_recipe/);
  assert.match(result.instructions, /save_scene_as|saveBeforeRun/);
  assert.match(result.instructions, /run_playtest_evidence/);
  assert.match(result.instructions, /wait_for_imported_asset/);
  assert.match(result.instructions, /maxDepth/);
  assert.match(result.instructions, /savePath/);
  // it lands in system context once per session — keep it terse
  assert.ok(result.instructions.length < 2500, `instructions grew to ${result.instructions.length} chars`);
});

test("dispatch profile instructions explain the describe flow", () => {
  const dispatch = serverInstructions("compact");
  assert.match(dispatch, /action: "describe"/);
  const core = serverInstructions("core");
  assert.doesNotMatch(core, /action: "describe"/);
});
