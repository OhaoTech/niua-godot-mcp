import path from "node:path";

import {
  assertAllowedProjectRoot,
  pathExists
} from "../../../services/project-registry.js";
import { normalizePositiveInteger } from "../../../shared/numbers.js";
import {
  exportFailureMessage,
  runGodotExportProcess
} from "../../export/local/process.js";

export async function importProjectAssets(args = {}) {
  const requestedProjectRoot = String(args.projectRoot ?? "").trim();
  if (!requestedProjectRoot) {
    throw new Error("projectRoot is required");
  }

  const projectRoot = assertAllowedProjectRoot(requestedProjectRoot);
  const projectFile = path.join(projectRoot, "project.godot");
  if (!await pathExists(projectFile)) {
    throw new Error(`Godot project file does not exist: ${projectFile}`);
  }

  const timeoutMs = normalizePositiveInteger(args.timeoutMs, 120000);
  const godotBin = process.env.GODOT_BIN ?? "godot";
  const importArgs = [
    "--headless",
    "--path",
    projectRoot,
    "--import",
    "--quit"
  ];
  const outputEvents = [];
  const startedAt = new Date();
  let stdout = "";
  let stderr = "";

  try {
    const result = await runGodotExportProcess(godotBin, importArgs, {
      cwd: projectRoot,
      env: bridgelessImportEnv(),
      timeoutMs,
      outputEvents
    });
    stdout = result.stdout;
    stderr = result.stderr;
  } catch (error) {
    throw new Error(`Godot asset import failed: ${exportFailureMessage(error)}`);
  }

  const finishedAt = new Date();
  return {
    ok: true,
    data: {
      projectRoot,
      projectFile,
      godotBin,
      args: importArgs,
      timeoutMs,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      stdout,
      stderr,
      outputEvents
    }
  };
}

function bridgelessImportEnv() {
  const env = { ...process.env };
  for (const name of [
    "NIUA_MCP_PORT",
    "GODOT_MCP_PORT",
    "NIUA_MCP_TOKEN",
    "GODOT_MCP_TOKEN"
  ]) {
    delete env[name];
  }
  return env;
}
