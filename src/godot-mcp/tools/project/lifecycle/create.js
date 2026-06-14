import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { installAddon } from "../../../../../scripts/install-niua-godot-addon.js";
import {
  allowedProjectRoots,
  assertAllowedProjectRoot,
  pathExists,
  rememberGodotProject
} from "../../../services/project-registry.js";

export async function createGodotProject(args = {}) {
  const requestedProjectRoot = String(args.projectRoot ?? "").trim();
  if (!requestedProjectRoot) {
    throw new Error("projectRoot is required");
  }

  const projectRoot = assertAllowedProjectRoot(requestedProjectRoot);
  const projectName = String(args.name ?? path.basename(projectRoot)).trim() || path.basename(projectRoot);
  const overwrite = Boolean(args.overwrite ?? false);
  const shouldInstallAddon = args.installAddon !== false;
  const projectFile = path.join(projectRoot, "project.godot");

  if (await pathExists(projectFile) && !overwrite) {
    throw new Error(`project already exists: ${projectFile}`);
  }

  await mkdir(path.join(projectRoot, "scenes"), { recursive: true });
  await mkdir(path.join(projectRoot, "scripts"), { recursive: true });
  await writeFile(projectFile, renderProjectGodot({ name: projectName }), "utf8");

  let addon = null;
  if (shouldInstallAddon) {
    addon = await installAddon({ projectRoot });
  }
  const registryRecord = await rememberGodotProject({
    projectRoot,
    name: projectName,
    source: "created",
    lastCreatedAt: new Date().toISOString()
  });

  return {
    ok: true,
    data: {
      projectRoot,
      name: projectName,
      projectFile,
      scenesPath: path.join(projectRoot, "scenes"),
      scriptsPath: path.join(projectRoot, "scripts"),
      addonInstalled: Boolean(addon),
      pluginPath: addon?.pluginPath ?? null,
      allowedRoots: allowedProjectRoots(),
      registryRecord
    }
  };
}

function renderProjectGodot({ name }) {
  return `; Engine configuration file.
config_version=5

[application]
config/name=${JSON.stringify(name)}
`;
}
