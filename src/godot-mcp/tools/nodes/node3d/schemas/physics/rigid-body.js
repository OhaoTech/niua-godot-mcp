import {
  advancedNodeProperties,
  BASE_NODE3D_PROPERTIES,
  COLLISION_SHAPE_CHILD_PROPERTIES,
  nodeNameProperty
} from "../shared.js";

export const CREATE_RIGID_BODY_3D_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE3D_PROPERTIES,
    ...nodeNameProperty("Optional RigidBody3D node name."),
    mass: {
      type: "number",
      description: "RigidBody3D mass."
    },
    gravityScale: {
      type: "number",
      description: "RigidBody3D gravity_scale."
    },
    linearDamp: {
      type: "number",
      description: "RigidBody3D linear_damp."
    },
    angularDamp: {
      type: "number",
      description: "RigidBody3D angular_damp."
    },
    contactMonitor: {
      type: "boolean",
      description: "Whether contact_monitor is enabled."
    },
    maxContactsReported: {
      type: "integer",
      description: "RigidBody3D max_contacts_reported."
    },
    freeze: {
      type: "boolean",
      description: "Whether the body starts frozen."
    },
    lockRotation: {
      type: "boolean",
      description: "Whether lock_rotation is enabled."
    },
    canSleep: {
      type: "boolean",
      description: "Whether can_sleep is enabled."
    },
    sleeping: {
      type: "boolean",
      description: "Whether the body starts sleeping."
    },
    continuousCd: {
      type: "boolean",
      description: "Whether continuous_cd is enabled."
    },
    ...COLLISION_SHAPE_CHILD_PROPERTIES,
    ...advancedNodeProperties("Advanced Godot RigidBody3D node properties merged after curated fields.")
  },
  additionalProperties: false
};
