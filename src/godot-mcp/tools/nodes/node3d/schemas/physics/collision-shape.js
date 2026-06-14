import {
  BASE_NODE3D_PROPERTIES,
  nodeNameProperty
} from "../shared.js";

export const CREATE_COLLISION_SHAPE_3D_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE3D_PROPERTIES,
    shapeKind: {
      type: "string",
      description: "Shape resource kind: box, sphere, capsule, or cylinder. Defaults to box."
    },
    shapePath: {
      type: "string",
      description: "Godot Shape3D resource output path under res://, usually ending in .tres."
    },
    ...nodeNameProperty("Optional CollisionShape3D node name."),
    disabled: {
      type: "boolean",
      description: "Whether the CollisionShape3D node starts disabled."
    },
    size: {
      description: "BoxShape3D size as [x,y,z] or { x, y, z }."
    },
    radius: {
      type: "number",
      description: "Sphere, capsule, or cylinder radius."
    },
    height: {
      type: "number",
      description: "Capsule or cylinder height."
    },
    margin: {
      type: "number",
      description: "Optional Shape3D margin."
    },
    open: {
      type: "boolean",
      description: "Open the shape resource in the visible editor after creation. Defaults to false."
    },
    overwrite: {
      type: "boolean",
      description: "Overwrite an existing shape resource. Defaults to false."
    },
    shapeProperties: {
      type: "object",
      description: "Advanced Godot Shape3D properties merged after curated fields.",
      additionalProperties: true
    },
    nodeProperties: {
      type: "object",
      description: "Advanced Godot CollisionShape3D node properties merged after curated fields.",
      additionalProperties: true
    }
  },
  required: ["shapePath"],
  additionalProperties: false
};
