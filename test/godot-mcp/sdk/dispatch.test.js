// test/godot-mcp/sdk/dispatch.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { createDispatch } from "../../../src/godot-mcp/sdk/dispatch.js";
import { assertAllowed } from "../../../src/godot-mcp/sdk/guard.js";
import { summarize } from "../../../src/godot-mcp/sdk/summary.js";

function fakeTools() {
  const calls = [];
  return {
    calls,
    tools: [
      { name: "get_scene_tree", handler: async (args) => { calls.push(args); return { ok: true, args }; } },
      { name: "open_project", handler: async () => ({ ok: true }) }
    ]
  };
}

test("dispatch merges connection args into handler payload", async () => {
  const { tools, calls } = fakeTools();
  const call = createDispatch({ tools, conn: { host: "127.0.0.1", port: 9999, token: "t" } });
  const res = await call("get_scene_tree", { maxDepth: 2 });
  assert.equal(res.ok, true);
  assert.deepEqual(calls[0], { host: "127.0.0.1", port: 9999, token: "t", maxDepth: 2 });
});

test("dispatch rejects denylisted lifecycle tools", async () => {
  const { tools } = fakeTools();
  const call = createDispatch({ tools, conn: {} });
  await assert.rejects(() => call("open_project", {}), /denylist|not allowed/i);
});

test("dispatch throws on unknown tool", async () => {
  const call = createDispatch({ tools: [], conn: {} });
  await assert.rejects(() => call("nope", {}), /unknown tool/i);
});

test("dispatch enforces maxCalls budget", async () => {
  const { tools } = fakeTools();
  const call = createDispatch({ tools, conn: {}, maxCalls: 1 });
  await call("get_scene_tree", {});
  await assert.rejects(() => call("get_scene_tree", {}), /max.*calls|budget/i);
});

test("assertAllowed throws for denylisted, passes otherwise", () => {
  assert.throws(() => assertAllowed("export_project"), /denylist|not allowed/i);
  assert.doesNotThrow(() => assertAllowed("get_scene_tree"));
});

test("summarize renders counts and failures compactly", () => {
  const out = summarize("blockout", { ok: 12, fail: ["set_node_property: 404"], notes: ["scene saved"] });
  assert.match(out, /blockout/);
  assert.match(out, /ok=12/);
  assert.match(out, /set_node_property: 404/);
});
