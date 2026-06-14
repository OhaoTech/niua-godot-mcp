import test from "node:test";
import assert from "node:assert/strict";

import { createToolRegistry } from "../../../src/godot-mcp/server/registry.js";

test("createToolRegistry exposes MCP tool definitions without handlers", async () => {
  const registry = createToolRegistry([
    [
      {
        name: "alpha",
        description: "Alpha tool",
        inputSchema: { type: "object", additionalProperties: false },
        handler: async (args) => ({ ok: true, data: args })
      }
    ]
  ]);

  assert.deepEqual(registry.definitions, [
    {
      name: "alpha",
      description: "Alpha tool",
      inputSchema: { type: "object", additionalProperties: false }
    }
  ]);
  assert.deepEqual(await registry.call("alpha", { value: 1 }), {
    ok: true,
    data: { value: 1 }
  });
});

test("createToolRegistry rejects duplicate tool names", () => {
  assert.throws(() => createToolRegistry([
    [
      {
        name: "duplicate",
        description: "First",
        inputSchema: { type: "object" },
        handler: async () => ({ ok: true })
      }
    ],
    [
      {
        name: "duplicate",
        description: "Second",
        inputSchema: { type: "object" },
        handler: async () => ({ ok: true })
      }
    ]
  ]), /duplicate MCP tool: duplicate/);
});

test("createToolRegistry reports unknown tools as JSON-RPC method errors", async () => {
  const registry = createToolRegistry([]);

  await assert.rejects(
    () => registry.call("missing", {}),
    {
      message: "Unknown tool: missing",
      code: -32601
    }
  );
});

