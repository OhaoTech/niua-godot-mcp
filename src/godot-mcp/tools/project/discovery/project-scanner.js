import { readdir } from "node:fs/promises";
import path from "node:path";

import {
  pathExists,
  projectMetadata
} from "../../../services/project-registry.js";

export async function scanProjectRoots({ root, maxDepth }) {
  const projects = [];

  async function walk(directory, depth) {
    const projectFile = path.join(directory, "project.godot");
    if (await pathExists(projectFile)) {
      projects.push(await projectMetadata(directory));
      return;
    }

    if (depth >= maxDepth) {
      return;
    }

    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (["EACCES", "ENOENT", "ENOTDIR"].includes(error?.code)) {
        return;
      }
      throw error;
    }

    // Determinism (B6): readdir order is filesystem-dependent; walk in sorted
    // name order so discovered projects always list identically (same pattern
    // as scene-scanner.js and script-discovery.js).
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      if (!entry.isDirectory() || shouldSkipDiscoveryDirectory(entry.name)) {
        continue;
      }

      await walk(path.join(directory, entry.name), depth + 1);
    }
  }

  await walk(root, 0);
  return projects;
}

export function shouldSkipDiscoveryDirectory(name) {
  return [".git", ".godot", ".import", "addons", "node_modules"].includes(name);
}
