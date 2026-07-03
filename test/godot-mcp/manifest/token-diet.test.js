import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SCENE_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/scene/manifest.js";
import { INSPECTOR_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/inspector/manifest.js";
import { FILESYSTEM_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/filesystem/manifest.js";

// Token-diet contract: fat read tools MUST keep their response-shrinking controls
// (docs/godot-mcp/token-efficiency-roadmap.md). Removing a control silently
// re-inflates every caller's context window, so it fails here instead.

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function manifestEntry(manifest, name) {
  const entry = manifest.find((tool) => tool.name === name);
  assert.ok(entry, `missing manifest entry: ${name}`);
  return entry;
}

async function addonFile(name) {
  return readFile(path.join(repoRoot, "godot/addons/niua_mcp", name), "utf8");
}

test("get_scene_tree keeps its depth and subtree diet controls", async () => {
  const entry = manifestEntry(SCENE_TOOL_MANIFEST, "get_scene_tree");
  assert.ok(entry.inputSchema.properties.maxDepth, "schema lost maxDepth");
  assert.ok(entry.inputSchema.properties.pathFilter, "schema lost pathFilter");
  assert.ok(entry.bridge.query.fields.maxDepth, "query lost maxDepth");
  assert.ok(entry.bridge.query.fields.pathFilter, "query lost pathFilter");
  assert.equal(entry.godotRoute.arg, "query");

  const operations = await addonFile("niua_mcp_editor_state_operations.gd");
  assert.match(operations, /maxDepth/);
  assert.match(operations, /pathFilter/);
  const snapshot = await addonFile("niua_mcp_node_snapshot.gd");
  assert.match(snapshot, /childrenTruncated/);
});

test("get_inspector_properties keeps compact-by-default and the allowlist", async () => {
  const entry = manifestEntry(INSPECTOR_TOOL_MANIFEST, "get_inspector_properties");
  assert.ok(entry.inputSchema.properties.verbose, "schema lost verbose");
  assert.ok(entry.inputSchema.properties.properties, "schema lost properties allowlist");
  assert.equal(entry.bridge.query.fields.properties.array, "csv");

  const operations = await addonFile("niua_mcp_scene_inspector_operations.gd");
  assert.match(operations, /query\.get\("verbose", "false"\)/);
  assert.match(operations, /query\.get\("properties", ""\)/);
  // compact branch: name/type/value only, before the verbose full dictionary
  assert.match(operations, /if not verbose:/);
});

test("list_filesystem keeps exclude and maxDepth diet controls", async () => {
  const entry = manifestEntry(FILESYSTEM_TOOL_MANIFEST, "list_filesystem");
  assert.ok(entry.inputSchema.properties.maxDepth, "schema lost maxDepth");
  assert.ok(entry.inputSchema.properties.exclude, "schema lost exclude");
  assert.equal(entry.bridge.query.fields.exclude.array, "csv");

  const operations = await addonFile("niua_mcp_filesystem_read_operations.gd");
  assert.match(operations, /query\.get\("maxDepth", "0"\)/);
  assert.match(operations, /query\.get\("exclude", ""\)/);
  assert.match(operations, /static func _excluded\(/);
});
