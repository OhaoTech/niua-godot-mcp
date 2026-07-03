import assert from "node:assert/strict";
import { test } from "node:test";

import { createApplySceneRecipe } from "../../../../src/godot-mcp/tools/workflows/recipes/apply.js";
import { RECIPE_WORKFLOW_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/workflows/recipes/index.js";

function toolResultText(value) {
  return { content: [{ type: "text", text: `${JSON.stringify(value)}\n` }] };
}

function fakeReadFile(recipe) {
  return async () => JSON.stringify(recipe);
}

test("apply_scene_recipe is registered as a v1 local tool", () => {
  const [definition] = RECIPE_WORKFLOW_TOOL_DEFINITIONS;
  assert.equal(definition.name, "apply_scene_recipe");
  assert.ok(definition.inputSchema.properties.recipePath);
  assert.equal(typeof definition.handler, "function");
});

test("executes every step and returns a compact pass summary", async () => {
  const calls = [];
  const apply = createApplySceneRecipe({
    callTool: async (name, args) => {
      calls.push({ name, args });
      return toolResultText({ ok: true, data: { huge: "x".repeat(5000) } });
    },
    readFileImpl: fakeReadFile({
      name: "test-recipe",
      steps: [
        { tool: "create_node", args: { type: "Node3D" } },
        { tool: "save_current_scene" }
      ]
    })
  });

  const result = await apply({ recipePath: "/tmp/r.json", expectedProjectRoot: "/proj" });
  assert.deepEqual(
    { ok: result.ok, totalSteps: result.totalSteps, executed: result.executed, succeeded: result.succeeded, failed: result.failed },
    { ok: true, totalSteps: 2, executed: 2, succeeded: 2, failed: [] }
  );
  assert.equal(result.recipe, "test-recipe");
  // connection args are injected into each step
  assert.equal(calls[0].args.expectedProjectRoot, "/proj");
  assert.equal(calls[0].args.type, "Node3D");
});

test("token contract: 100 successful steps still return a tiny summary", async () => {
  const apply = createApplySceneRecipe({
    callTool: async () => toolResultText({ ok: true, data: { payload: "y".repeat(10000) } }),
    readFileImpl: fakeReadFile({
      steps: Array.from({ length: 100 }, (_, i) => ({ tool: "create_node", args: { name: `N${i}` } }))
    })
  });

  const result = await apply({ recipePath: "/tmp/big.json" });
  assert.equal(result.succeeded, 100);
  assert.ok(
    JSON.stringify(result).length < 500,
    `recipe summary leaked step payloads: ${JSON.stringify(result).length} chars`
  );
});

test("stops at the first ok:false step by default and reports it", async () => {
  let callCount = 0;
  const apply = createApplySceneRecipe({
    callTool: async (name) => {
      callCount += 1;
      if (name === "boom") {
        return toolResultText({ ok: false, error: "node not found: Missing" });
      }
      return toolResultText({ ok: true });
    },
    readFileImpl: fakeReadFile({
      steps: [
        { tool: "create_node" },
        { tool: "boom", label: "the bad one" },
        { tool: "create_node" }
      ]
    })
  });

  const result = await apply({ recipePath: "/tmp/r.json" });
  assert.equal(result.ok, false);
  assert.equal(callCount, 2);
  assert.equal(result.failed.length, 1);
  assert.equal(result.failed[0].step, 1);
  assert.equal(result.failed[0].label, "the bad one");
  assert.match(result.failed[0].error, /node not found/);
  assert.equal(result.stoppedAt, 1);
});

test("stopOnError false runs all steps and collects failures, thrown included", async () => {
  const apply = createApplySceneRecipe({
    callTool: async (name) => {
      if (name === "throws") {
        throw new Error("bridge unreachable");
      }
      if (name === "fails") {
        return toolResultText({ ok: false, error: "invalid value" });
      }
      return toolResultText({ ok: true });
    },
    readFileImpl: fakeReadFile({
      steps: [{ tool: "throws" }, { tool: "fails" }, { tool: "create_node" }]
    })
  });

  const result = await apply({ recipePath: "/tmp/r.json", stopOnError: false });
  assert.equal(result.ok, false);
  assert.equal(result.succeeded, 1);
  assert.equal(result.failed.length, 2);
  assert.match(result.failed[0].error, /bridge unreachable/);
  assert.match(result.failed[1].error, /invalid value/);
  assert.equal(result.stoppedAt, undefined);
});

test("denies process-lifecycle tools and itself inside recipes", async () => {
  const apply = createApplySceneRecipe({
    callTool: async () => toolResultText({ ok: true }),
    readFileImpl: fakeReadFile({ steps: [{ tool: "open_project" }] })
  });

  const result = await apply({ recipePath: "/tmp/r.json" });
  assert.equal(result.ok, false);
  assert.match(result.failed[0].error, /not allowed inside a recipe/);
  assert.equal(result.executed, 0);
});

test("resolves res:// recipe paths under expectedProjectRoot", async () => {
  let readPath = "";
  const apply = createApplySceneRecipe({
    callTool: async () => toolResultText({ ok: true }),
    readFileImpl: async (recipePath) => {
      readPath = recipePath;
      return JSON.stringify({ steps: [{ tool: "create_node" }] });
    }
  });

  await apply({ recipePath: "res://recipes/level.json", expectedProjectRoot: "/home/user/game" });
  assert.equal(readPath, "/home/user/game/recipes/level.json");

  await assert.rejects(
    () => apply({ recipePath: "res://x.json" }),
    /requires expectedProjectRoot/
  );
  await assert.rejects(
    () => apply({ recipePath: "relative/path.json" }),
    /must be absolute/
  );
});

test("rejects unreadable, invalid, empty, and oversized recipes", async () => {
  const failingRead = createApplySceneRecipe({
    callTool: async () => toolResultText({ ok: true }),
    readFileImpl: async () => {
      throw new Error("ENOENT");
    }
  });
  await assert.rejects(() => failingRead({ recipePath: "/tmp/missing.json" }), /could not read recipe file/);

  const badJson = createApplySceneRecipe({
    callTool: async () => toolResultText({ ok: true }),
    readFileImpl: async () => "not json"
  });
  await assert.rejects(() => badJson({ recipePath: "/tmp/bad.json" }), /not valid JSON/);

  const empty = createApplySceneRecipe({
    callTool: async () => toolResultText({ ok: true }),
    readFileImpl: fakeReadFile({ steps: [] })
  });
  await assert.rejects(() => empty({ recipePath: "/tmp/empty.json" }), /non-empty steps array/);

  const oversized = createApplySceneRecipe({
    callTool: async () => toolResultText({ ok: true }),
    readFileImpl: fakeReadFile({ steps: Array.from({ length: 501 }, () => ({ tool: "create_node" })) })
  });
  await assert.rejects(() => oversized({ recipePath: "/tmp/huge.json" }), /maxSteps is 500/);
});
