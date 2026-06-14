import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

import { EXPORT_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/export/index.js";
import {
  EXPORT_LOCAL_TOOL_MANIFEST,
  EXPORT_PRESET_TOOL_MANIFEST,
  EXPORT_TOOL_MANIFEST
} from "../../../../src/godot-mcp/tools/export/manifest.js";

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
  return EXPORT_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

async function readExportSource(file) {
  return readFile(new URL(`../../../../src/godot-mcp/tools/export/${file}`, import.meta.url), "utf8");
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

test("EXPORT_TOOL_DEFINITIONS exposes export descriptors", () => {
  assert.deepEqual(
    EXPORT_TOOL_DEFINITIONS.map(({ name }) => name),
    EXPORT_TOOL_MANIFEST.map(({ name }) => name)
  );
  assert.deepEqual(
    EXPORT_TOOL_MANIFEST.map(({ name }) => name),
    [
      ...EXPORT_PRESET_TOOL_MANIFEST.map(({ name }) => name),
      ...EXPORT_LOCAL_TOOL_MANIFEST.map(({ name }) => name)
    ]
  );

  for (const tool of EXPORT_TOOL_DEFINITIONS) {
    assert.equal(typeof tool.description, "string");
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(typeof tool.handler, "function");
  }
});

test("export local tools are generated from the manifest", async () => {
  const index = await readExportSource("index.js");
  const manifest = await readExportSource("manifest.js");

  assert.match(index, /toolDefinitionsFromManifest\(EXPORT_PRESET_TOOL_MANIFEST\)/);
  assert.match(index, /toolDefinitionsFromManifest\(EXPORT_LOCAL_TOOL_MANIFEST/);
  assert.match(index, /diagnoseExportTemplates/);
  assert.match(index, /validateExportPreset/);
  assert.match(index, /exportGodotProject/);
  assert.doesNotMatch(index, /LOCAL_EXPORT_TOOL_DEFINITIONS = \[/);
  assert.match(index, /EXPORT_PRESET_TOOL_DEFINITIONS\.concat\(LOCAL_EXPORT_TOOL_DEFINITIONS\)/);
  assert.doesNotMatch(index, /EXPORT_TOOL_DEFINITIONS = \[/);
  assert.doesNotMatch(index, /toolResult/);

  assert.match(manifest, /export const EXPORT_LOCAL_TOOL_MANIFEST/);
  assert.match(manifest, /export const EXPORT_TOOL_MANIFEST/);
  assert.match(manifest, /implementation: "local"/);
  assert.match(manifest, /local: \{\s*handler: "diagnoseExportTemplates"/);
  assert.match(manifest, /local: \{\s*handler: "exportGodotProject"/);
});

test("local export tools delegate process template preset and project workflows to focused modules", async () => {
  const local = await readExportSource("local.js");
  const exportProject = await readExportSource("local/export-project.js");
  const process = await readExportSource("local/process.js");
  const templates = await readExportSource("local/templates.js");
  const presets = await readExportSource("local/presets.js");
  const modes = await readExportSource("local/modes.js");

  assert.match(local, /from "\.\/local\/export-project\.js"/);
  assert.match(local, /from "\.\/local\/templates\.js"/);
  assert.match(local, /from "\.\/local\/presets\.js"/);
  assert.doesNotMatch(local, /spawn/);
  assert.doesNotMatch(local, /EXPORT_PLATFORM_RULES/);
  assert.doesNotMatch(local, /function exportTemplatesRoot/);
  assert.doesNotMatch(local, /function runGodotExportProcess/);

  assert.match(exportProject, /export async function exportGodotProject/);
  assert.match(process, /export function runGodotExportProcess/);
  assert.match(process, /export function exportFailureMessage/);
  assert.match(templates, /export async function diagnoseExportTemplates/);
  assert.match(presets, /from "\.\/presets\/validate\.js"/);
  assert.match(modes, /export function normalizeExportMode/);
  assert.match(modes, /export function exportFlag/);
});

test("local export preset validation delegates rules summaries and result domains", async () => {
  const facade = await readExportSource("local/presets.js");
  const validate = await readExportSource("local/presets/validate.js");
  const rules = await readExportSource("local/presets/rules.js");
  const summaries = await readExportSource("local/presets/summaries.js");
  const results = await readExportSource("local/presets/results.js");

  assert.match(facade, /from "\.\/presets\/validate\.js"/);
  assert.doesNotMatch(facade, /EXPORT_PLATFORM_RULES/);
  assert.doesNotMatch(facade, /parseGodotConfig/);
  assert.doesNotMatch(facade, /exportPresetSummariesFromSections/);
  assert.doesNotMatch(facade, /validateExportPresetSummary/);

  assert.match(validate, /export async function validateExportPreset/);
  assert.match(validate, /readFile/);
  assert.match(validate, /parseGodotConfig/);
  assert.match(validate, /diagnoseExportTemplates/);
  assert.match(validate, /exportPresetSummariesFromSections/);
  assert.match(validate, /validateExportPresetSummary/);

  assert.match(rules, /export const EXPORT_PLATFORM_RULES/);
  assert.match(rules, /Linux/);
  assert.match(rules, /Windows Desktop/);
  assert.match(rules, /Web/);
  assert.match(rules, /macOS/);
  assert.match(rules, /Android/);
  assert.match(rules, /iOS/);

  assert.match(summaries, /export function exportPresetSummariesFromSections/);
  assert.match(summaries, /preset\\\.\\d\+/);
  assert.match(summaries, /export_path/);
  assert.match(summaries, /runnable/);
  assert.match(summaries, /options/);
  assert.match(summaries, /sort/);

  assert.match(results, /export function validateExportPresetSummary/);
  assert.match(results, /EXPORT_PLATFORM_RULES/);
  assert.match(results, /missing a name/);
  assert.match(results, /missing a platform/);
  assert.match(results, /has no export_path/);
  assert.match(results, /No built-in NIUA validation rule/);
  assert.match(results, /export templates are not installed/);
  assert.match(results, /extensions\.some/);
});

test("list_export_presets reads export presets from the bridge", async () => {
  let receivedUrl = null;

  await withJsonBridge((req, res) => {
    receivedUrl = req.url;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { presets: [] } }));
  }, async (port) => {
    const result = await toolByName("list_export_presets").handler({ port });

    assert.equal(receivedUrl, "/export/presets");
    assert.deepEqual(parseToolText(result), {
      ok: true,
      data: { presets: [] }
    });
  });
});

test("upsert_export_preset forwards payload through the bridge", async () => {
  let received = null;

  await withJsonBridge(async (req, res) => {
    received = { url: req.url, body: await readJsonBody(req) };
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const result = await toolByName("upsert_export_preset").handler({
      port,
      name: "Linux",
      platform: "Linux",
      exportPath: "res://build/linux.x86_64",
      runnable: true,
      exportFilter: "all_resources",
      includeFilter: "",
      excludeFilter: "",
      customFeatures: "demo",
      dedicatedServer: false,
      options: {
        "binary_format/embed_pck": true
      }
    });

    assert.deepEqual(received, {
      url: "/export/preset/upsert",
      body: {
        name: "Linux",
        platform: "Linux",
        exportPath: "res://build/linux.x86_64",
        runnable: true,
        exportFilter: "all_resources",
        includeFilter: "",
        excludeFilter: "",
        customFeatures: "demo",
        dedicatedServer: false,
        options: {
          "binary_format/embed_pck": true
        }
      }
    });
    assert.deepEqual(parseToolText(result), {
      ok: true,
      data: { endpoint: "/export/preset/upsert" }
    });
  });
});
