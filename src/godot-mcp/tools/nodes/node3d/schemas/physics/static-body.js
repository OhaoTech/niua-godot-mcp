import {
  advancedNodeProperties,
  BASE_NODE3D_PROPERTIES,
  COLLISION_OBJECT_3D_PROPERTIES,
  COLLISION_SHAPE_CHILD_PROPERTIES,
  nodeNameProperty
} from "../shared.js";

export const CREATE_STATIC_BODY_3D_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE3D_PROPERTIES,
    ...nodeNameProperty("Optional StaticBody3D node name."),
    ...COLLISION_OBJECT_3D_PROPERTIES,
    constantLinearVelocity: {
      description: "StaticBody3D constant_linear_velocity as [x,y,z] or { x, y, z }."
    },
    constantAngularVelocity: {
      description: "StaticBody3D constant_angular_velocity as [x,y,z] or { x, y, z }."
    },
    ...COLLISION_SHAPE_CHILD_PROPERTIES,
    ...advancedNodeProperties("Advanced Godot StaticBody3D node properties merged after curated fields.")
  },
  additionalProperties: false
};
