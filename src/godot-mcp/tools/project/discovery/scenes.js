import { readFile, stat } from "node:fs/promises";

import { parseGodotConfig } from "../../../godot/config.js";
import { resolveProjectResDirectoryPath } from "../../../godot/paths.js";
import { normalizeBoundedInteger } from "../../../shared/numbers.js";
import {
  assertAllowedProjectRoot,
  pathExists,
  projectMetadata
} from "../../../services/project-registry.js";

import { collectProjectSceneFiles } from "./scene-scanner.js";

export async function listScenes(args = {}) {
  const requestedProjectRoot = String(args.projectRoot ?? "").trim();
  if (!requestedProjectRoot) {
    throw new Error("projectRoot is required");
  }

  const projectRoot = assertAllowedProjectRoot(requestedProjectRoot);
  const metadata = await projectMetadata(projectRoot);
  const projectText = await readFile(metadata.projectFile, "utf8");
  const config = parseGodotConfig(projectText);
  const mainScene = String(config.application?.["run/main_scene"] ?? "");
  const maxScenes = normalizeBoundedInteger(args.maxScenes, {
    fallback: 500,
    min: 1,
    max: 5000
  });
  const recursive = Boolean(args.recursive ?? true);
  const root = resolveProjectResDirectoryPath(projectRoot, String(args.rootPath ?? "res://"));

  if (!await pathExists(root.absolutePath)) {
    throw new Error(`scene root not found: ${root.path}`);
  }
  const rootStat = await stat(root.absolutePath);
  if (!rootStat.isDirectory()) {
    throw new Error(`scene root is not a directory: ${root.path}`);
  }

  const scenes = [];
  await collectProjectSceneFiles({
    projectRoot,
    directory: root.absolutePath,
    scenes,
    recursive,
    maxScenes,
    mainScene
  });
  scenes.sort((left, right) => left.path.localeCompare(right.path));

  return {
    ok: true,
    data: {
      projectRoot,
      projectName: metadata.name,
      rootPath: root.path,
      recursive,
      maxScenes,
      mainScene,
      sceneCount: scenes.length,
      scenes
    }
  };
}
