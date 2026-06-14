import { readdir } from "node:fs/promises";
import path from "node:path";

import { getGodotVersion } from "../../../services/godot-runtime.js";
import {
  assertAllowedProjectRoot,
  pathExists
} from "../../../services/project-registry.js";

export async function diagnoseExportTemplates(args = {}) {
  const requestedProjectRoot = String(args.projectRoot ?? "").trim();
  const projectRoot = requestedProjectRoot ? assertAllowedProjectRoot(requestedProjectRoot) : null;
  const templatesRoot = exportTemplatesRoot();
  const godotVersion = await getGodotVersion();
  const versionKeys = exportTemplateVersionKeys(godotVersion);
  const candidates = [];

  for (const versionKey of versionKeys) {
    const candidatePath = path.join(templatesRoot, versionKey);
    const exists = await pathExists(candidatePath);
    const files = exists ? await directoryFileNames(candidatePath) : [];
    candidates.push({
      versionKey,
      path: candidatePath,
      exists,
      fileCount: files.length,
      files
    });
  }

  const selected = candidates.find((candidate) => candidate.exists && candidate.fileCount > 0) ?? null;
  const projectFile = projectRoot ? path.join(projectRoot, "project.godot") : null;
  const exportPresetsFile = projectRoot ? path.join(projectRoot, "export_presets.cfg") : null;
  const project = projectRoot ? {
    projectRoot,
    projectFile,
    exportPresetsFile,
    projectFileExists: await pathExists(projectFile),
    exportPresetsFileExists: await pathExists(exportPresetsFile)
  } : null;

  return {
    ok: true,
    data: {
      godotBin: process.env.GODOT_BIN ?? "godot",
      godotVersion,
      versionKeys,
      templatesRoot,
      installed: selected !== null,
      selected,
      candidates,
      project,
      guidance: selected ? [] : [
        "Install export templates in Godot with Editor > Manage Export Templates.",
        `Expected a non-empty template directory under ${templatesRoot} for one of: ${versionKeys.join(", ")}.`
      ]
    }
  };
}

function exportTemplatesRoot() {
  if (process.env.GODOT_MCP_EXPORT_TEMPLATES_DIR) {
    return path.resolve(process.env.GODOT_MCP_EXPORT_TEMPLATES_DIR);
  }

  const dataHome = process.env.XDG_DATA_HOME
    ? path.resolve(process.env.XDG_DATA_HOME)
    : path.join(path.resolve(process.env.HOME ?? ""), ".local", "share");
  return path.join(dataHome, "godot", "export_templates");
}

function exportTemplateVersionKeys(versionText) {
  const normalized = String(versionText ?? "")
    .trim()
    .replace(/^Godot Engine\s+/i, "")
    .split(/\s+/)[0];
  const keys = [];

  for (const candidate of [
    normalized,
    normalized.replace(/\.[0-9a-f]{7,}$/i, ""),
    normalized.replace(/\.fedora(?:\.[0-9a-f]{7,})?$/i, "")
  ]) {
    if (candidate && !keys.includes(candidate)) {
      keys.push(candidate);
    }
  }

  return keys;
}

async function directoryFileNames(directoryPath) {
  try {
    const entries = await readdir(directoryPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
      return [];
    }
    throw error;
  }
}
