import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  RESOURCE_DEFINITIONS,
  readBridgeResource
} from "../../../src/godot-mcp/server/resources.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function readServerSource(file) {
  return readFile(resolve(__dirname, "../../../src/godot-mcp/server", file), "utf8");
}

async function withJsonServer(handler, run) {
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

test("server resources facade delegates catalog and reader modules", async () => {
  const facade = await readServerSource("resources.js");
  const catalog = await readServerSource("resources/catalog.js");
  const readers = await readServerSource("resources/readers.js");

  assert.match(facade, /RESOURCE_DEFINITIONS/);
  assert.match(facade, /readBridgeResource/);
  assert.match(facade, /from "\.\/resources\/catalog\.js"/);
  assert.match(facade, /from "\.\/resources\/readers\.js"/);
  assert.doesNotMatch(facade, /uri: "godot:\/\//);
  assert.doesNotMatch(facade, /switch \(uri\)/);
  assert.doesNotMatch(facade, /createBridgeClient/);

  assert.match(catalog, /export const RESOURCE_DEFINITIONS/);
  assert.match(catalog, /uri: "godot:\/\/project\/info"/);
  assert.match(catalog, /uri: "godot:\/\/runtime\/events"/);
  assert.match(catalog, /mimeType: "application\/json"/);
  assert.doesNotMatch(catalog, /createBridgeClient/);
  assert.doesNotMatch(catalog, /readBridgeResource/);

  assert.match(readers, /import \{ createBridgeClient \} from "\.\.\/context\.js"/);
  assert.match(readers, /export async function readBridgeResource/);
  assert.match(readers, /switch \(uri\)/);
  assert.match(readers, /case "godot:\/\/run\/settings"/);
  assert.match(readers, /case "godot:\/\/runtime\/events"/);
  assert.match(readers, /Unknown Godot resource/);
  assert.match(readers, /code: -32602/);
  assert.doesNotMatch(readers, /export const RESOURCE_DEFINITIONS/);
});

test("RESOURCE_DEFINITIONS exposes stable Godot resource URIs", () => {
  assert.ok(RESOURCE_DEFINITIONS.some((resource) => resource.uri === "godot://run/settings"));
  assert.ok(RESOURCE_DEFINITIONS.some((resource) => resource.uri === "godot://scene/tree"));
  assert.ok(RESOURCE_DEFINITIONS.every((resource) => resource.mimeType === "application/json"));
});

test("readBridgeResource routes run settings through the bridge client", async () => {
  await withJsonServer((req, res) => {
    res.setHeader("content-type", "application/json");

    if (req.url === "/run/settings" && req.method === "GET") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          mainScene: "res://scenes/main.tscn",
          mainSceneExists: true
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const result = await readBridgeResource("godot://run/settings", { port });

    assert.equal(result.ok, true);
    assert.equal(result.data.mainScene, "res://scenes/main.tscn");
  });
});

test("readBridgeResource rejects unknown resource URIs", async () => {
  await assert.rejects(
    () => readBridgeResource("godot://missing"),
    {
      message: "Unknown Godot resource: godot://missing",
      code: -32602
    }
  );
});
