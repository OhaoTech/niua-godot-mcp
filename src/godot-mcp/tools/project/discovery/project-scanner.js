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
