import test from "node:test";
import assert from "node:assert/strict";

import { RUNTIME_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/runtime/index.js";
import { RUNTIME_TOOL_MANIFEST } from "../../../../src/godot-mcp/tools/runtime/manifest.js";

function toolByName(name) {
  return RUNTIME_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

async function withGodotVersion(version, run) {
  const previous = process.env.GODOT_MCP_GODOT_VERSION;
  process.env.GODOT_MCP_GODOT_VERSION = version;

  try {
    return await run();
  } finally {
    if (previous === undefined) {
      delete process.env.GODOT_MCP_GODOT_VERSION;
    } else {
      process.env.GODOT_MCP_GODOT_VERSION = previous;
    }
  }
}

async function readSource(relativePath) {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../");
  return readFile(resolve(root, relativePath), "utf8");
}

test("RUNTIME_TOOL_DEFINITIONS exposes runtime descriptors", () => {
  assert.deepEqual(RUNTIME_TOOL_DEFINITIONS.map(({ name }) => name), [
    "get_godot_version"
  ]);
  assert.deepEqual(
    RUNTIME_TOOL_DEFINITIONS.map((tool) => tool.name),
    RUNTIME_TOOL_MANIFEST.map((entry) => entry.name)
  );

  for (const tool of RUNTIME_TOOL_DEFINITIONS) {
    assert.equal(typeof tool.description, "string");
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(typeof tool.handler, "function");
  }
});

test("runtime tool implementation is generated from the manifest", async () => {
  const index = await readSource("src/godot-mcp/tools/runtime/index.js");

  assert.match(index, /toolDefinitionsFromManifest\(RUNTIME_TOOL_MANIFEST/);
  assert.match(index, /getGodotVersionTool/);
  assert.doesNotMatch(index, /RUNTIME_TOOL_DEFINITIONS = \[/);
  assert.doesNotMatch(index, /async handler/);
});

test("get_godot_version handler reports the configured Godot version", async () => {
  await withGodotVersion("Godot Engine v4.test", async () => {
    const payload = parseToolText(await toolByName("get_godot_version").handler({}));

    assert.deepEqual(payload, {
      ok: true,
      godotVersion: "Godot Engine v4.test"
    });
  });
});
