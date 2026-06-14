export const TRIGGER_ZONE_COLLISION_PROPERTIES = {
  shapeKind: {
    type: "string",
    description: "Trigger shape kind: rectangle, circle, or capsule. Defaults to rectangle."
  },
  collisionShapePath: {
    type: "string",
    description: "Optional Shape2D resource output path. Defaults under resourceDirectory."
  },
  collisionName: {
    type: "string",
    description: "Name for the CollisionShape2D child. Defaults to <name>Collision."
  },
  collisionPosition: {
    description: "Optional CollisionShape2D local position as [x,y] or { x, y }."
  },
  collisionRotationDegrees: {
    type: "number",
    description: "Optional CollisionShape2D rotation_degrees value."
  },
  collisionScale: {
    description: "Optional CollisionShape2D local scale as [x,y] or { x, y }."
  },
  collisionDisabled: {
    type: "boolean",
    description: "Whether the CollisionShape2D child starts disabled."
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
  overwriteCollisionShape: {
    type: "boolean",
    description: "Overwrite an existing Shape2D resource. Defaults to overwriteResources."
  },
  collisionShapeProperties: {
    type: "object",
    description: "Advanced Godot Shape2D properties merged after curated fields.",
    additionalProperties: true
  },
  collisionNodeProperties: {
    type: "object",
    description: "Advanced Godot CollisionShape2D properties merged after curated fields.",
    additionalProperties: true
  }
};
