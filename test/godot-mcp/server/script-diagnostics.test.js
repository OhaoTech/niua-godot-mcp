import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  createFakeGodotProjectScriptChecker,
  createFakeGodotScriptChecker,
  createMcpProcess,
  waitForFileText,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards validate_script calls to the editor bridge", async () => {
  await withBridgeServer(async (req, res) => {
    if (req.url === "/script/validate?path=res%3A%2F%2Fscripts%2Fplayer.gd" && req.method === "GET") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://scripts/player.gd",
          valid: true
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      const response = await server.request("tools/call", {
        name: "validate_script",
        arguments: {
          path: "res://scripts/player.gd"
        }
      });

      assert.match(response.result.content[0].text, /"valid":true/);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server diagnoses GDScript parser output", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-script-diagnostics-"));
  const projectRoot = path.join(allowedRoot, "demo");

  try {
    await mkdir(path.join(projectRoot, "scripts"), { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Script Diagnostics Demo\"",
      ""
    ].join("\n"));
    await writeFile(path.join(projectRoot, "scripts/player.gd"), [
      "extends Node",
      "func _ready()",
      "\tprint(\"bad\")",
      ""
    ].join("\n"));

    const { fakeGodot, logPath } = await createFakeGodotScriptChecker(allowedRoot);
    const server = createMcpProcess({
      GODOT_BIN: fakeGodot,
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      NIUA_FAKE_GODOT_SCRIPT_CHECK_LOG: logPath
    });

    try {
      const response = await server.request("tools/call", {
        name: "diagnose_script",
        arguments: {
          projectRoot,
          path: "res://scripts/player.gd"
        }
      });
      assert.equal(response.error, undefined);
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.valid, false);
      assert.equal(payload.data.exitCode, 1);
      assert.equal(payload.data.path, "res://scripts/player.gd");
      assert.equal(payload.data.diagnostics[0].severity, "error");
      assert.equal(payload.data.diagnostics[0].path, "res://scripts/player.gd");
      assert.equal(payload.data.diagnostics[0].line, 3);
      assert.match(payload.data.diagnostics[0].message, /Unexpected "Indent"/);

      const logText = await waitForFileText(logPath);
      const fakeLaunch = JSON.parse(logText.trim().split("\n").at(-1));
      assert.deepEqual(fakeLaunch.argv.slice(0, 3), [
        "--headless",
        "--check-only",
        "--script"
      ]);
      assert.equal(fakeLaunch.cwd, projectRoot);
      assert.equal(fakeLaunch.argv[3], path.join(projectRoot, "scripts/player.gd"));
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server diagnoses project GDScript files", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-project-script-diagnostics-"));
  const projectRoot = path.join(allowedRoot, "demo");

  try {
    await mkdir(path.join(projectRoot, "scripts"), { recursive: true });
    await mkdir(path.join(projectRoot, "addons", "ignored"), { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), "config_version=5\n");
    await writeFile(path.join(projectRoot, "scripts", "player.gd"), "extends Node\n");
    await writeFile(path.join(projectRoot, "scripts", "enemy.gd"), "extends Node\n");
    await writeFile(path.join(projectRoot, "addons", "ignored", "plugin.gd"), "extends Node\n");

    const { fakeGodot, logPath } = await createFakeGodotProjectScriptChecker(allowedRoot);
    const server = createMcpProcess({
      GODOT_BIN: fakeGodot,
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      NIUA_FAKE_GODOT_SCRIPT_CHECK_LOG: logPath
    });

    try {
      const response = await server.request("tools/call", {
        name: "diagnose_project_scripts",
        arguments: {
          projectRoot,
          rootPath: "res://scripts",
          maxScripts: 10
        }
      });
      assert.equal(response.error, undefined);
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.valid, false);
      assert.equal(payload.data.scannedScripts, 2);
      assert.equal(payload.data.invalidScripts, 1);
      assert.deepEqual(payload.data.scripts.map((script) => script.path), [
        "res://scripts/enemy.gd",
        "res://scripts/player.gd"
      ]);
      assert.equal(payload.data.scripts[0].valid, false);
      assert.equal(payload.data.scripts[0].diagnostics[0].path, "res://scripts/enemy.gd");

      const logText = await waitForFileText(logPath);
      const launches = logText.trim().split("\n").map((line) => JSON.parse(line));
      assert.equal(launches.length, 2);
      assert(launches.every((launch) => launch.cwd === projectRoot));
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});
