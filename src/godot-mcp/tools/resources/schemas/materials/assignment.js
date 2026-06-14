import { CONNECTION_PROPERTIES } from "../shared.js";

export const ASSIGN_MATERIAL_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Scene-tree node path under the edited scene root."
    },
    materialPath: {
      type: "string",
      description: "Godot material resource path under res://."
    },
    surfaceIndex: {
      type: "number",
      description: "Optional mesh surface index. When omitted, assigns material_override."
    }
  },
  required: ["nodePath", "materialPath"],
  additionalProperties: false
};
