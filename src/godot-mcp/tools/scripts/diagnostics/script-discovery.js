import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import {
  absoluteProjectPathToResPath,
  resolveProjectResDirectoryPath,
  resolveProjectScriptPath
} from "../../../godot/paths.js";
import { pathExists } from "../../../services/project-registry.js";

export async function resolveProjectScriptsForDiagnostics(projectRoot, args, maxScripts) {
  if (Array.isArray(args.paths) && args.paths.length > 0) {
    if (args.paths.length > maxScripts) {
      throw new Error(`paths exceeds maxScripts: ${args.paths.length} > ${maxScripts}`);
    }

    const seen = new Set();
    const scripts = [];
    for (const rawPath of args.paths) {
      const script = resolveProjectScriptPath(projectRoot, String(rawPath ?? ""));
      if (!await pathExists(script.absolutePath)) {
        throw new Error(`script not found: ${script.path}`);
      }
      if (!seen.has(script.path)) {
        scripts.push(script);
        seen.add(script.path);
      }
    }
    return scripts;
  }

  if (args.paths !== undefined && !Array.isArray(args.paths)) {
    throw new Error("paths must be an array when provided");
  }

  const root = resolveProjectResDirectoryPath(projectRoot, String(args.rootPath ?? "res://"));
  if (!await pathExists(root.absolutePath)) {
    throw new Error(`script diagnostics root not found: ${root.path}`);
  }
  const rootStat = await stat(root.absolutePath);
  if (!rootStat.isDirectory()) {
    throw new Error(`script diagnostics root is not a directory: ${root.path}`);
  }

  const scripts = [];
  await collectProjectGdScripts(projectRoot, root.absolutePath, scripts, maxScripts);
  scripts.sort((left, right) => left.path.localeCompare(right.path));
  return scripts;
}

export async function collectProjectGdScripts(projectRoot, directory, scripts, maxScripts) {
  if (scripts.length >= maxScripts) {
    return;
  }

  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    if (scripts.length >= maxScripts || entry.name.startsWith(".")) {
      continue;
    }

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectProjectGdScripts(projectRoot, absolutePath, scripts, maxScripts);
    } else if (entry.isFile() && entry.name.endsWith(".gd")) {
      scripts.push({
        path: absoluteProjectPathToResPath(projectRoot, absolutePath),
        absolutePath
      });
    }
  }
}
