import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  createMcpProcess,
  repoRoot,
  withBridgeServer
} from "../helpers/server-harness.js";
import { dispatchToolsFromCatalog } from "../../../src/godot-mcp/server/dispatch-profile.js";
import { GODOT_MCP_TOOLS } from "../../../src/godot-mcp/tools/index.js";
import { getGodotVersionTool } from "../../../src/godot-mcp/tools/runtime/index.js";
import { createBatchSceneOperations } from "../../../src/godot-mcp/tools/workflows/recipes/batch.js";
import { createApplySceneRecipe } from "../../../src/godot-mcp/tools/workflows/recipes/apply.js";

// D11 output-shape contracts (docs/godot-mcp/quality-delivery-architecture.md):
// our own tool responses have declared shapes, validated in CI.
//
// Honesty note: local tools (get_godot_version, batch/recipe summaries,
// dispatch describe) are validated against REAL handler outputs. Bridge tools
// need a live editor, so they are validated against FIXTURE bridge responses
// that mirror the addon source (file references on each fixture) — the live
// half of the guarantee stays with scripts/conformance.mjs.

// --- lightweight shape checker (no deps) -----------------------------------
// Shape grammar: a string names a scalar type; { type:"array", items } checks
// every element; anything else is an object shape with required/optional key
// maps, closed by default (extra keys fail unless closed:false).

function checkShape(value, shape, at = "$") {
  if (typeof shape === "string") {
    return matchesType(value, shape) ? [] : [`${at}: expected ${shape}, got ${render(value)}`];
  }
  if (shape.type === "array") {
    if (!Array.isArray(value)) {
      return [`${at}: expected array, got ${render(value)}`];
    }
    return value.flatMap((item, index) => checkShape(item, shape.items, `${at}[${index}]`));
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return [`${at}: expected object, got ${render(value)}`];
  }
  const required = shape.required ?? {};
  const optional = shape.optional ?? {};
  const errors = [];
  for (const [key, keyShape] of Object.entries(required)) {
    if (!(key in value)) {
      errors.push(`${at}.${key}: missing required key`);
      continue;
    }
    errors.push(...checkShape(value[key], keyShape, `${at}.${key}`));
  }
  for (const [key, keyShape] of Object.entries(optional)) {
    if (key in value) {
      errors.push(...checkShape(value[key], keyShape, `${at}.${key}`));
    }
  }
  if (shape.closed !== false) {
    for (const key of Object.keys(value)) {
      if (!(key in required) && !(key in optional)) {
        errors.push(`${at}.${key}: unexpected key in closed shape`);
      }
    }
  }
  return errors;
}

function matchesType(value, type) {
  switch (type) {
    case "string": return typeof value === "string";
    case "nonempty-string": return typeof value === "string" && value.length > 0;
    case "number": return typeof value === "number" && Number.isFinite(value);
    case "integer": return Number.isInteger(value);
    case "boolean": return typeof value === "boolean";
    case "null": return value === null;
    case "any": return true;
    default: throw new Error(`unknown shape type: ${type}`);
  }
}

function render(value) {
  return Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
}

function assertShape(value, shape, label) {
  assert.deepEqual(checkShape(value, shape), [], `${label} violated its declared shape`);
}

test("shape checker rejects wrong types, missing keys, and extra keys", () => {
  const shape = { required: { a: "string" }, optional: { b: "integer" } };
  assert.deepEqual(checkShape({ a: "x" }, shape), []);
  assert.deepEqual(checkShape({ a: "x", b: 2 }, shape), []);
  assert.equal(checkShape({ a: 1 }, shape).length, 1);
  assert.equal(checkShape({}, shape).length, 1);
  assert.equal(checkShape({ a: "x", z: true }, shape).length, 1);
  assert.deepEqual(checkShape({ a: "x", z: true }, { ...shape, closed: false }), []);
  assert.equal(checkShape([1, "x"], { type: "array", items: "integer" }).length, 1);
  assert.equal(checkShape("", "nonempty-string").length, 1);
});

// --- errorCode registry ------------------------------------------------------
// Every errorCode the addon emits, pinned so new codes are added deliberately
// (and documented) instead of leaking in ad hoc. Envelope rule: every bridge
// response is {ok:true,data:{...}} or {ok:false,error:<nonempty>,errorCode?}.
// (validate_script's ok:true data carries an integer "errorCode" field — that
// is Godot's Error enum inside data, not the error envelope, and is exempt.)

const ERROR_CODE_REGISTRY = new Set([
  "attach_failed",
  "bad_request",
  "batch_failed",
  "conflict",
  "delete_failed",
  "invalid_class_name",
  "invalid_node",
  "invalid_request",
  "invalid_resource",
  "invalid_value",
  "method_not_allowed",
  "no_main_scene",
  "selection_failed",
  "not_found",
  "payload_too_large",
  "too_many_files",
  "too_many_replacements",
  "unauthorized",
  "unknown_action",
  "unknown_button",
  "unknown_property",
  "unsaved_scene",
  "unsupported_operation",
  "unsupported_template"
]);

function extractAddonErrorCodes(source) {
  const codes = new Set();
  // Literal envelope entries: "errorCode": "some_code"
  for (const match of source.matchAll(/"errorCode"\s*:\s*"([a-z][a-z_0-9]*)"/g)) {
    codes.add(match[1]);
  }
  // Error-helper defaults: code: String = "bad_request"
  for (const match of source.matchAll(/code: String = "([a-z][a-z_0-9]*)"/g)) {
    codes.add(match[1]);
  }
  // Call sites: error("message...", "some_code") — collapse multi-line calls
  // first so the trailing-argument anchor sees one statement per line.
  const collapsed = source
    .replace(/,\s*\n\s*/g, ", ")
    .replace(/\(\s*\n\s*/g, "(")
    .replace(/\s*\n\s*\)/g, ")");
  for (const line of collapsed.split("\n")) {
    if (!/(?:\berror|_error|error_payload)\(/.test(line)) {
      continue;
    }
    const match = line.match(/,\s*"([a-z][a-z_0-9]*)"\s*\)\s*$/);
    if (match) {
      codes.add(match[1]);
    }
  }
  return codes;
}

test("addon errorCodes stay inside the pinned registry (and none go dead)", async () => {
  const addonRoot = path.join(repoRoot, "godot/addons/niua_mcp");
  const files = (await readdir(addonRoot)).filter((name) => name.endsWith(".gd"));
  assert.ok(files.length > 100, `expected the addon sources, found ${files.length} files`);

  const found = new Set();
  for (const file of files) {
    const source = await readFile(path.join(addonRoot, file), "utf8");
    for (const code of extractAddonErrorCodes(source)) {
      assert.ok(
        ERROR_CODE_REGISTRY.has(code),
        `${file} emits errorCode "${code}" that is not in the pinned registry — add it deliberately`
      );
      found.add(code);
    }
  }

  for (const code of ERROR_CODE_REGISTRY) {
    assert.ok(found.has(code), `registry code "${code}" is no longer emitted anywhere — remove it`);
  }
});

// --- envelope + per-tool shapes ---------------------------------------------

function validateBridgeFixture(fixture, label) {
  if (fixture.ok === true) {
    const errors = checkShape(fixture, {
      required: { ok: "boolean", data: { closed: false } },
      closed: true
    });
    assert.deepEqual(errors, [], `${label} success fixture must be {ok:true,data:{...}}`);
    return;
  }
  const errors = checkShape(fixture, {
    required: { ok: "boolean", error: "nonempty-string" },
    optional: { errorCode: "nonempty-string" },
    closed: true
  });
  assert.deepEqual(errors, [], `${label} error fixture must be {ok:false,error,errorCode?}`);
  if (fixture.errorCode !== undefined) {
    assert.ok(
      ERROR_CODE_REGISTRY.has(fixture.errorCode),
      `${label} fixture errorCode "${fixture.errorCode}" is not in the registry`
    );
  }
}

// Recursive node snapshot shape (niua_mcp_node_snapshot.gd serialize_node).
const NODE_SNAPSHOT_SHAPE = {
  required: {
    name: "nonempty-string",
    path: "string",
    type: "nonempty-string",
    sceneFilePath: "string",
    children: { type: "array", items: null }
  },
  optional: { childrenTruncated: "integer" },
  closed: true
};
NODE_SNAPSHOT_SHAPE.required.children.items = NODE_SNAPSHOT_SHAPE;

// Normalized MCP tool output for bridge tools (protocol.js
// normalizeBridgeResponse): success keeps {ok,data}; errors surface as
// {ok:false,error,errorCode?,data} — the addon's errorCode survives
// normalization whenever the bridge sent one (Slice 4).
function toolSuccessShape(dataShape) {
  return { required: { ok: "boolean", data: dataShape }, closed: true };
}

const TOOL_ERROR_SHAPE = {
  required: { ok: "boolean", error: "nonempty-string", errorCode: "nonempty-string", data: "null" },
  closed: true
};

// Fixtures mirror the addon handlers named on each entry; per-tool data shapes
// are the contract under test.
const BRIDGE_TOOL_CONTRACTS = [
  {
    tool: "list_filesystem",
    args: { path: "res://" },
    endpoint: "/filesystem/list",
    method: "GET",
    // niua_mcp_filesystem_read_operations.gd list_filesystem
    fixture: {
      ok: true,
      data: {
        path: "res://",
        recursive: false,
        entries: [
          { name: "icon.svg", path: "res://icon.svg", type: "file" },
          { name: "scenes", path: "res://scenes", type: "directory" }
        ]
      }
    },
    dataShape: {
      required: {
        path: "nonempty-string",
        recursive: "boolean",
        entries: {
          type: "array",
          items: {
            required: { name: "nonempty-string", path: "nonempty-string", type: "nonempty-string" },
            closed: true
          }
        }
      },
      closed: true
    },
    extraChecks(data) {
      for (const entry of data.entries) {
        assert.ok(["file", "directory"].includes(entry.type), `entry type ${entry.type}`);
      }
    }
  },
  {
    tool: "get_scene_tree",
    args: {},
    endpoint: "/scene/tree",
    method: "GET",
    // niua_mcp_editor_state_operations.gd scene_tree + node_snapshot.gd
    fixture: {
      ok: true,
      data: {
        currentScene: "res://scenes/main.tscn",
        root: {
          name: "Main",
          path: "",
          type: "Node2D",
          sceneFilePath: "res://scenes/main.tscn",
          children: [
            {
              name: "Player",
              path: "Player",
              type: "CharacterBody2D",
              sceneFilePath: "",
              children: [],
              childrenTruncated: 2
            }
          ]
        }
      }
    },
    dataShape: {
      required: { currentScene: "string", root: NODE_SNAPSHOT_SHAPE },
      closed: true
    }
  },
  {
    tool: "get_inspector_properties",
    args: { nodePath: "Player" },
    endpoint: "/inspector/properties",
    method: "GET",
    // niua_mcp_scene_inspector_operations.gd inspector_properties (compact mode)
    fixture: {
      ok: true,
      data: {
        nodePath: "Player",
        type: "CharacterBody2D",
        verbose: false,
        properties: [
          { name: "position", type: "Vector2", value: { x: 0, y: 0 } },
          { name: "visible", type: "bool", value: true }
        ]
      }
    },
    dataShape: {
      required: {
        nodePath: "string",
        type: "nonempty-string",
        verbose: "boolean",
        properties: {
          type: "array",
          items: {
            required: { name: "nonempty-string", type: "nonempty-string", value: "any" },
            closed: true
          }
        }
      },
      closed: true
    }
  },
  {
    tool: "set_node_property",
    args: { nodePath: "Player", property: "position", value: { x: 10, y: 20 } },
    endpoint: "/inspector/property/set",
    method: "POST",
    // niua_mcp_scene_property_operations.gd set_node_property — value is the
    // engine read-back (B4), so its type is property-dependent.
    fixture: {
      ok: true,
      data: { nodePath: "Player", property: "position", value: { x: 10.0, y: 20.0 } }
    },
    dataShape: {
      required: { nodePath: "nonempty-string", property: "nonempty-string", value: "any" },
      closed: true
    }
  },
  {
    tool: "create_node",
    args: { type: "CharacterBody2D", name: "Enemy", parentPath: "Enemies" },
    endpoint: "/scene/node/create",
    method: "POST",
    // niua_mcp_scene_node_instance_creation.gd create_node — every field is
    // read back from the node after add_child (B4).
    fixture: {
      ok: true,
      data: { nodePath: "Enemies/Enemy2", name: "Enemy2", type: "CharacterBody2D", parentPath: "Enemies" }
    },
    dataShape: {
      required: {
        nodePath: "nonempty-string",
        name: "nonempty-string",
        type: "nonempty-string",
        parentPath: "string"
      },
      closed: true
    }
  }
];

// niua_mcp_scene_property_operations.gd unknown-property rejection (A2 hint).
const ERROR_FIXTURE = {
  ok: false,
  error: "node has no property 'positon': Player (call get_inspector_properties on this node to list valid properties)",
  errorCode: "unknown_property"
};

test("bridge tool outputs match their declared shapes (fixture bridge)", async () => {
  for (const contract of BRIDGE_TOOL_CONTRACTS) {
    validateBridgeFixture(contract.fixture, contract.tool);
  }
  validateBridgeFixture(ERROR_FIXTURE, "set_node_property error");

  await withBridgeServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const contract = BRIDGE_TOOL_CONTRACTS.find((candidate) => candidate.endpoint === url.pathname);
    res.setHeader("content-type", "application/json");
    if (!contract) {
      res.statusCode = 404;
      res.end(JSON.stringify({ ok: false, error: `unknown NIUA MCP bridge endpoint: ${url.pathname}`, errorCode: "not_found" }));
      return;
    }
    if (contract.tool === "set_node_property") {
      const chunks = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => {
        const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        res.end(JSON.stringify(body.property === "positon" ? ERROR_FIXTURE : contract.fixture));
      });
      return;
    }
    res.end(JSON.stringify(contract.fixture));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      for (const contract of BRIDGE_TOOL_CONTRACTS) {
        const response = await server.request("tools/call", {
          name: contract.tool,
          arguments: contract.args
        });
        const content = response.result.content;
        assert.equal(content.length, 1, `${contract.tool} returns one content block`);
        assert.equal(content[0].type, "text");
        const value = JSON.parse(content[0].text);
        assertShape(value, toolSuccessShape(contract.dataShape), contract.tool);
        contract.extraChecks?.(value.data);
      }

      // Error envelope: non-empty error text AND the addon's errorCode
      // survive normalization.
      const errorResponse = await server.request("tools/call", {
        name: "set_node_property",
        arguments: { nodePath: "Player", property: "positon", value: 1 }
      });
      const errorValue = JSON.parse(errorResponse.result.content[0].text);
      assertShape(errorValue, TOOL_ERROR_SHAPE, "set_node_property error output");
      assert.match(errorValue.error, /get_inspector_properties/);
      assert.equal(errorValue.errorCode, "unknown_property");
      assert.ok(ERROR_CODE_REGISTRY.has(errorValue.errorCode), "forwarded errorCode stays in the registry");
    } finally {
      await server.close();
    }
  });
});

// --- local tools: REAL handler outputs ---------------------------------------

test("get_godot_version output matches its declared shape (real handler)", async () => {
  const previous = process.env.GODOT_MCP_GODOT_VERSION;
  process.env.GODOT_MCP_GODOT_VERSION = "Godot Engine 4.6.2.test";
  try {
    const value = await getGodotVersionTool();
    assertShape(value, {
      required: { ok: "boolean", godotVersion: "nonempty-string" },
      closed: true
    }, "get_godot_version");
  } finally {
    if (previous === undefined) {
      delete process.env.GODOT_MCP_GODOT_VERSION;
    } else {
      process.env.GODOT_MCP_GODOT_VERSION = previous;
    }
  }
});

const BATCH_SUMMARY_SHAPE = {
  required: {
    ok: "boolean",
    totalSteps: "integer",
    executed: "integer",
    succeeded: "integer",
    failed: {
      type: "array",
      items: {
        required: { step: "integer", tool: "string", error: "nonempty-string" },
        optional: { label: "nonempty-string" },
        closed: true
      }
    }
  },
  optional: { stoppedAt: "integer" },
  closed: true
};

function stubCallTool(name) {
  if (name === "boom") {
    return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: "node not found: Missing" }) }] };
  }
  return { content: [{ type: "text", text: JSON.stringify({ ok: true, data: {} }) }] };
}

test("batch_scene_operations summary matches its declared shape (real executor)", async () => {
  const batch = createBatchSceneOperations({ callTool: stubCallTool });

  const success = await batch({ steps: [{ tool: "create_node", args: {} }] });
  assertShape(success, BATCH_SUMMARY_SHAPE, "batch success summary");
  assert.equal(success.ok, true);

  const failure = await batch({
    steps: [
      { tool: "create_node", args: {} },
      { tool: "boom", label: "the bad step", args: {} },
      { tool: "create_node", args: {} }
    ]
  });
  assertShape(failure, BATCH_SUMMARY_SHAPE, "batch failure summary");
  assert.equal(failure.ok, false);
  assert.equal(failure.stoppedAt, 1);
});

test("apply_scene_recipe summary matches its declared shape (real executor)", async () => {
  const apply = createApplySceneRecipe({
    callTool: stubCallTool,
    readFileImpl: async () => JSON.stringify({
      name: "test-recipe",
      steps: [{ tool: "create_node", args: {} }]
    })
  });

  const value = await apply({ recipePath: "/tmp/recipe.json" });
  assertShape(value, {
    required: {
      ok: "boolean",
      recipePath: "nonempty-string",
      totalSteps: "integer",
      executed: "integer",
      succeeded: "integer",
      failed: BATCH_SUMMARY_SHAPE.required.failed
    },
    optional: { recipe: "nonempty-string", stoppedAt: "integer" },
    closed: true
  }, "apply_scene_recipe summary");
});

test("dispatch describe outputs match their declared shapes (real handlers)", async () => {
  const dispatchers = dispatchToolsFromCatalog(GODOT_MCP_TOOLS)
    .filter((tool) => tool.inputSchema.properties.action?.enum);
  assert.ok(dispatchers.length > 5, "expected the dispatch domain tools");

  for (const dispatcher of dispatchers) {
    const listing = await dispatcher.handler({ action: "describe" });
    const listed = JSON.parse(listing.content[0].text);
    assertShape(listed, {
      required: {
        domain: "nonempty-string",
        actions: {
          type: "array",
          items: {
            required: { name: "nonempty-string", summary: "nonempty-string" },
            closed: true
          }
        }
      },
      closed: true
    }, `${dispatcher.name} describe listing`);

    const actionName = listed.actions[0].name;
    const detail = await dispatcher.handler({ action: "describe", name: actionName });
    const described = JSON.parse(detail.content[0].text);
    assertShape(described, {
      required: {
        name: "nonempty-string",
        description: "nonempty-string",
        inputSchema: { closed: false }
      },
      closed: true
    }, `${dispatcher.name} describe(${actionName})`);
    assert.equal(described.name, actionName);
  }
});
