import {
  advancedNodeProperties,
  BASE_NODE3D_PROPERTIES,
  COLLISION_OBJECT_3D_PROPERTIES,
  COLLISION_SHAPE_CHILD_PROPERTIES,
  nodeNameProperty
} from "../shared.js";

export const CREATE_AREA_3D_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE3D_PROPERTIES,
    ...nodeNameProperty("Optional Area3D node name."),
    monitoring: {
      type: "boolean",
      description: "Whether Area3D monitoring is enabled."
    },
    monitorable: {
      type: "boolean",
      description: "Whether the Area3D is monitorable by other areas."
    },
    priority: {
      type: "number",
      description: "Area3D priority."
    },
    ...COLLISION_OBJECT_3D_PROPERTIES,
    ...COLLISION_SHAPE_CHILD_PROPERTIES,
    ...advancedNodeProperties("Advanced Godot Area3D node properties merged after curated fields.")
  },
  additionalProperties: false
};
