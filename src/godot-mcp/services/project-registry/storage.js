import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export function projectRegistryPath() {
  return path.resolve(process.env.GODOT_MCP_PROJECT_REGISTRY ?? "runs/.niua-godot-projects.json");
}

export async function readProjectRegistry() {
  const registryPath = projectRegistryPath();
  try {
    const text = await readFile(registryPath, "utf8");
    const parsed = JSON.parse(text);
    return {
      version: 1,
      projects: Array.isArray(parsed.projects) ? parsed.projects : []
    };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {
        version: 1,
        projects: []
      };
    }
    throw error;
  }
}

export async function writeProjectRegistry(registry) {
  const registryPath = projectRegistryPath();
  await mkdir(path.dirname(registryPath), { recursive: true });
  await writeFile(registryPath, `${JSON.stringify({
    version: 1,
    projects: registry.projects
  }, null, 2)}\n`, "utf8");
}
