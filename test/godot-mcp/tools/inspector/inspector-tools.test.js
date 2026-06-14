import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

import { INSPECTOR_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/inspector/index.js";
import { INSPECTOR_TOOL_MANIFEST } from "../../../../src/godot-mcp/tools/inspector/manifest.js";

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

function parseToolResult(result) {
  assert.equal(result.content.length, 1);
  assert.equal(result.content[0].type, "text");
  return JSON.parse(result.content[0].text);
}

function toolByName(name) {
  return INSPECTOR_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

async function readSource(relativePath) {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../");
  return readFile(resolve(root, relativePath), "utf8");
}

test("INSPECTOR_TOOL_DEFINITIONS exposes inspector descriptors", () => {
  assert.deepEqual(
    INSPECTOR_TOOL_DEFINITIONS.map(({ name }) => name),
    ["get_inspector_properties", "set_node_property"]
  );
  assert.deepEqual(
    INSPECTOR_TOOL_DEFINITIONS.map((tool) => tool.name),
    INSPECTOR_TOOL_MANIFEST.map((entry) => entry.name)
  );

  for (const tool of INSPECTOR_TOOL_DEFINITIONS) {
    assert.equal(typeof tool.description, "string");
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(typeof tool.handler, "function");
  }
});

test("inspector tool implementation is generated from the manifest", async () => {
  const index = await readSource("src/godot-mcp/tools/inspector/index.js");
  const bridge = await readSource("src/godot-mcp/bridge-client/inspector.js");

  assert.match(index, /toolDefinitionsFromManifest\(INSPECTOR_TOOL_MANIFEST\)/);
  assert.doesNotMatch(index, /INSPECTOR_TOOL_DEFINITIONS = \[/);
  assert.doesNotMatch(index, /splitBridgeArgs/);
  assert.match(bridge, /bridgeMethodsFromManifest\(INSPECTOR_TOOL_MANIFEST\)/);
  assert.doesNotMatch(bridge, /async getInspectorProperties/);
});

test("get_inspector_properties forwards payload to the bridge client", async () => {
  let receivedUrl = null;

  await withJsonBridge((req, res) => {
    receivedUrl = req.url;

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { properties: [{ name: "position" }] } }));
  }, async (port) => {
    const result = await toolByName("get_inspector_properties").handler({
      port,
      nodePath: "Player"
    });

    assert.equal(receivedUrl, "/inspector/properties?nodePath=Player");
    assert.deepEqual(parseToolResult(result), {
      ok: true,
      data: {
        properties: [{ name: "position" }]
      }
    });
  });
});

test("set_node_property forwards payload to the bridge client", async () => {
  let receivedUrl = null;
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    receivedUrl = req.url;
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: { nodePath: "Player", property: "visible", value: false }
    }));
  }, async (port) => {
    const result = await toolByName("set_node_property").handler({
      port,
      nodePath: "Player",
      property: "visible",
      value: false
    });

    assert.equal(receivedUrl, "/inspector/property/set");
    assert.deepEqual(receivedBody, { nodePath: "Player", property: "visible", value: false });
    assert.deepEqual(parseToolResult(result), {
      ok: true,
      data: {
        nodePath: "Player",
        property: "visible",
        value: false
      }
    });
  });
});
