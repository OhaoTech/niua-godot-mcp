import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SCENE_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/scene/manifest.js";
import { INSPECTOR_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/inspector/manifest.js";
import { FILESYSTEM_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/filesystem/manifest.js";
import { DEBUGGER_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/debugger/manifest.js";
import { SCRIPT_TOOL_MANIFEST } from "../../../src/godot-mcp/tools/scripts/manifest.js";

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
  assert.ok(entry.inputSchema.properties.savePath, "schema lost savePath");
  assert.match(entry.inputSchema.properties.maxDepth.description, /Defaults to 2/);
  assert.ok(entry.adapter?.handler === "getSceneTree", "scene tree lost its diet adapter");
  assert.ok(entry.bridge.query.fields.maxDepth, "query lost maxDepth");
  assert.ok(entry.bridge.query.fields.pathFilter, "query lost pathFilter");
  assert.equal(entry.godotRoute.arg, "query");

  const operations = await addonFile("niua_mcp_editor_state_operations.gd");
  assert.match(operations, /maxDepth/);
  assert.match(operations, /pathFilter/);
  const snapshot = await addonFile("niua_mcp_node_snapshot.gd");
  assert.match(snapshot, /childrenTruncated/);
  assert.match(snapshot, /"childCount": node.get_child_count\(\)/);
});

test("get_runtime_state keeps its runtime-tree depth and subtree diet controls", async () => {
  const entry = manifestEntry(DEBUGGER_TOOL_MANIFEST, "get_runtime_state");
  assert.ok(entry.inputSchema.properties.maxDepth, "schema lost maxDepth");
  assert.ok(entry.inputSchema.properties.pathFilter, "schema lost pathFilter");
  assert.ok(entry.inputSchema.properties.savePath, "schema lost savePath");
  assert.match(entry.inputSchema.properties.maxDepth.description, /Defaults to 2/);
  assert.ok(entry.adapter?.handler === "getRuntimeState", "runtime state lost its diet adapter");
  assert.ok(entry.bridge.query.fields.maxDepth, "query lost maxDepth");
  assert.ok(entry.bridge.query.fields.pathFilter, "query lost pathFilter");
  assert.equal(entry.godotRoute.arg, "query");

  const operations = await addonFile("niua_mcp_runtime_state_operations.gd");
  assert.match(operations, /maxDepth/);
  assert.match(operations, /pathFilter/);
  const probeState = await addonFile("niua_mcp_runtime_probe_state.gd");
  assert.match(probeState, /childrenTruncated/);
  // pathFilter reuses the live node lookup and fails loudly with the C9 hint
  // instead of silently returning the full tree.
  assert.match(probeState, /NiuaMcpRuntimeProbeNodeLookup\.find_node\(probe, path_filter\)/);
  assert.match(probeState, /pathFilter node not found: %s \(call get_runtime_node_properties to inspect live node paths\)/);
  // the requested filter travels through the debugger snapshot message
  const runtimeRequests = await addonFile("niua_mcp_debugger_probe_runtime_requests.gd");
  assert.match(runtimeRequests, /"pathFilter": path_filter/);
});

test("get_runtime_node_properties forwards allowlist and verbose through the probe", async () => {
  const entry = manifestEntry(DEBUGGER_TOOL_MANIFEST, "get_runtime_node_properties");
  assert.ok(entry.inputSchema.properties.properties, "schema lost properties allowlist");
  assert.ok(entry.inputSchema.properties.verbose, "schema lost verbose");
  assert.equal(entry.bridge.query.fields.properties.array, "csv");
  assert.equal(entry.bridge.query.fields.verbose.type, "boolean");
  assert.ok(entry.adapter?.handler === "getRuntimeNodeProperties", "runtime properties lost its diet adapter");

  const operations = await addonFile("niua_mcp_runtime_node_operations.gd");
  assert.match(operations, /send_runtime_node_properties_request\(node_path, request_id, properties, verbose\)/);
  const requests = await addonFile("niua_mcp_debugger_probe_runtime_requests.gd");
  assert.match(requests, /"verbose": verbose/);
  assert.match(requests, /payload\["properties"\] = properties/);
  const reader = await addonFile("niua_mcp_runtime_probe_node_property_reader.gd");
  assert.match(reader, /PROPERTY_USAGE_SCRIPT_VARIABLE/);
  assert.match(reader, /propertyMode/);
  const editorTree = await addonFile("niua_mcp_editor_state_operations.gd");
  assert.match(editorTree, /query\.get\("maxDepth", "2"\)/);
  const runtimeState = await addonFile("niua_mcp_runtime_state_operations.gd");
  assert.match(runtimeState, /query\.get\("maxDepth", "2"\)/);
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

test("editor and debugger snapshots do not glue their log streams", async () => {
  const editor = await addonFile("niua_mcp_editor_state_operations.gd");
  assert.match(editor, /"logCount": logs.size\(\)/);
  assert.doesNotMatch(editor, /"logs": logs\.duplicate\(\)/);
  const debuggerState = await addonFile("niua_mcp_debugger_control_state.gd");
  assert.match(debuggerState, /"eventCount": events.size\(\)/);
  assert.doesNotMatch(debuggerState, /"events": events/);
});

test("list_filesystem keeps exclude and maxDepth diet controls", async () => {
  const entry = manifestEntry(FILESYSTEM_TOOL_MANIFEST, "list_filesystem");
  assert.ok(entry.inputSchema.properties.maxDepth, "schema lost maxDepth");
  assert.ok(entry.inputSchema.properties.exclude, "schema lost exclude");
  assert.match(entry.inputSchema.properties.maxDepth.description, /Defaults to 2/);
  assert.equal(entry.bridge.query.fields.maxDepth.default, 2);
  assert.equal(entry.bridge.query.fields.exclude.array, "csv");

  const operations = await addonFile("niua_mcp_filesystem_read_operations.gd");
  assert.match(operations, /query\.get\("maxDepth", "2"\)/);
  assert.match(operations, /query\.get\("exclude", ""\)/);
  assert.match(operations, /static func _excluded\(/);
});

test("search_in_scripts keeps its maxResults and exclude diet controls", async () => {
  const entry = manifestEntry(SCRIPT_TOOL_MANIFEST, "search_in_scripts");
  assert.ok(entry.inputSchema.properties.maxResults, "schema lost maxResults");
  assert.ok(entry.inputSchema.properties.exclude, "schema lost exclude");
  assert.ok(entry.bridge.query.fields.maxResults, "query lost maxResults");
  assert.equal(entry.bridge.query.fields.exclude.array, "csv");
  assert.equal(entry.godotRoute.arg, "query");

  const operations = await addonFile("niua_mcp_script_search_operations.gd");
  assert.match(operations, /query\.get\("maxResults", "50"\)/);
  assert.match(operations, /MAX_RESULTS_CAP := 200/);
  assert.match(operations, /query\.get\("exclude", ""\)/);
  // Matched lines only, capped at 160 chars — a search never returns file bodies.
  assert.match(operations, /MATCH_TEXT_LIMIT := 160/);
  assert.match(operations, /strip_edges\(\)\.left\(MATCH_TEXT_LIMIT\)/);
});

test("read_script and read_text_file keep their lineStart/lineCount ranged-read controls", async () => {
  for (const [manifest, name] of [
    [SCRIPT_TOOL_MANIFEST, "read_script"],
    [FILESYSTEM_TOOL_MANIFEST, "read_text_file"]
  ]) {
    const entry = manifestEntry(manifest, name);
    assert.ok(entry.inputSchema.properties.lineStart, `${name} schema lost lineStart`);
    assert.ok(entry.inputSchema.properties.lineCount, `${name} schema lost lineCount`);
    assert.ok(entry.bridge.query.fields.lineStart, `${name} query lost lineStart`);
    assert.ok(entry.bridge.query.fields.lineCount, `${name} query lost lineCount`);
  }

  const operations = await addonFile("niua_mcp_filesystem_read_operations.gd");
  assert.match(operations, /query\.has\("lineStart"\) or query\.has\("lineCount"\)/);
  assert.match(operations, /"totalLines": total_lines/);
  // Out-of-range errors carry the fix by naming totalLines.
  assert.match(operations, /lineStart %d is out of range for %s: totalLines is %d/);
});
