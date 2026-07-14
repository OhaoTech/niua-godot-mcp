import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GODOT_MCP_TOOLS } from "../../../src/godot-mcp/tools/index.js";
import { renderSdk } from "../../../scripts/gen-sdk.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

test("committed generated.js matches a fresh render (regenerate with `node scripts/gen-sdk.mjs`)", async () => {
  const committed = await readFile(path.join(repoRoot, "src/godot-mcp/sdk/generated.js"), "utf8");
  const fresh = renderSdk(GODOT_MCP_TOOLS);
  assert.equal(committed, fresh, "SDK is stale — run `node scripts/gen-sdk.mjs` and commit");
});

test("render is deterministic", () => {
  assert.equal(renderSdk(GODOT_MCP_TOOLS), renderSdk(GODOT_MCP_TOOLS));
});
