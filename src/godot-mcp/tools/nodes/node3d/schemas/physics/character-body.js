import {
  advancedNodeProperties,
  BASE_NODE3D_PROPERTIES,
  COLLISION_OBJECT_3D_PROPERTIES,
  COLLISION_SHAPE_CHILD_PROPERTIES,
  nodeNameProperty
} from "../shared.js";

export const CREATE_CHARACTER_BODY_3D_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE3D_PROPERTIES,
    ...nodeNameProperty("Optional CharacterBody3D node name."),
    velocity: {
      description: "Initial CharacterBody3D velocity as [x,y,z] or { x, y, z }."
    },
    upDirection: {
      description: "CharacterBody3D up_direction as [x,y,z] or { x, y, z }."
    },
    motionMode: {
      description: "CharacterBody3D motion_mode: grounded, floating, or the Godot enum integer."
    },
    wallMinSlideAngle: {
      type: "number",
      description: "CharacterBody3D wall_min_slide_angle."
    },
    floorStopOnSlope: {
      type: "boolean",
      description: "CharacterBody3D floor_stop_on_slope."
    },
    floorConstantSpeed: {
      type: "boolean",
      description: "CharacterBody3D floor_constant_speed."
    },
    floorBlockOnWall: {
      type: "boolean",
      description: "CharacterBody3D floor_block_on_wall."
    },
    floorMaxAngle: {
      type: "number",
      description: "CharacterBody3D floor_max_angle."
    },
    floorSnapLength: {
      type: "number",
      description: "CharacterBody3D floor_snap_length."
    },
    slideOnCeiling: {
      type: "boolean",
      description: "CharacterBody3D slide_on_ceiling."
    },
    ...COLLISION_OBJECT_3D_PROPERTIES,
    ...COLLISION_SHAPE_CHILD_PROPERTIES,
    ...advancedNodeProperties("Advanced Godot CharacterBody3D node properties merged after curated fields.")
  },
  additionalProperties: false
};
