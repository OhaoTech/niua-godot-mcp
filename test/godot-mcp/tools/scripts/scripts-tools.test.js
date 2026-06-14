import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

import { toolDefinitionsFromManifest } from "../../../../src/godot-mcp/manifest/index.js";
import { SCRIPT_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/scripts/index.js";
import { SCRIPT_TOOL_MANIFEST } from "../../../../src/godot-mcp/tools/scripts/manifest.js";

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
  return SCRIPT_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

async function readScriptToolSource(file) {
  return readFile(new URL(`../../../../src/godot-mcp/tools/scripts/${file}`, import.meta.url), "utf8");
}

function replaceEnv(name, value) {
  const previous = process.env[name];
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
  return () => {
    if (previous === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = previous;
    }
  };
}

async function createFakeGodotScriptChecker(root) {
  const fakeGodot = path.join(root, "fake-godot-script-checker.mjs");
  const logPath = path.join(root, "fake-godot-script-checker-log.jsonl");

  await writeFile(fakeGodot, `#!/usr/bin/env node
import { appendFileSync } from "node:fs";

const argv = process.argv.slice(2);
const scriptPath = argv.at(-1);
appendFileSync(${JSON.stringify(logPath)}, JSON.stringify({
  argv,
  cwd: process.cwd(),
  scriptPath
}) + "\\n");

if (scriptPath.endsWith("bad.gd")) {
  process.stderr.write("SCRIPT ERROR: Unexpected token\\n");
  process.stderr.write("          at: GDScript::reload (res://scripts/bad.gd:3:5)\\n");
  process.exit(1);
}

process.stdout.write("script ok\\n");
`, "utf8");
  await chmod(fakeGodot, 0o755);

  return { fakeGodot, logPath };
}

test("SCRIPT_TOOL_DEFINITIONS exposes script tool descriptors", () => {
  const generatedDefinitions = toolDefinitionsFromManifest(SCRIPT_TOOL_MANIFEST, {
    localHandlers: {
      diagnoseGodotScript() {},
      diagnoseGodotProjectScripts() {}
    }
  });

  assert.deepEqual(SCRIPT_TOOL_DEFINITIONS.map((tool) => tool.name), [
    "read_script",
    "write_script",
    "open_script",
    "validate_script",
    "diagnose_script",
    "diagnose_project_scripts",
    "get_script_symbols",
    "get_script_editor_state",
    "get_script_cursor_state",
    "goto_script_line",
    "replace_in_scripts",
    "create_script",
    "attach_script"
  ]);
  assert.deepEqual(
    SCRIPT_TOOL_DEFINITIONS.map(({ handler, ...definition }) => definition),
    generatedDefinitions.map(({ handler, ...definition }) => definition)
  );
  assert.ok(SCRIPT_TOOL_DEFINITIONS.every((tool) => tool.inputSchema?.type === "object"));
});

test("script tool implementation is generated from the manifest", async () => {
  const facade = await readScriptToolSource("index.js");

  assert.match(facade, /toolDefinitionsFromManifest\(SCRIPT_TOOL_MANIFEST/);
  assert.match(facade, /diagnoseGodotScript/);
  assert.match(facade, /diagnoseGodotProjectScripts/);
  assert.doesNotMatch(facade, /name: "read_script"/);
  assert.doesNotMatch(facade, /async handler/);
});

test("script diagnostics delegate focused modules", async () => {
  const facade = await readScriptToolSource("diagnostics.js");
  const singleScript = await readScriptToolSource("diagnostics/single-script.js");
  const projectScripts = await readScriptToolSource("diagnostics/project-scripts.js");
  const discovery = await readScriptToolSource("diagnostics/script-discovery.js");
  const runner = await readScriptToolSource("diagnostics/runner.js");
  const parser = await readScriptToolSource("diagnostics/parser.js");

  assert.match(facade, /from "\.\/diagnostics\/single-script\.js"/);
  assert.match(facade, /from "\.\/diagnostics\/project-scripts\.js"/);
  assert.doesNotMatch(facade, /execFile/);
  assert.doesNotMatch(facade, /readdir/);
  assert.doesNotMatch(facade, /parseGodotScriptDiagnostics\(output\)/);

  assert.match(singleScript, /export async function diagnoseGodotScript/);
  assert.match(singleScript, /resolveProjectScriptPath/);
  assert.match(singleScript, /runGodotScriptCheck/);
  assert.match(singleScript, /parseGodotScriptDiagnostics/);
  assert.match(singleScript, /stdout: result\.stdout/);
  assert.match(singleScript, /stderr: result\.stderr/);

  assert.match(projectScripts, /export async function diagnoseGodotProjectScripts/);
  assert.match(projectScripts, /resolveProjectScriptsForDiagnostics/);
  assert.match(projectScripts, /normalizeBoundedInteger/);
  assert.match(projectScripts, /invalidScripts/);
  assert.match(projectScripts, /scriptPath: script\.path/);

  assert.match(discovery, /export async function resolveProjectScriptsForDiagnostics/);
  assert.match(discovery, /export async function collectProjectGdScripts/);
  assert.match(discovery, /resolveProjectResDirectoryPath/);
  assert.match(discovery, /absoluteProjectPathToResPath/);
  assert.match(discovery, /paths exceeds maxScripts/);

  assert.match(runner, /export async function runGodotScriptCheck/);
  assert.match(runner, /execFileAsync/);
  assert.match(runner, /maxBuffer: 1024 \* 1024/);
  assert.match(runner, /timedOut: Boolean\(error\.killed\)/);

  assert.match(parser, /export function parseGodotScriptDiagnostics/);
  assert.match(parser, /SCRIPT \(ERROR\|WARNING\)/);
  assert.match(parser, /pending\.source = location\[1\]/);
  assert.match(parser, /pending\.column = location\[4\]/);
});

test("script schemas delegate authoring diagnostics editor and refactor modules", async () => {
  const facade = await readScriptToolSource("schemas.js");
  const authoring = await readScriptToolSource("schemas/authoring.js");
  const diagnostics = await readScriptToolSource("schemas/diagnostics.js");
  const editor = await readScriptToolSource("schemas/editor.js");
  const refactor = await readScriptToolSource("schemas/refactor.js");

  assert.match(facade, /from "\.\.\/filesystem\/schemas\.js"/);
  assert.match(facade, /from "\.\/schemas\/authoring\.js"/);
  assert.match(facade, /from "\.\/schemas\/diagnostics\.js"/);
  assert.match(facade, /from "\.\/schemas\/editor\.js"/);
  assert.match(facade, /from "\.\/schemas\/refactor\.js"/);
  assert.doesNotMatch(facade, /export const CREATE_SCRIPT_SCHEMA/);
  assert.doesNotMatch(facade, /CONNECTION_PROPERTIES/);

  assert.match(authoring, /export const CREATE_SCRIPT_SCHEMA/);
  assert.match(authoring, /export const ATTACH_SCRIPT_SCHEMA/);
  assert.match(authoring, /CONNECTION_PROPERTIES/);
  assert.match(authoring, /createIfMissing/);
  assert.match(authoring, /saveScene/);

  assert.match(diagnostics, /export const SCRIPT_DIAGNOSTICS_SCHEMA/);
  assert.match(diagnostics, /export const PROJECT_SCRIPT_DIAGNOSTICS_SCHEMA/);
  assert.match(diagnostics, /maxScripts/);
  assert.match(diagnostics, /timeoutMs/);
  assert.doesNotMatch(diagnostics, /CONNECTION_PROPERTIES/);

  assert.match(editor, /export const GOTO_SCRIPT_LINE_SCHEMA/);
  assert.match(editor, /CONNECTION_PROPERTIES/);
  assert.match(editor, /grabFocus/);

  assert.match(refactor, /export const REPLACE_IN_SCRIPTS_SCHEMA/);
  assert.match(refactor, /CONNECTION_PROPERTIES/);
  assert.match(refactor, /maxReplacements/);
  assert.match(refactor, /dryRun/);
});

test("create_script handler forwards payload through the bridge", async () => {
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
    const result = await toolByName("create_script").handler({
      port,
      path: "res://scripts/player.gd",
      template: "node_lifecycle",
      className: "Player",
      overwrite: true
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.endpoint, "/script/create");
    assert.deepEqual(receivedBody, {
      path: "res://scripts/player.gd",
      template: "node_lifecycle",
      className: "Player",
      overwrite: true
    });
  });
});

test("get_script_editor_state handler reads through the bridge", async () => {
  let seenUrl = null;

  await withJsonBridge((req, res) => {
    seenUrl = req.url;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        currentScript: { path: "res://scripts/player.gd", type: "GDScript" },
        openScripts: []
      }
    }));
  }, async (port) => {
    const result = await toolByName("get_script_editor_state").handler({ port });
    const payload = parseToolText(result);

    assert.equal(seenUrl, "/script/editor/state");
    assert.equal(payload.data.currentScript.path, "res://scripts/player.gd");
  });
});

test("diagnose_project_scripts handler scans project scripts with Godot parser output", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-script-tools-"));
  const restoreAllowedRoots = replaceEnv("GODOT_MCP_ALLOWED_PROJECT_ROOTS", allowedRoot);
  let restoreGodotBin = null;

  try {
    const projectRoot = path.join(allowedRoot, "demo");
    await mkdir(path.join(projectRoot, "scripts"), { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), "[application]\nconfig/name=\"Demo\"\n");
    await writeFile(path.join(projectRoot, "scripts", "good.gd"), "extends Node\n");
    await writeFile(path.join(projectRoot, "scripts", "bad.gd"), "extends Node\n");

    const { fakeGodot, logPath } = await createFakeGodotScriptChecker(allowedRoot);
    restoreGodotBin = replaceEnv("GODOT_BIN", fakeGodot);

    const result = await toolByName("diagnose_project_scripts").handler({
      projectRoot,
      rootPath: "res://scripts",
      maxScripts: 10
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.valid, false);
    assert.equal(payload.data.scannedScripts, 2);
    assert.equal(payload.data.invalidScripts, 1);
    assert.deepEqual(payload.data.scripts.map((script) => script.path), [
      "res://scripts/bad.gd",
      "res://scripts/good.gd"
    ]);
    assert.equal(payload.data.scripts[0].diagnostics[0].severity, "error");
    assert.equal(payload.data.scripts[0].diagnostics[0].line, 3);
    assert.equal(payload.data.scripts[0].diagnostics[0].column, 5);

    const launches = (await readFile(logPath, "utf8"))
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    assert.equal(launches.length, 2);
    assert.ok(launches.every((launch) => launch.cwd === projectRoot));
    assert.ok(launches.every((launch) => launch.argv.includes("--check-only")));
  } finally {
    restoreGodotBin?.();
    restoreAllowedRoots();
    await rm(allowedRoot, { recursive: true, force: true });
  }
});
