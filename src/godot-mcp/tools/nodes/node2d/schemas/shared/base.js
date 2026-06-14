import { CONNECTION_PROPERTIES } from "../../../../shared/bridge-schema.js";

export const BASE_NODE2D_PROPERTIES = {
  ...CONNECTION_PROPERTIES,
  parentPath: {
    type: "string",
    description: "Path under the edited scene root. Empty string means the scene root."
  },
  position: {
    description: "Optional Node2D position as [x,y] or { x, y }."
  },
  rotationDegrees: {
    type: "number",
    description: "Optional Node2D rotation_degrees value."
  },
  scale: {
    description: "Optional Node2D scale as [x,y] or { x, y }."
  }
};

export const NODE2D_TRANSFORM_PROPERTIES = {
  position: BASE_NODE2D_PROPERTIES.position,
  rotationDegrees: BASE_NODE2D_PROPERTIES.rotationDegrees,
  scale: BASE_NODE2D_PROPERTIES.scale
};

export function nodeNameProperty(description) {
  return {
    name: {
      type: "string",
      description
    }
  };
}

export const ADVANCED_NODE_PROPERTIES = {
  properties: {
    type: "object",
    description: "Advanced Godot node properties merged after curated fields.",
    additionalProperties: true
  }
};
