import { toolDefinitionsFromManifest } from "../../../manifest/index.js";
import { createApplySceneRecipe } from "./apply.js";
import { RECIPE_WORKFLOW_TOOL_MANIFEST } from "./manifest.js";

export { createApplySceneRecipe };

// callTool is resolved lazily at call time: the tool catalog imports this module
// while assembling the registry, so a static import would be circular.
const applySceneRecipe = createApplySceneRecipe({
  async callTool(name, args) {
    const { callTool } = await import("../../../server/tool-catalog.js");
    return callTool(name, args);
  }
});

export const RECIPE_WORKFLOW_TOOL_DEFINITIONS = toolDefinitionsFromManifest(RECIPE_WORKFLOW_TOOL_MANIFEST, {
  localHandlers: {
    applySceneRecipe
  }
});
