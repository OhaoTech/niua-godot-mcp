import { CONNECTION_PROPERTIES } from "../../shared/bridge-schema.js";

export { CONNECTION_PROPERTIES };

export const VECTOR2_SCHEMA = {
  description: "[x,y] number array or { x, y } number object."
};

export const VECTOR2I_SCHEMA = {
  description: "[x,y] integer array or { x, y } integer object."
};

export const MATERIAL_ASSIGNMENT_TARGET_SCHEMA = {
  type: "object",
  description: "Optional scene node assignment after creating the material.",
  properties: {
    nodePath: {
      type: "string",
      description: "Scene-tree node path under the edited scene root."
    },
    surfaceIndex: {
      type: "number",
      description: "Optional mesh surface index. When omitted, assigns material_override."
    }
  },
  required: ["nodePath"],
  additionalProperties: false
};
