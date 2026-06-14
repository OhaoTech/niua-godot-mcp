import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

import { toolDefinitionsFromManifest } from "../../../../src/godot-mcp/manifest/index.js";
import { FILESYSTEM_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/filesystem/index.js";
import { FILESYSTEM_TOOL_MANIFEST } from "../../../../src/godot-mcp/tools/filesystem/manifest.js";

async function withJsonBridge(handler, run) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  try {
    return await run(port);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

function toolByName(name) {
  return FILESYSTEM_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

async function readFilesystemSource(file) {
  return readFile(new URL(`../../../../src/godot-mcp/tools/filesystem/${file}`, import.meta.url), "utf8");
}

test("FILESYSTEM_TOOL_DEFINITIONS exposes filesystem tool descriptors", () => {
  const generatedDefinitions = toolDefinitionsFromManifest(FILESYSTEM_TOOL_MANIFEST);

  assert.deepEqual(FILESYSTEM_TOOL_DEFINITIONS.map((tool) => tool.name), [
    "get_filesystem_dock_state",
    "list_filesystem",
    "create_folder",
    "read_text_file",
    "write_text_file",
    "write_binary_file",
    "move_filesystem_entry",
    "copy_filesystem_entry",
    "batch_filesystem_operations",
    "delete_filesystem_entry"
  ]);
  assert.deepEqual(
    FILESYSTEM_TOOL_DEFINITIONS.map(({ handler, ...definition }) => definition),
    generatedDefinitions.map(({ handler, ...definition }) => definition)
  );
  assert.ok(FILESYSTEM_TOOL_DEFINITIONS.every((tool) => tool.inputSchema?.type === "object"));
});

test("filesystem tool implementation is generated from the manifest", async () => {
  const index = await readFilesystemSource("index.js");

  assert.match(index, /toolDefinitionsFromManifest\(FILESYSTEM_TOOL_MANIFEST\)/);
  assert.doesNotMatch(index, /async handler/);
});

test("filesystem schemas delegate access write mutation and batch modules", async () => {
  const facade = await readFilesystemSource("schemas.js");
  const access = await readFilesystemSource("schemas/access.js");
  const write = await readFilesystemSource("schemas/write.js");
  const mutations = await readFilesystemSource("schemas/mutations.js");
  const batch = await readFilesystemSource("schemas/batch.js");

  assert.match(facade, /from "\.\/schemas\/access\.js"/);
  assert.match(facade, /from "\.\/schemas\/write\.js"/);
  assert.match(facade, /from "\.\/schemas\/mutations\.js"/);
  assert.match(facade, /from "\.\/schemas\/batch\.js"/);
  assert.match(facade, /BRIDGE_INPUT_SCHEMA/);
  assert.match(facade, /CONNECTION_PROPERTIES/);
  assert.doesNotMatch(facade, /export const FILESYSTEM_LIST_SCHEMA/);
  assert.doesNotMatch(facade, /export const BATCH_FILESYSTEM_OPERATIONS_SCHEMA/);

  assert.match(access, /export const FILESYSTEM_LIST_SCHEMA/);
  assert.match(access, /export const FILESYSTEM_PATH_SCHEMA/);
  assert.match(access, /recursive/);
  assert.doesNotMatch(access, /WRITE_TEXT_FILE_SCHEMA/);

  assert.match(write, /export const WRITE_TEXT_FILE_SCHEMA/);
  assert.match(write, /content/);
  assert.match(write, /UTF-8 text content/);
  assert.doesNotMatch(write, /MOVE_FILESYSTEM_ENTRY_SCHEMA/);

  assert.match(mutations, /export const MOVE_FILESYSTEM_ENTRY_SCHEMA/);
  assert.match(mutations, /export const COPY_FILESYSTEM_ENTRY_SCHEMA/);
  assert.match(mutations, /fromPath/);
  assert.match(mutations, /overwrite/);
  assert.doesNotMatch(mutations, /BATCH_FILESYSTEM_OPERATIONS_SCHEMA/);

  assert.match(batch, /export const BATCH_FILESYSTEM_OPERATIONS_SCHEMA/);
  assert.match(batch, /continueOnError/);
  assert.match(batch, /dryRun/);
  assert.match(batch, /enum: \["copy", "move", "delete"\]/);
});

test("write_text_file handler forwards payload through the bridge", async () => {
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const result = await toolByName("write_text_file").handler({
      port,
      path: "res://scripts/player.gd",
      content: "extends Node\n"
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.endpoint, "/filesystem/file/write");
    assert.deepEqual(receivedBody, {
      path: "res://scripts/player.gd",
      content: "extends Node\n"
    });
  });
});

test("batch_filesystem_operations handler forwards payload through the bridge", async () => {
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const operations = [
      {
        kind: "copy",
        fromPath: "res://a.txt",
        toPath: "res://b.txt",
        overwrite: true
      }
    ];
    const result = await toolByName("batch_filesystem_operations").handler({
      port,
      operations,
      dryRun: true
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.endpoint, "/filesystem/batch");
    assert.deepEqual(receivedBody, {
      operations,
      dryRun: true
    });
  });
});
