import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseGodotConfig } from "../../../../godot/config.js";
import {
  assertAllowedProjectRoot,
  pathExists
} from "../../../../services/project-registry.js";
import { diagnoseExportTemplates } from "../templates.js";
import { validateExportPresetSummary } from "./results.js";
import { exportPresetSummariesFromSections } from "./summaries.js";

export async function validateExportPreset(args = {}) {
  const requestedProjectRoot = String(args.projectRoot ?? "").trim();
  if (!requestedProjectRoot) {
    throw new Error("projectRoot is required");
  }

  const projectRoot = assertAllowedProjectRoot(requestedProjectRoot);
  const exportPresetsFile = path.join(projectRoot, "export_presets.cfg");
  if (!await pathExists(exportPresetsFile)) {
    throw new Error(`Godot export presets file does not exist: ${exportPresetsFile}`);
  }

  const presetFilter = String(args.preset ?? "").trim();
  const sections = parseGodotConfig(await readFile(exportPresetsFile, "utf8"));
  const presets = exportPresetSummariesFromSections(sections);
  const targets = presetFilter
    ? presets.filter((preset) => preset.name === presetFilter)
    : presets;
  const templateDiagnostics = await diagnoseExportTemplates({ projectRoot });

  if (presetFilter && targets.length === 0) {
    return {
      ok: true,
      data: {
        projectRoot,
        exportPresetsFile,
        preset: presetFilter,
        valid: false,
        presets,
        results: [{
          preset: null,
          valid: false,
          errors: [`Export preset does not exist: ${presetFilter}`],
          warnings: []
        }],
        templateDiagnostics: templateDiagnostics.data
      }
    };
  }

  const results = targets.map((preset) => validateExportPresetSummary(preset, templateDiagnostics.data));
  return {
    ok: true,
    data: {
      projectRoot,
      exportPresetsFile,
      preset: presetFilter || null,
      valid: results.every((result) => result.valid),
      presets,
      results,
      templateDiagnostics: templateDiagnostics.data
    }
  };
}
