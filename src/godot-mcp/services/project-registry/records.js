import path from "node:path";

import {
  assertAllowedProjectRoot
} from "./paths.js";
import { projectMetadata } from "./metadata.js";
import {
  readProjectRegistry,
  writeProjectRegistry
} from "./storage.js";

export async function rememberGodotProject({
  projectRoot,
  name = null,
  source = "seen",
  lastOpenedAt = null,
  lastCreatedAt = null
} = {}) {
  const resolvedProjectRoot = assertAllowedProjectRoot(projectRoot);
  const metadata = await projectMetadata(resolvedProjectRoot);
  const registry = await readProjectRegistry();
  const now = new Date().toISOString();
  const index = registry.projects.findIndex((project) => project.projectRoot === resolvedProjectRoot);
  const existing = index === -1 ? null : registry.projects[index];
  const record = {
    projectRoot: resolvedProjectRoot,
    projectFile: metadata.projectFile,
    name: name ?? metadata.name,
    source,
    firstSeenAt: existing?.firstSeenAt ?? now,
    lastSeenAt: now,
    lastOpenedAt: lastOpenedAt ?? existing?.lastOpenedAt ?? null,
    lastCreatedAt: lastCreatedAt ?? existing?.lastCreatedAt ?? null
  };

  if (index === -1) {
    registry.projects.push(record);
  } else {
    registry.projects[index] = record;
  }

  await writeProjectRegistry(registry);
  return record;
}

export function knownProjectByRoot(registry, projectRoot) {
  if (!projectRoot) {
    return null;
  }

  const resolvedProjectRoot = path.resolve(projectRoot);
  return registry.projects.find((project) => (
    path.resolve(project.projectRoot) === resolvedProjectRoot
  )) ?? null;
}
