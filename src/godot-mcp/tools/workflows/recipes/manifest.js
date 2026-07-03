import { APPLY_SCENE_RECIPE_SCHEMA } from "./schemas.js";

export const RECIPE_WORKFLOW_TOOL_MANIFEST = [
  {
    name: "apply_scene_recipe",
    description: "Execute a recipe JSON file of tool steps in one call. Per-step successes stay out of the response; only a compact summary and any failures return.",
    profile: "v1",
    category: "recipe-workflow",
    implementation: "local",
    inputSchema: APPLY_SCENE_RECIPE_SCHEMA,
    local: {
      handler: "applySceneRecipe"
    },
    conformance: {
      happy: "execute every recipe step and return a compact pass summary",
      error: "report failing steps with their errors and honor stopOnError"
    },
    docs: {
      summary: "Executes a JSON recipe of tool steps in one call, returning a compact summary instead of per-step results."
    }
  }
];
