import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

import { COMMON_NODE_TOOL_DEFINITIONS } from "../../../../../src/godot-mcp/tools/nodes/common/index.js";
import { COMMON_NODE_TOOL_MANIFEST } from "../../../../../src/godot-mcp/tools/nodes/common/manifest.js";

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
  return COMMON_NODE_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

async function readCommonNodeSource(file) {
  return readFile(new URL(`../../../../../src/godot-mcp/tools/nodes/common/${file}`, import.meta.url), "utf8");
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

test("COMMON_NODE_TOOL_DEFINITIONS exposes common node descriptors", () => {
  assert.deepEqual(
    COMMON_NODE_TOOL_DEFINITIONS.map(({ name }) => name),
    COMMON_NODE_TOOL_MANIFEST.map(({ name }) => name)
  );

  for (const tool of COMMON_NODE_TOOL_DEFINITIONS) {
    assert.equal(typeof tool.description, "string");
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(typeof tool.handler, "function");
  }
});

test("common node tools are generated from the manifest", async () => {
  const index = await readCommonNodeSource("index.js");

  assert.match(index, /toolDefinitionsFromManifest\(COMMON_NODE_TOOL_MANIFEST\)/);
  assert.doesNotMatch(index, /COMMON_NODE_TOOL_DEFINITIONS = \[/);
  assert.doesNotMatch(index, /toolResult/);
  assert.doesNotMatch(index, /splitBridgeArgs/);
});

test("common node schemas delegate search create and mutation domains", async () => {
  const facade = await readCommonNodeSource("schemas.js");
  const search = await readCommonNodeSource("schemas/search.js");
  const create = await readCommonNodeSource("schemas/create.js");
  const mutation = await readCommonNodeSource("schemas/mutation.js");

  assert.match(facade, /from "\.\/schemas\/search\.js"/);
  assert.match(facade, /from "\.\/schemas\/create\.js"/);
  assert.match(facade, /from "\.\/schemas\/mutation\.js"/);
  assert.doesNotMatch(facade, /CONNECTION_PROPERTIES/);
  assert.doesNotMatch(facade, /properties: \{/);

  assert.match(search, /export const SEARCH_NODE_TYPES_SCHEMA/);
  assert.match(search, /CONNECTION_PROPERTIES/);
  assert.match(search, /includeDisabled/);
  assert.match(search, /limit/);

  assert.match(create, /export const CREATE_NODE_SCHEMA/);
  assert.match(create, /export const CREATE_NODE_WITH_SCRIPT_SCHEMA/);
  assert.match(create, /scriptTemplate/);
  assert.match(create, /\.\.\.CREATE_NODE_SCHEMA\.properties/);

  assert.match(mutation, /export const RENAME_NODE_SCHEMA/);
  assert.match(mutation, /export const DELETE_NODE_SCHEMA/);
  assert.match(mutation, /export const DUPLICATE_NODE_SCHEMA/);
  assert.match(mutation, /export const REPARENT_NODE_SCHEMA/);
  assert.match(mutation, /export const REORDER_NODE_SCHEMA/);
  assert.match(mutation, /keepGlobalTransform/);
  assert.match(mutation, /index/);
});

test("search_node_types forwards query arguments through the bridge", async () => {
  let receivedUrl = null;

  await withJsonBridge((req, res) => {
    receivedUrl = req.url;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { matches: [{ name: "Node3D" }] } }));
  }, async (port) => {
    const result = await toolByName("search_node_types").handler({
      port,
      query: "node",
      baseType: "Node3D",
      includeAbstract: true,
      includeDisabled: false,
      limit: 12
    });

    assert.equal(
      receivedUrl,
      "/node-types/search?query=node&baseType=Node3D&includeAbstract=true&includeDisabled=false&limit=12"
    );
    assert.deepEqual(parseToolText(result), {
      ok: true,
      data: { matches: [{ name: "Node3D" }] }
    });
  });
});

test("create_node forwards payload through the bridge", async () => {
  let received = null;

  await withJsonBridge(async (req, res) => {
    received = { url: req.url, body: await readJsonBody(req) };
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { nodePath: "Root/Camera" } }));
  }, async (port) => {
    const properties = { current: true };
    const result = await toolByName("create_node").handler({
      port,
      type: "Camera3D",
      name: "Camera",
      parentPath: "Root",
      properties
    });

    assert.deepEqual(received, {
      url: "/scene/node/create",
      body: {
        type: "Camera3D",
        name: "Camera",
        parentPath: "Root",
        properties
      }
    });
    assert.deepEqual(parseToolText(result), {
      ok: true,
      data: { nodePath: "Root/Camera" }
    });
  });
});

test("create_node_with_script forwards payload through the bridge", async () => {
  let received = null;

  await withJsonBridge(async (req, res) => {
    received = { url: req.url, body: await readJsonBody(req) };
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { nodePath: "Root/Player" } }));
  }, async (port) => {
    const result = await toolByName("create_node_with_script").handler({
      port,
      type: "CharacterBody3D",
      name: "Player",
      parentPath: "Root",
      scriptPath: "res://scripts/player.gd",
      scriptTemplate: "node_process",
      overwriteScript: true,
      saveScene: true
    });

    assert.deepEqual(received, {
      url: "/scene/node/create-with-script",
      body: {
        type: "CharacterBody3D",
        name: "Player",
        parentPath: "Root",
        scriptPath: "res://scripts/player.gd",
        scriptTemplate: "node_process",
        overwriteScript: true,
        saveScene: true
      }
    });
    assert.deepEqual(parseToolText(result), {
      ok: true,
      data: { nodePath: "Root/Player" }
    });
  });
});

test("common node mutation tools forward payloads through the bridge", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    received.push({ url: req.url, body: await readJsonBody(req) });
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    await toolByName("rename_node").handler({ port, nodePath: "Root/Old", newName: "New" });
    await toolByName("delete_node").handler({ port, nodePath: "Root/DeleteMe" });
    await toolByName("duplicate_node").handler({
      port,
      nodePath: "Root/Source",
      newName: "SourceCopy",
      parentPath: "Root/Copies"
    });
    await toolByName("reparent_node").handler({
      port,
      nodePath: "Root/Child",
      newParentPath: "Root/NewParent",
      keepGlobalTransform: false
    });
    const result = await toolByName("reorder_node").handler({
      port,
      nodePath: "Root/Child",
      index: 0
    });

    assert.deepEqual(received, [
      { url: "/scene/node/rename", body: { nodePath: "Root/Old", newName: "New" } },
      { url: "/scene/node/delete", body: { nodePath: "Root/DeleteMe" } },
      {
        url: "/scene/node/duplicate",
        body: { nodePath: "Root/Source", newName: "SourceCopy", parentPath: "Root/Copies" }
      },
      {
        url: "/scene/node/reparent",
        body: { nodePath: "Root/Child", newParentPath: "Root/NewParent", keepGlobalTransform: false }
      },
      { url: "/scene/node/reorder", body: { nodePath: "Root/Child", index: 0 } }
    ]);
    assert.deepEqual(parseToolText(result), {
      ok: true,
      data: { endpoint: "/scene/node/reorder" }
    });
  });
});
