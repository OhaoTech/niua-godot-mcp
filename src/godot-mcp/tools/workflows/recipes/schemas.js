import { CONNECTION_PROPERTIES } from "../../shared/bridge-schema.js";

export const APPLY_SCENE_RECIPE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    recipePath: {
      type: "string",
      description: "Path to a recipe JSON file on disk: absolute, or res:// relative to expectedProjectRoot. Shape: { name?, steps: [{ tool, args?, label? }] }."
    },
    stopOnError: {
      type: "boolean",
      description: "Stop at the first failing step. Defaults to true."
    },
    maxSteps: {
      type: "number",
      description: "Safety cap on executed steps. Defaults to 500."
    }
  },
  required: ["recipePath"],
  additionalProperties: false
};
