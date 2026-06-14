import { installAddon } from "../../../../../scripts/install-niua-godot-addon.js";
import {
  assertAllowedProjectRoot,
  projectMetadata,
  projectRegistryPath,
  readProjectRegistry,
  rememberGodotProject,
  writeProjectRegistry
} from "../../../services/project-registry.js";
import { diagnoseGodotProjectSetup } from "../diagnostics.js";

export async function importGodotProject(args = {}) {
  const requestedProjectRoot = String(args.projectRoot ?? "").trim();
  if (!requestedProjectRoot) {
    throw new Error("projectRoot is required");
  }

  const projectRoot = assertAllowedProjectRoot(requestedProjectRoot);
  const metadata = await projectMetadata(projectRoot);
  let addon = null;
  if (args.installAddon === true) {
    addon = await installAddon({ projectRoot });
  }

  const record = await rememberGodotProject({
    projectRoot,
    name: metadata.name,
    source: "imported"
  });

  return {
    ok: true,
    data: {
      ...record,
      addonInstalled: Boolean(addon),
      pluginPath: addon?.pluginPath ?? null
    }
  };
}

export async function installProjectAddon(args = {}) {
  const requestedProjectRoot = String(args.projectRoot ?? "").trim();
  if (!requestedProjectRoot) {
    throw new Error("projectRoot is required");
  }

  const projectRoot = assertAllowedProjectRoot(requestedProjectRoot);
  const addon = await installAddon({ projectRoot });
  const setup = await diagnoseGodotProjectSetup({ projectRoot });

  return {
    ok: true,
    data: {
      projectRoot,
      addonInstalled: true,
      addonPath: addon.addonPath,
      pluginPath: addon.pluginPath,
      setup: setup.data
    }
  };
}

export async function listKnownGodotProjects() {
  const registry = await readProjectRegistry();
  return {
    ok: true,
    data: {
      registryPath: projectRegistryPath(),
      projects: registry.projects
        .slice()
        .sort((left, right) => right.lastSeenAt.localeCompare(left.lastSeenAt))
    }
  };
}

export async function forgetGodotProject(args = {}) {
  const requestedProjectRoot = String(args.projectRoot ?? "").trim();
  if (!requestedProjectRoot) {
    throw new Error("projectRoot is required");
  }

  const projectRoot = assertAllowedProjectRoot(requestedProjectRoot);
  const registry = await readProjectRegistry();
  const beforeCount = registry.projects.length;
  registry.projects = registry.projects.filter((project) => project.projectRoot !== projectRoot);
  await writeProjectRegistry(registry);

  return {
    ok: true,
    data: {
      projectRoot,
      removed: registry.projects.length !== beforeCount,
      projects: registry.projects
    }
  };
}
