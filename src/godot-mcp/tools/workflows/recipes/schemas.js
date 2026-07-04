import { CONNECTION_PROPERTIES } from "../../shared/bridge-schema.js";

export const BATCH_SCENE_OPERATIONS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    steps: {
      type: "array",
      description: "Tool steps to execute in order, max 50. Use apply_scene_recipe with a recipe file for bigger batches.",
      items: {
        type: "object",
        properties: {
          tool: {
            type: "string",
            description: "Tool name to call, for example create_node or set_node_property."
          },
          args: {
            type: "object",
            additionalProperties: true,
            description: "Arguments for the tool. Connection args (host, port, expectedProjectRoot) are injected from the top level."
          },
          label: {
            type: "string",
            description: "Optional label echoed in failure reports to make failing steps easy to find."
          }
        },
        required: ["tool"],
        additionalProperties: false
      }
    },
    stopOnError: {
      type: "boolean",
      description: "Stop at the first failing step. Defaults to true."
    }
  },
  required: ["steps"],
  additionalProperties: false
};

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
