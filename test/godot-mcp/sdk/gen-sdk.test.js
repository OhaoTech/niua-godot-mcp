// test/godot-mcp/sdk/gen-sdk.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { renderSdk } from "../../../scripts/gen-sdk.mjs";

function syntheticTools() {
  return [
    {
      name: "tool_with_comment_close",
      category: "misc",
      description: "closes comment */ here",
      inputSchema: {
        type: "object",
        properties: {
          weird: { type: "string", description: "also has */ inside it" }
        },
        required: []
      }
    }
  ];
}

test("renderSdk escapes */ in JSDoc so the emitted module is valid, loadable JS", async () => {
  const tools = syntheticTools();
  const rendered = renderSdk(tools);

  // The unescaped sequence must not appear inside the emitted JSDoc bodies.
  assert.ok(!rendered.includes("closes comment */ here"), "tool description */ was not escaped");
  assert.ok(!rendered.includes("also has */ inside it"), "property description */ was not escaped");

  const mod = await import("data:text/javascript," + encodeURIComponent(rendered));
  assert.equal(typeof mod.buildNamespaces, "function");

  const calls = [];
  const namespaces = mod.buildNamespaces((name, args) => {
    calls.push([name, args]);
    return { name, args };
  });
  assert.ok(namespaces.misc, "expected the synthetic category to be present");
  assert.equal(typeof namespaces.misc.tool_with_comment_close, "function");
  namespaces.misc.tool_with_comment_close({ weird: "x" });
  assert.deepEqual(calls, [["tool_with_comment_close", { weird: "x" }]]);
});

test("renderSdk is deterministic for a given input", () => {
  const tools = syntheticTools();
  assert.equal(renderSdk(tools), renderSdk(tools));
});
