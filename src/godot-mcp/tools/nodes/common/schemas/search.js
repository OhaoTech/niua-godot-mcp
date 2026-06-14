import { CONNECTION_PROPERTIES } from "../../../shared/bridge-schema.js";

export const SEARCH_NODE_TYPES_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    query: {
      type: "string",
      description: "Case-insensitive node class name search text."
    },
    baseType: {
      type: "string",
      description: "Godot base class all returned classes must inherit from. Defaults to Node."
    },
    includeAbstract: {
      type: "boolean",
      description: "Include abstract or uninstantiable classes. Defaults to false."
    },
    includeDisabled: {
      type: "boolean",
      description: "Include ClassDB classes disabled in this Godot build. Defaults to false."
    },
    limit: {
      type: "integer",
      description: "Maximum number of matches to return. Clamped to 1..500. Defaults to 50."
    }
  },
  additionalProperties: false
};
