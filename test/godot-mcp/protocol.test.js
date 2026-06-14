import assert from "node:assert/strict";
import test from "node:test";

import {
  assertProjectPath,
  normalizeBridgeResponse,
  toolResult
} from "../../src/godot-mcp/protocol.js";

test("assertProjectPath rejects paths outside the allowed root", () => {
  assert.throws(
    () => assertProjectPath("/safe/project", "/safe/other/file.tscn"),
    /outside allowed project root/
  );
});

test("assertProjectPath accepts paths inside the allowed root", () => {
  assert.equal(
    assertProjectPath("/safe/project", "/safe/project/scenes/main.tscn"),
    "/safe/project/scenes/main.tscn"
  );
});

test("normalizeBridgeResponse preserves GUI state fields", () => {
  const result = normalizeBridgeResponse({
    ok: true,
    data: {
      projectRoot: "/tmp/game",
      currentScene: "res://scenes/main.tscn",
      openScenes: ["res://scenes/main.tscn"],
      selection: ["Player"],
      logs: ["ready"]
    }
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.currentScene, "res://scenes/main.tscn");
  assert.deepEqual(result.data.selection, ["Player"]);
});

test("normalizeBridgeResponse normalizes bridge errors", () => {
  assert.deepEqual(normalizeBridgeResponse({ ok: false, error: "no editor" }), {
    ok: false,
    error: "no editor",
    data: null
  });
});

test("toolResult serializes JSON as MCP text content", () => {
  const result = toolResult({ ok: true, value: 1 });
  assert.equal(result.content[0].type, "text");
  assert.match(result.content[0].text, /"value": 1/);
});
