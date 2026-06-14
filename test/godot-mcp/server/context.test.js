import test from "node:test";
import assert from "node:assert/strict";

import {
  createBridgeClient,
  pickBridgeConnectionArgs,
  splitBridgeArgs
} from "../../../src/godot-mcp/server/context.js";

test("createBridgeClient uses explicit host and port", () => {
  const client = createBridgeClient({ host: "127.0.0.2", port: 9999 });

  assert.equal(client.host, "127.0.0.2");
  assert.equal(client.port, 9999);
});

test("splitBridgeArgs separates connection fields from payload", () => {
  const { client, payload } = splitBridgeArgs({
    host: "127.0.0.3",
    port: 9181,
    path: "res://main.tscn"
  });

  assert.equal(client.host, "127.0.0.3");
  assert.equal(client.port, 9181);
  assert.deepEqual(payload, { path: "res://main.tscn" });
});

test("pickBridgeConnectionArgs preserves only provided connection values", () => {
  assert.deepEqual(pickBridgeConnectionArgs({ port: 9179, name: "Player" }), {
    port: 9179
  });
});

