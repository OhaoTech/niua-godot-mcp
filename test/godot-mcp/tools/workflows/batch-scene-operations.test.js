import assert from "node:assert/strict";
import { test } from "node:test";

import { createApplySceneRecipe } from "../../../../src/godot-mcp/tools/workflows/recipes/apply.js";
import { createBatchSceneOperations } from "../../../../src/godot-mcp/tools/workflows/recipes/batch.js";
import { RECIPE_WORKFLOW_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/workflows/recipes/index.js";

function toolResultText(value) {
  return { content: [{ type: "text", text: `${JSON.stringify(value)}\n` }] };
}

test("batch_scene_operations is registered as a v1 local tool beside apply_scene_recipe", () => {
  const definition = RECIPE_WORKFLOW_TOOL_DEFINITIONS.find((tool) => tool.name === "batch_scene_operations");
  assert.ok(definition, "batch_scene_operations missing from recipe workflow definitions");
  assert.equal(definition.inputSchema.properties.steps.type, "array");
  assert.equal(definition.inputSchema.properties.steps.items.type, "object");
  assert.equal(definition.inputSchema.properties.steps.items.properties.tool.type, "string");
  assert.equal(definition.inputSchema.properties.steps.items.properties.args.type, "object");
  assert.equal(definition.inputSchema.properties.steps.items.properties.label.type, "string");
  assert.deepEqual(definition.inputSchema.properties.steps.items.required, ["tool"]);
  assert.equal(definition.inputSchema.properties.stopOnError.type, "boolean");
  assert.deepEqual(definition.inputSchema.required, ["steps"]);
  assert.equal(typeof definition.handler, "function");
});

test("executes every inline step and returns a compact pass summary", async () => {
  const calls = [];
  const batch = createBatchSceneOperations({
    callTool: async (name, args) => {
      calls.push({ name, args });
      return toolResultText({ ok: true, data: { huge: "x".repeat(5000) } });
    }
  });

  const result = await batch({
    expectedProjectRoot: "/proj",
    steps: [
      { tool: "create_node", args: { type: "Node3D" } },
      { tool: "save_current_scene" }
    ]
  });

  assert.deepEqual(result, {
    ok: true,
    totalSteps: 2,
    executed: 2,
    succeeded: 2,
    failed: []
  });
  // connection args are injected into each step
  assert.equal(calls[0].args.expectedProjectRoot, "/proj");
  assert.equal(calls[0].args.type, "Node3D");
});

test("token contract: 50 successful steps still return a tiny summary", async () => {
  const batch = createBatchSceneOperations({
    callTool: async () => toolResultText({ ok: true, data: { payload: "y".repeat(10000) } })
  });

  const result = await batch({
    steps: Array.from({ length: 50 }, (_, i) => ({ tool: "create_node", args: { name: `N${i}` } }))
  });

  assert.equal(result.succeeded, 50);
  assert.ok(
    JSON.stringify(result).length < 500,
    `batch summary leaked step payloads: ${JSON.stringify(result).length} chars`
  );
});

test("caps inline batches at 50 steps and points bigger ones at apply_scene_recipe", async () => {
  const batch = createBatchSceneOperations({
    callTool: async () => toolResultText({ ok: true })
  });

  await assert.rejects(
    () => batch({ steps: Array.from({ length: 51 }, () => ({ tool: "create_node" })) }),
    /inline cap is 50.*apply_scene_recipe/
  );
});

test("rejects missing and empty step lists", async () => {
  const batch = createBatchSceneOperations({
    callTool: async () => toolResultText({ ok: true })
  });

  await assert.rejects(() => batch({}), /non-empty steps array/);
  await assert.rejects(() => batch({ steps: [] }), /non-empty steps array/);
});

test("stops at the first ok:false step by default and reports it", async () => {
  let callCount = 0;
  const batch = createBatchSceneOperations({
    callTool: async (name) => {
      callCount += 1;
      if (name === "boom") {
        return toolResultText({ ok: false, error: "node not found: Missing" });
      }
      return toolResultText({ ok: true });
    }
  });

  const result = await batch({
    steps: [
      { tool: "create_node" },
      { tool: "boom", label: "the bad one" },
      { tool: "create_node" }
    ]
  });

  assert.equal(result.ok, false);
  assert.equal(callCount, 2);
  assert.equal(result.failed.length, 1);
  assert.equal(result.failed[0].step, 1);
  assert.equal(result.failed[0].label, "the bad one");
  assert.match(result.failed[0].error, /node not found/);
  assert.equal(result.stoppedAt, 1);
});

test("stopOnError false runs all steps and collects failures, thrown included", async () => {
  const batch = createBatchSceneOperations({
    callTool: async (name) => {
      if (name === "throws") {
        throw new Error("bridge unreachable");
      }
      if (name === "fails") {
        return toolResultText({ ok: false, error: "invalid value" });
      }
      return toolResultText({ ok: true });
    }
  });

  const result = await batch({
    stopOnError: false,
    steps: [{ tool: "throws" }, { tool: "fails" }, { tool: "create_node" }]
  });

  assert.equal(result.ok, false);
  assert.equal(result.succeeded, 1);
  assert.equal(result.failed.length, 2);
  assert.match(result.failed[0].error, /bridge unreachable/);
  assert.match(result.failed[1].error, /invalid value/);
  assert.equal(result.stoppedAt, undefined);
});

test("denies process-lifecycle tools and both batch executors inside a batch", async () => {
  const batch = createBatchSceneOperations({
    callTool: async () => toolResultText({ ok: true })
  });

  for (const tool of ["open_project", "apply_scene_recipe", "batch_scene_operations"]) {
    const result = await batch({ steps: [{ tool }] });
    assert.equal(result.ok, false, `${tool} should be denied`);
    assert.match(result.failed[0].error, /not allowed inside a recipe/);
    assert.equal(result.executed, 0);
  }
});

test("apply_scene_recipe denies batch_scene_operations inside recipes (no nesting)", async () => {
  const apply = createApplySceneRecipe({
    callTool: async () => toolResultText({ ok: true }),
    readFileImpl: async () => JSON.stringify({ steps: [{ tool: "batch_scene_operations" }] })
  });

  const result = await apply({ recipePath: "/tmp/r.json" });
  assert.equal(result.ok, false);
  assert.match(result.failed[0].error, /not allowed inside a recipe/);
});
