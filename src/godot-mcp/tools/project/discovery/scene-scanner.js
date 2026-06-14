import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import { absoluteProjectPathToResPath } from "../../../godot/paths.js";

export async function collectProjectSceneFiles({
  projectRoot,
  directory,
  scenes,
  recursive,
  maxScenes,
  mainScene
}) {
  if (scenes.length >= maxScenes) {
    return;
  }

  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    if (scenes.length >= maxScenes || entry.name.startsWith(".")) {
      continue;
    }

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (recursive) {
        await collectProjectSceneFiles({
          projectRoot,
          directory: absolutePath,
          scenes,
          recursive,
          maxScenes,
          mainScene
        });
      }
      continue;
    }

    if (!entry.isFile() || !isGodotSceneFile(entry.name)) {
      continue;
    }

    const sceneStat = await stat(absolutePath);
    const resPath = absoluteProjectPathToResPath(projectRoot, absolutePath);
    scenes.push({
      path: resPath,
      name: path.basename(entry.name, path.extname(entry.name)),
      extension: path.extname(entry.name),
      absolutePath,
      size: sceneStat.size,
      modifiedTime: new Date(sceneStat.mtimeMs).toISOString(),
      isMainScene: mainScene === resPath
    });
  }
}

export function isGodotSceneFile(name) {
  return name.endsWith(".tscn") || name.endsWith(".scn");
}
