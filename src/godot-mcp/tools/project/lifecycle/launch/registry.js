import { rememberGodotProject } from "../../../../services/project-registry.js";

export async function rememberOpenedGodotProject(projectRoot) {
  return rememberGodotProject({
    projectRoot,
    source: "opened",
    lastOpenedAt: new Date().toISOString()
  });
}
