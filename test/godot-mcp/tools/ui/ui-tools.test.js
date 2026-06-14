import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

import { UI_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/ui/index.js";

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
  return UI_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

test("UI_TOOL_DEFINITIONS exposes the curated UI subsystem tools", () => {
  assert.deepEqual(UI_TOOL_DEFINITIONS.map((tool) => tool.name), [
    "create_ui_control",
    "set_control_layout",
    "create_ui_theme",
    "apply_ui_theme_override",
    "connect_ui_signal"
  ]);
  assert.ok(UI_TOOL_DEFINITIONS.length <= 10);
  assert.ok(UI_TOOL_DEFINITIONS.every((tool) => tool.inputSchema?.type === "object"));
});

test("create_ui_control handler forwards Control authoring payloads", async () => {
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
        nodePath: "Menu/Title",
        type: "Label"
      }
    }));
  }, async (port) => {
    const result = await toolByName("create_ui_control").handler({
      port,
      type: "Label",
      name: "Title",
      parentPath: "Menu",
      text: "Neon Menu",
      layout: {
        customMinimumSize: { x: 400, y: 80 }
      }
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.type, "Label");
    assert.deepEqual(receivedBody, {
      type: "Label",
      name: "Title",
      parentPath: "Menu",
      text: "Neon Menu",
      layout: {
        customMinimumSize: { x: 400, y: 80 }
      }
    });
  });
});

test("create_ui_theme handler forwards theme resources and overrides", async () => {
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
        path: "res://themes/menu_theme.tres",
        type: "Theme"
      }
    }));
  }, async (port) => {
    const result = await toolByName("create_ui_theme").handler({
      port,
      path: "res://themes/menu_theme.tres",
      overwrite: true,
      defaultFontSize: 28,
      typeStyles: [
        {
          typeName: "Button",
          fontSizes: { font_size: 24 },
          colors: {
            font_color: { type: "Color", r: 0.2, g: 0.9, b: 1, a: 1 }
          }
        }
      ]
    });
    const payload = parseToolText(result);

    assert.equal(seenUrl, "/ui/theme/create");
    assert.equal(payload.data.type, "Theme");
    assert.deepEqual(receivedBody, {
      path: "res://themes/menu_theme.tres",
      overwrite: true,
      defaultFontSize: 28,
      typeStyles: [
        {
          typeName: "Button",
          fontSizes: { font_size: 24 },
          colors: {
            font_color: { type: "Color", r: 0.2, g: 0.9, b: 1, a: 1 }
          }
        }
      ]
    });
  });
});
