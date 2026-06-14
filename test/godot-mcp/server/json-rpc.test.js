import test from "node:test";
import assert from "node:assert/strict";

import { encodeResponse, toJsonRpcError } from "../../../src/godot-mcp/server/json-rpc.js";

test("encodeResponse emits newline-delimited JSON-RPC messages", () => {
  const encoded = encodeResponse({ jsonrpc: "2.0", id: 1, result: { ok: true } });

  // MCP stdio transport is newline-delimited JSON: one message per line, no header.
  assert.equal(encoded.endsWith("\n"), true);
  assert.equal(encoded.includes("\r\n\r\n"), false);
  assert.doesNotMatch(encoded, /content-length/i);
  const body = encoded.trimEnd();
  assert.equal(body.includes("\n"), false);
  assert.equal(JSON.parse(body).result.ok, true);
});

test("toJsonRpcError preserves explicit error codes", () => {
  const error = Object.assign(new Error("Nope"), { code: -32601 });

  assert.deepEqual(toJsonRpcError(7, error), {
    jsonrpc: "2.0",
    id: 7,
    error: {
      code: -32601,
      message: "Nope"
    }
  });
});

