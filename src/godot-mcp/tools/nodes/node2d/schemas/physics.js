import {
  ADVANCED_NODE_PROPERTIES,
  BASE_NODE2D_PROPERTIES,
  NODE2D_TRANSFORM_PROPERTIES,
  PHYSICS_BODY_PROPERTIES,
  nodeNameProperty
} from "./shared.js";

export const CREATE_COLLISION_SHAPE_2D_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE2D_PROPERTIES,
    shapeKind: {
      type: "string",
      description: "Shape resource kind: rectangle, circle, or capsule. Defaults to rectangle."
    },
    shapePath: {
      type: "string",
      description: "Godot Shape2D resource output path under res://, usually ending in .tres."
    },
    ...nodeNameProperty("Optional CollisionShape2D node name."),
    disabled: {
      type: "boolean",
      description: "Whether the CollisionShape2D node starts disabled."
    },
    size: {
      description: "RectangleShape2D size as [x,y] or { x, y }. Defaults to [64,64]."
    },
    radius: {
      type: "number",
      description: "CircleShape2D or CapsuleShape2D radius."
    },
    height: {
      type: "number",
      description: "CapsuleShape2D height."
    },
    open: {
      type: "boolean",
      description: "Open the shape resource after creation. Defaults to false."
    },
    overwrite: {
      type: "boolean",
      description: "Overwrite an existing shape resource. Defaults to false."
    },
    shapeProperties: {
      type: "object",
      description: "Advanced Godot Shape2D properties merged after curated fields.",
      additionalProperties: true
    },
    nodeProperties: {
      type: "object",
      description: "Advanced Godot CollisionShape2D properties merged after curated fields.",
      additionalProperties: true
    }
  },
  required: ["shapePath"],
  additionalProperties: false
};

export const CREATE_STATIC_BODY_2D_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE2D_PROPERTIES,
    ...nodeNameProperty("Optional StaticBody2D node name."),
    ...PHYSICS_BODY_PROPERTIES,
    ...ADVANCED_NODE_PROPERTIES
  },
  required: ["collisionShapePath"],
  additionalProperties: false
};

export const CREATE_CHARACTER_BODY_2D_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE2D_PROPERTIES,
    ...nodeNameProperty("Optional CharacterBody2D node name."),
    ...PHYSICS_BODY_PROPERTIES,
    ...ADVANCED_NODE_PROPERTIES
  },
  required: ["collisionShapePath"],
  additionalProperties: false
};

export const CREATE_AREA_2D_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE2D_PROPERTIES,
    ...nodeNameProperty("Optional Area2D node name."),
    monitoring: {
      type: "boolean",
      description: "Whether Area2D monitoring is enabled."
    },
    monitorable: {
      type: "boolean",
      description: "Whether other areas can monitor this Area2D."
    },
    priority: {
      type: "number",
      description: "Area2D priority."
    },
    ...PHYSICS_BODY_PROPERTIES,
    ...ADVANCED_NODE_PROPERTIES
  },
  additionalProperties: false
};
