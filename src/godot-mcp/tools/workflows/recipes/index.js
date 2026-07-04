import { toolDefinitionsFromManifest } from "../../../manifest/index.js";
import { createApplySceneRecipe } from "./apply.js";
import { createBatchSceneOperations } from "./batch.js";
import { RECIPE_WORKFLOW_TOOL_MANIFEST } from "./manifest.js";

export { createApplySceneRecipe, createBatchSceneOperations };

// callTool is resolved lazily at call time: the tool catalog imports this module
// while assembling the registry, so a static import would be circular.
async function callCatalogTool(name, args) {
  const { callTool } = await import("../../../server/tool-catalog.js");
  return callTool(name, args);
}

const applySceneRecipe = createApplySceneRecipe({ callTool: callCatalogTool });
const batchSceneOperations = createBatchSceneOperations({ callTool: callCatalogTool });

export const RECIPE_WORKFLOW_TOOL_DEFINITIONS = toolDefinitionsFromManifest(RECIPE_WORKFLOW_TOOL_MANIFEST, {
  localHandlers: {
    applySceneRecipe,
    batchSceneOperations
  }
});
