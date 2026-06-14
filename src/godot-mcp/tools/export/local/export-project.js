import { mkdir } from "node:fs/promises";
import path from "node:path";

import {
  assertAllowedProjectRoot,
  pathExists
} from "../../../services/project-registry.js";
import { normalizePositiveInteger } from "../../../shared/numbers.js";
import { exportFlag, normalizeExportMode } from "./modes.js";
import {
  exportFailureMessage,
  runGodotExportProcess
} from "./process.js";

export async function exportGodotProject(args = {}) {
  const requestedProjectRoot = String(args.projectRoot ?? "").trim();
  if (!requestedProjectRoot) {
    throw new Error("projectRoot is required");
  }

  const preset = String(args.preset ?? "").trim();
  if (!preset) {
    throw new Error("preset is required");
  }

  const requestedOutputPath = String(args.outputPath ?? "").trim();
  if (!requestedOutputPath) {
    throw new Error("outputPath is required");
  }

  const projectRoot = assertAllowedProjectRoot(requestedProjectRoot);
  const outputPath = assertAllowedProjectRoot(requestedOutputPath);
  const mode = normalizeExportMode(args.mode);
  const timeoutMs = normalizePositiveInteger(args.timeoutMs, 120000);
  const projectFile = path.join(projectRoot, "project.godot");
  if (!await pathExists(projectFile)) {
    throw new Error(`Godot project file does not exist: ${projectFile}`);
  }

  const exportPresetsFile = path.join(projectRoot, "export_presets.cfg");
  if (!await pathExists(exportPresetsFile)) {
    throw new Error(`Godot export presets file does not exist: ${exportPresetsFile}`);
  }

  await mkdir(path.dirname(outputPath), { recursive: true });

  const godotBin = process.env.GODOT_BIN ?? "godot";
  const exportArgs = [
    "--headless",
    "--path",
    projectRoot,
    exportFlag(mode),
    preset,
    outputPath
  ];
  const startedAt = new Date();
  let stdout = "";
  let stderr = "";
  const outputEvents = [];

  try {
    const result = await runGodotExportProcess(godotBin, exportArgs, {
      cwd: projectRoot,
      timeoutMs,
      outputEvents
    });
    stdout = result.stdout;
    stderr = result.stderr;
  } catch (error) {
    throw new Error(`Godot export failed: ${exportFailureMessage(error)}`);
  }

  const finishedAt = new Date();
  return {
    ok: true,
    data: {
      projectRoot,
      projectFile,
      exportPresetsFile,
      preset,
      mode,
      outputPath,
      outputExists: await pathExists(outputPath),
      godotBin,
      args: exportArgs,
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
