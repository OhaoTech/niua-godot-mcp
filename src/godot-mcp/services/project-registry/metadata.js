import { readFile } from "node:fs/promises";
import path from "node:path";

import { pathExists } from "./paths.js";

export async function projectMetadata(projectRoot) {
  const projectFile = path.join(projectRoot, "project.godot");
  if (!await pathExists(projectFile)) {
    throw new Error(`Godot project file does not exist: ${projectFile}`);
  }

  const projectText = await readFile(projectFile, "utf8");
  return {
    projectRoot,
    projectFile,
    name: parseProjectName(projectText, path.basename(projectRoot))
  };
}

export function parseProjectName(projectText, fallback) {
  const match = /^\s*config\/name\s*=\s*(.+?)\s*$/m.exec(projectText);
  if (!match) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(match[1]);
    if (typeof parsed === "string" && parsed.trim()) {
      return parsed.trim();
    }
  } catch (_error) {
    const unquoted = match[1].replace(/^"|"$/g, "").trim();
    if (unquoted) {
      return unquoted;
    }
  }

  return fallback;
}
