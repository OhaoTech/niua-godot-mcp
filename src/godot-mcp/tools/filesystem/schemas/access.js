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
