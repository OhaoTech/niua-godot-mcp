import path from "node:path";

import {
  assertAllowedProjectRoot,
  pathExists
} from "../../../../services/project-registry.js";
import {
  getRunningProjectByRoot,
  serializeProjectProcess
} from "../../../../services/process-manager.js";

export async function resolveLaunchProject(args = {}) {
  const requestedProjectRoot = String(args.projectRoot ?? "").trim();
  if (!requestedProjectRoot) {
    throw new Error("projectRoot is required");
  }

  const projectRoot = assertAllowedProjectRoot(requestedProjectRoot);
  const projectFile = path.join(projectRoot, "project.godot");
  if (!await pathExists(projectFile)) {
    throw new Error(`Godot project file does not exist: ${projectFile}`);
  }

  return {
    projectRoot,
    projectFile
  };
}

export function reusableProjectResponse(args = {}, projectRoot) {
  const reuseExisting = args.reuseExisting !== false;
  const existing = reuseExisting ? getRunningProjectByRoot(projectRoot) : null;
  if (!existing) {
    return null;
  }

  return {
    ok: true,
    data: {
      ...serializeProjectProcess(existing),
      reused: true
    }
  };
}
