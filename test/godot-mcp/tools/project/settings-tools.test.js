import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

import { PROJECT_SETTINGS_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/project/settings.js";

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
  return PROJECT_SETTINGS_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

async function readProjectSource(file) {
  return readFile(new URL(`../../../../src/godot-mcp/tools/project/${file}`, import.meta.url), "utf8");
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

test("PROJECT_SETTINGS_TOOL_DEFINITIONS exposes settings and input map descriptors", () => {
  assert.deepEqual(PROJECT_SETTINGS_TOOL_DEFINITIONS.map(({ name }) => name), [
    "get_project_settings",
    "set_project_setting",
    "set_project_setting_metadata",
    "get_input_map",
    "set_input_action"
  ]);

  for (const tool of PROJECT_SETTINGS_TOOL_DEFINITIONS) {
    assert.equal(typeof tool.description, "string");
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(typeof tool.handler, "function");
  }
});

test("project settings facade delegates schemas and tool descriptors", async () => {
  const facade = await readProjectSource("settings.js");
  const schemas = await readProjectSource("settings/schemas.js");
  const projectSchemas = await readProjectSource("settings/schemas/project.js");
  const inputMapSchemas = await readProjectSource("settings/schemas/input-map.js");
  const tools = await readProjectSource("settings/tools.js");

  assert.match(facade, /from "\.\/settings\/schemas\.js"/);
  assert.match(facade, /from "\.\/settings\/tools\.js"/);
  assert.doesNotMatch(facade, /CONNECTION_PROPERTIES/);
  assert.doesNotMatch(facade, /async handler/);
  assert.doesNotMatch(facade, /PROJECT_SETTINGS_TOOL_DEFINITIONS = \[/);

  assert.match(schemas, /from "\.\/schemas\/project\.js"/);
  assert.match(schemas, /from "\.\/schemas\/input-map\.js"/);
  assert.doesNotMatch(schemas, /export const PROJECT_SETTINGS_SCHEMA/);
  assert.doesNotMatch(schemas, /CONNECTION_PROPERTIES/);

  assert.match(projectSchemas, /export const PROJECT_SETTINGS_SCHEMA/);
  assert.match(projectSchemas, /export const SET_PROJECT_SETTING_SCHEMA/);
  assert.match(projectSchemas, /export const SET_PROJECT_SETTING_METADATA_SCHEMA/);
  assert.match(projectSchemas, /restartIfChanged/);
  assert.doesNotMatch(projectSchemas, /SET_INPUT_ACTION_SCHEMA/);

  assert.match(inputMapSchemas, /export const INPUT_MAP_SCHEMA/);
  assert.match(inputMapSchemas, /export const SET_INPUT_ACTION_SCHEMA/);
  assert.match(inputMapSchemas, /deadzone/);
  assert.match(inputMapSchemas, /events/);
  assert.doesNotMatch(inputMapSchemas, /SET_PROJECT_SETTING_SCHEMA/);

  assert.match(tools, /export const PROJECT_SETTINGS_TOOL_DEFINITIONS/);
  assert.match(tools, /toolDefinitionsFromManifest\(PROJECT_SETTINGS_TOOL_MANIFEST\)/);
  assert.doesNotMatch(tools, /async handler/);
});

test("get_project_settings forwards query arguments through the bridge", async () => {
  let receivedUrl = null;

  await withJsonBridge((req, res) => {
    receivedUrl = req.url;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { settings: [] } }));
  }, async (port) => {
    const result = await toolByName("get_project_settings").handler({
      port,
      prefix: "application/",
      query: "name",
      editorVisible: true,
      basic: false,
      internal: false,
      restartIfChanged: true
    });

    assert.equal(
      receivedUrl,
      "/project/settings?prefix=application%2F&query=name&editorVisible=true&basic=false&internal=false&restartIfChanged=true"
    );
    assert.deepEqual(parseToolText(result), {
      ok: true,
      data: { settings: [] }
    });
  });
});

test("project setting mutation tools forward payloads through the bridge", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    received.push({ url: req.url, body: await readJsonBody(req) });
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    await toolByName("set_project_setting").handler({
      port,
      name: "application/config/name",
      value: "Niua",
      save: true
    });
    const result = await toolByName("set_project_setting_metadata").handler({
      port,
      name: "application/config/name",
      order: 10,
      initialValue: "Niua",
      basic: true,
      internal: false,
      restartIfChanged: true,
      save: false
    });

    assert.deepEqual(received, [
      {
        url: "/project/setting/set",
        body: { name: "application/config/name", value: "Niua", save: true }
      },
      {
        url: "/project/setting/metadata/set",
        body: {
          name: "application/config/name",
          order: 10,
          initialValue: "Niua",
          basic: true,
          internal: false,
          restartIfChanged: true,
          save: false
        }
      }
    ]);
    assert.deepEqual(parseToolText(result), {
      ok: true,
      data: { endpoint: "/project/setting/metadata/set" }
    });
  });
});

test("input map tools forward reads and action writes through the bridge", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    if (req.method === "POST") {
      received.push({ url: req.url, body: await readJsonBody(req) });
    } else {
      received.push({ url: req.url });
    }
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    await toolByName("get_input_map").handler({ port });
    const result = await toolByName("set_input_action").handler({
      port,
      name: "jump",
      deadzone: 0.2,
      replace: true,
      events: [{ type: "key", keycode: 32 }],
      save: true
    });

    assert.deepEqual(received, [
      { url: "/input/map" },
      {
        url: "/input/action/set",
        body: {
          name: "jump",
          deadzone: 0.2,
          replace: true,
          events: [{ type: "key", keycode: 32 }],
          save: true
        }
      }
    ]);
    assert.deepEqual(parseToolText(result), {
      ok: true,
      data: { endpoint: "/input/action/set" }
    });
  });
});
