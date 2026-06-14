import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

import { LOCALIZATION_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/localization/index.js";

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
  return LOCALIZATION_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

test("LOCALIZATION_TOOL_DEFINITIONS exposes the curated Localization subsystem tools", () => {
  assert.deepEqual(LOCALIZATION_TOOL_DEFINITIONS.map((tool) => tool.name), [
    "create_csv_translation",
    "register_translation_file",
    "set_locale",
    "get_localization_state"
  ]);
  assert.ok(LOCALIZATION_TOOL_DEFINITIONS.length <= 10);
  assert.ok(LOCALIZATION_TOOL_DEFINITIONS.every((tool) => tool.inputSchema?.type === "object"));
});

test("create_csv_translation forwards locale messages", async () => {
  let seenUrl = null;
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    seenUrl = req.url;
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        csvPath: "res://locales/en.csv",
        translationPath: "res://locales/en.translation",
        locale: "en"
      }
    }));
  }, async (port) => {
    const result = await toolByName("create_csv_translation").handler({
      port,
      path: "res://locales/en.csv",
      locale: "en",
      messages: {
        HELLO: "Hello"
      }
    });
    const payload = parseToolText(result);

    assert.equal(seenUrl, "/localization/csv/create");
    assert.equal(payload.data.translationPath, "res://locales/en.translation");
    assert.deepEqual(receivedBody, {
      path: "res://locales/en.csv",
      locale: "en",
      messages: {
        HELLO: "Hello"
      }
    });
  });
});

test("register_translation_file forwards file registration requests", async () => {
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        registeredTranslations: ["res://locales/en.translation"]
      }
    }));
  }, async (port) => {
    const result = await toolByName("register_translation_file").handler({
      port,
      path: "res://locales/en.translation",
      loadNow: true
    });
    const payload = parseToolText(result);

    assert.deepEqual(receivedBody, {
      path: "res://locales/en.translation",
      loadNow: true
    });
    assert.equal(payload.data.registeredTranslations[0], "res://locales/en.translation");
  });
});

test("set_locale and get_localization_state reach locale endpoints", async () => {
  const seen = [];

  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    seen.push({
      method: req.method,
      url: req.url,
      body: chunks.length > 0 ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : null
    });
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        locale: "es",
        registeredTranslations: []
      }
    }));
  }, async (port) => {
    await toolByName("set_locale").handler({ port, locale: "es" });
    await toolByName("get_localization_state").handler({ port });
  });

  assert.deepEqual(seen, [
    {
      method: "POST",
      url: "/localization/locale/set",
      body: { locale: "es" }
    },
    {
      method: "GET",
      url: "/localization/state",
      body: null
    }
  ]);
});
