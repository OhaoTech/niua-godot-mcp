import { CONNECTION_PROPERTIES } from "../../shared/bridge-schema.js";

export const FILESYSTEM_LIST_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Godot project path to list. Defaults to res://."
    },
    recursive: {
      type: "boolean",
      description: "Whether to include nested descendants. Defaults to false."
    },
    maxDepth: {
      type: "number",
      description: "Maximum directory depth for recursive listings. 0 or omitted means unlimited."
    },
    exclude: {
      type: "array",
      description: "Path substrings to exclude, such as [\"addons\", \".godot\"].",
      items: {
        type: "string"
      }
    }
  },
  additionalProperties: false
};

export const FILESYSTEM_PATH_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Godot project path under res://."
    }
  },
  required: ["path"],
  additionalProperties: false
};
