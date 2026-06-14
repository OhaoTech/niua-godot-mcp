import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import { getGodotVersion } from "../../services/godot-runtime.js";
import { RUNTIME_TOOL_MANIFEST } from "./manifest.js";

export { getGodotVersion };

export async function getGodotVersionTool() {
  return {
    ok: true,
    godotVersion: await getGodotVersion()
  };
}

export const RUNTIME_TOOL_DEFINITIONS = toolDefinitionsFromManifest(RUNTIME_TOOL_MANIFEST, {
  localHandlers: {
    getGodotVersionTool
  }
});
