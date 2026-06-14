import { stat } from "node:fs/promises";
import path from "node:path";

export function allowedProjectRoots() {
  const configured = process.env.GODOT_MCP_ALLOWED_PROJECT_ROOTS;
  const roots = configured
    ? configured.split(path.delimiter)
    : [path.resolve("runs")];

  return roots
    .map((root) => root.trim())
    .filter(Boolean)
    .map((root) => path.resolve(root));
}

export function assertAllowedProjectRoot(projectRoot) {
  const resolvedProjectRoot = path.resolve(projectRoot);
  const allowedRoots = allowedProjectRoots();
  const allowed = allowedRoots.some((root) => {
    const relative = path.relative(root, resolvedProjectRoot);
    return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
  });

  if (!allowed) {
    throw new Error(`${resolvedProjectRoot} is outside allowed project roots: ${allowedRoots.join(", ")}`);
  }

  return resolvedProjectRoot;
}

export async function pathExists(candidatePath) {
  try {
    await stat(candidatePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}
