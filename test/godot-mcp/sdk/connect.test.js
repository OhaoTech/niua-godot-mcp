import assert from "node:assert/strict";
import { test } from "node:test";
import { connect } from "../../../src/godot-mcp/sdk/index.js";

test("connect exposes real domains bound to injected handlers", async () => {
  const seen = [];
  const tools = [
    { name: "get_scene_tree", category: "scene", inputSchema: { properties: {}, required: [] },
      handler: async (args) => { seen.push(args); return { root: "Main" }; } }
  ];
  const godot = connect({ tools, host: "h", port: 1, token: "k" });
  assert.equal(typeof godot.scene.get_scene_tree, "function");
  const res = await godot.scene.get_scene_tree({ maxDepth: 1 });
  assert.deepEqual(res, { root: "Main" });
  assert.deepEqual(seen[0], { host: "h", port: 1, token: "k", maxDepth: 1 });
  assert.equal(typeof godot.summarize, "function");
});
