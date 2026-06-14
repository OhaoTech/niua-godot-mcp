import { normalizeBoundedInteger } from "../../../shared/numbers.js";
import {
  allowedProjectRoots,
  assertAllowedProjectRoot,
  rememberGodotProject
} from "../../../services/project-registry.js";

import { scanProjectRoots } from "./project-scanner.js";

export async function discoverGodotProjects(args = {}) {
  const roots = Array.isArray(args.roots) && args.roots.length > 0
    ? args.roots.map((root) => assertAllowedProjectRoot(String(root)))
    : allowedProjectRoots();
  const maxDepth = normalizeBoundedInteger(args.maxDepth, {
    fallback: 4,
    min: 1,
    max: 8
  });
  const remember = Boolean(args.remember ?? false);
  const seen = new Set();
  const projects = [];

  for (const root of roots) {
    const discovered = await scanProjectRoots({ root, maxDepth });
    for (const project of discovered) {
      if (seen.has(project.projectRoot)) {
        continue;
      }
      seen.add(project.projectRoot);

      const registryRecord = remember
        ? await rememberGodotProject({
          projectRoot: project.projectRoot,
          name: project.name,
          source: "discovered"
        })
        : null;

      projects.push({
        ...project,
        registryRecord
      });
    }
  }

  projects.sort((left, right) => left.projectRoot.localeCompare(right.projectRoot));

  return {
    ok: true,
    data: {
      roots,
      maxDepth,
      remembered: remember,
      projects
    }
  };
}
