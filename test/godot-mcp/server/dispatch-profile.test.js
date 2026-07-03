import assert from "node:assert/strict";
import { test } from "node:test";

import { dispatchToolsFromCatalog } from "../../../src/godot-mcp/server/dispatch-profile.js";
import { resolveToolProfile, selectProfileTools } from "../../../src/godot-mcp/server/tool-profiles.js";
import { GODOT_MCP_TOOLS } from "../../../src/godot-mcp/tools/index.js";

const SCHEMA_BUDGET_CHARS = 20000; // ~5K tokens — the whole point of the profile

function dispatchDefinitions() {
  return dispatchToolsFromCatalog(GODOT_MCP_TOOLS).map(({ handler, category, ...definition }) => definition);
}

test("dispatch profile is a valid, selectable profile", () => {
  assert.equal(resolveToolProfile("dispatch"), "dispatch");
  const tools = selectProfileTools(GODOT_MCP_TOOLS, "dispatch");
  assert.ok(tools.length < 20, `expected a handful of dispatchers, got ${tools.length}`);
});

test("every catalog tool is reachable through exactly one dispatcher action", () => {
  const dispatchers = dispatchToolsFromCatalog(GODOT_MCP_TOOLS);
  const reachable = new Map();

  for (const tool of dispatchers) {
    const actionEnum = tool.inputSchema.properties.action?.enum;
    if (!actionEnum) {
      // standalone tool (apply_scene_recipe) counts as reachable by itself
      reachable.set(tool.name, (reachable.get(tool.name) ?? 0) + 1);
      continue;
    }
    for (const action of actionEnum) {
      if (action === "describe") {
        continue;
      }
      reachable.set(action, (reachable.get(action) ?? 0) + 1);
    }
  }

  for (const tool of GODOT_MCP_TOOLS) {
    const count = reachable.get(tool.name) ?? 0;
    assert.equal(count, 1, `tool ${tool.name} reachable ${count} times (expected exactly 1)`);
  }
});

test("dispatch schema listing stays inside the token budget", () => {
  const chars = JSON.stringify(dispatchDefinitions()).length;
  assert.ok(
    chars < SCHEMA_BUDGET_CHARS,
    `dispatch profile schemas grew to ${chars} chars (budget ${SCHEMA_BUDGET_CHARS})`
  );
});

test("dispatcher routes actions to the real handler with merged connection args", async () => {
  const seen = [];
  const fakeCatalog = [
    {
      name: "create_node",
      description: "Create a node.",
      category: "nodes-common",
      inputSchema: { type: "object", properties: {} },
      handler: async (args) => {
        seen.push(args);
        return { content: [{ type: "text", text: "{\"ok\":true}\n" }] };
      }
    }
  ];

  const [dispatcher] = dispatchToolsFromCatalog(fakeCatalog);
  assert.equal(dispatcher.name, "godot_node");

  await dispatcher.handler({
    action: "create_node",
    expectedProjectRoot: "/proj",
    args: { type: "Node3D", name: "Player" }
  });
  assert.deepEqual(seen[0], { expectedProjectRoot: "/proj", type: "Node3D", name: "Player" });

  // step args override top-level connection values
  await dispatcher.handler({
    action: "create_node",
    expectedProjectRoot: "/proj",
    args: { expectedProjectRoot: "/other" }
  });
  assert.equal(seen[1].expectedProjectRoot, "/other");
});

test("describe lists actions and serves full schemas on demand", async () => {
  const fakeCatalog = [
    {
      name: "create_node",
      description: "Create a node in the current edited Godot scene. Second sentence.",
      category: "nodes-common",
      inputSchema: { type: "object", properties: { type: { type: "string" } } },
      handler: async () => ({ content: [] })
    }
  ];
  const [dispatcher] = dispatchToolsFromCatalog(fakeCatalog);

  const list = JSON.parse((await dispatcher.handler({ action: "describe" })).content[0].text);
  assert.equal(list.domain, "godot_node");
  assert.deepEqual(list.actions, [
    { name: "create_node", summary: "Create a node in the current edited Godot scene." }
  ]);

  const one = JSON.parse(
    (await dispatcher.handler({ action: "describe", name: "create_node" })).content[0].text
  );
  assert.deepEqual(one.inputSchema, fakeCatalog[0].inputSchema);

  await assert.rejects(
    () => dispatcher.handler({ action: "describe", name: "missing" }),
    /Unknown godot_node action to describe/
  );
});

test("unknown actions fail with the valid action list", async () => {
  const fakeCatalog = [
    {
      name: "run_main_scene",
      description: "Run.",
      category: "run",
      inputSchema: { type: "object", properties: {} },
      handler: async () => ({ content: [] })
    }
  ];
  const [dispatcher] = dispatchToolsFromCatalog(fakeCatalog);
  await assert.rejects(
    () => dispatcher.handler({ action: "warp_speed" }),
    /Unknown godot_run action: "warp_speed"\. Valid actions: run_main_scene, describe\./
  );
});

test("uncategorized or unmapped tools fail loudly at profile build", () => {
  assert.throws(
    () => dispatchToolsFromCatalog([
      {
        name: "mystery_tool",
        description: "?",
        category: "unmapped-category",
        inputSchema: { type: "object", properties: {} },
        handler: async () => ({ content: [] })
      }
    ]),
    /no domain for tool "mystery_tool"/
  );
});
