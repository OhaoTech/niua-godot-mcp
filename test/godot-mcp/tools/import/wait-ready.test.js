import assert from "node:assert/strict";
import test from "node:test";
import { createWaitForImportedAsset } from "../../../../src/godot-mcp/tools/import/wait-ready.js";
import { CORE_TOOL_NAMES } from "../../../../src/godot-mcp/server/tool-profiles.js";

test("wait_for_imported_asset is essential", () => {
  assert.ok(CORE_TOOL_NAMES.includes("wait_for_imported_asset"));
});

test("wait_for_imported_asset succeeds when metadata appears", async () => {
  let n = 0;
  const callTool = async (name) => {
    n += 1;
    if (name === "get_import_metadata") {
      if (n < 3) return { ok: false, error: "not ready" };
      return { ok: true, data: { path: "res://assets/a.glb", importer: "scene" } };
    }
    return { ok: false, error: "nope" };
  };
  const wait = createWaitForImportedAsset({ callTool });
  const result = await wait({ path: "res://assets/a.glb", pollMs: 10, timeoutMs: 2000 });
  assert.equal(result.ok, true);
  assert.equal(result.data.ready, true);
  assert.ok(result.data.attempts >= 2);
});

test("wait_for_imported_asset times out with recovery", async () => {
  const callTool = async () => ({ ok: false, error: "missing" });
  const wait = createWaitForImportedAsset({ callTool });
  const result = await wait({ path: "res://assets/missing.glb", pollMs: 20, timeoutMs: 80 });
  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "timeout");
  assert.equal(result.recovery.tool, "import_project_assets");
});

test("wait_for_imported_asset requires path", async () => {
  const wait = createWaitForImportedAsset({ callTool: async () => ({}) });
  const result = await wait({});
  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "bad_request");
});
