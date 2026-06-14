import { CONNECTION_PROPERTIES } from "../../../shared/bridge-schema.js";

export const BASE_NODE3D_PROPERTIES = {
  ...CONNECTION_PROPERTIES,
  parentPath: {
    type: "string",
    description: "Path under the edited scene root. Empty string means the scene root."
  },
  position: {
    description: "Optional Node3D position as [x,y,z] or { x, y, z }."
  },
  rotationDegrees: {
    description: "Optional Node3D rotation_degrees as [x,y,z] or { x, y, z }."
  },
  scale: {
    description: "Optional Node3D scale as [x,y,z] or { x, y, z }."
  }
};

export const COLLISION_OBJECT_3D_PROPERTIES = {
  collisionLayer: {
    type: "integer",
    description: "CollisionObject3D collision_layer bitmask."
  },
  collisionMask: {
    type: "integer",
    description: "CollisionObject3D collision_mask bitmask."
  }
};

export const COLLISION_SHAPE_CHILD_PROPERTIES = {
  collisionShapeKind: {
    type: "string",
    description: "Optional child collision shape resource kind: box, sphere, capsule, or cylinder. Defaults to box when collisionShapePath is provided."
  },
  collisionShapePath: {
    type: "string",
    description: "Optional Shape3D resource path to create and attach as a CollisionShape3D child."
  },
  collisionName: {
    type: "string",
    description: "Optional CollisionShape3D child name."
  },
  collisionPosition: {
    description: "Optional child CollisionShape3D position as [x,y,z] or { x, y, z }."
  },
  collisionRotationDegrees: {
    description: "Optional child CollisionShape3D rotation_degrees as [x,y,z] or { x, y, z }."
  },
  collisionScale: {
    description: "Optional child CollisionShape3D scale as [x,y,z] or { x, y, z }."
  },
  collisionDisabled: {
    type: "boolean",
    description: "Whether the CollisionShape3D child starts disabled."
  },
  collisionSize: {
    description: "BoxShape3D child size as [x,y,z] or { x, y, z }."
  },
  collisionRadius: {
    type: "number",
    description: "Sphere, capsule, or cylinder collision radius."
  },
  collisionHeight: {
    type: "number",
    description: "Capsule or cylinder collision height."
  },
  collisionMargin: {
    type: "number",
    description: "Optional collision Shape3D margin."
  },
  openCollisionShape: {
    type: "boolean",
    description: "Open the collision shape resource in the visible editor after creation. Defaults to false."
  },
  overwriteCollisionShape: {
    type: "boolean",
    description: "Overwrite an existing collision shape resource. Defaults to false."
  },
  collisionShapeProperties: {
    type: "object",
    description: "Advanced Godot Shape3D properties merged after curated collision fields.",
    additionalProperties: true
  },
  collisionNodeProperties: {
    type: "object",
    description: "Advanced Godot CollisionShape3D child properties merged after curated collision fields.",
    additionalProperties: true
  }
};

export function nodeNameProperty(description) {
  return {
    name: {
      type: "string",
      description
    }
  };
}

export function advancedNodeProperties(description) {
  return {
    properties: {
      type: "object",
      description,
      additionalProperties: true
    }
  };
}
