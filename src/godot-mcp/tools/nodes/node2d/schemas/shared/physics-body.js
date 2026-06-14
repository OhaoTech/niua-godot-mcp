export const PHYSICS_BODY_PROPERTIES = {
  collisionLayer: {
    type: "number",
    description: "Physics collision_layer integer."
  },
  collisionMask: {
    type: "number",
    description: "Physics collision_mask integer."
  },
  collisionShapeKind: {
    type: "string",
    description: "Shape resource kind: rectangle, circle, or capsule. Defaults to rectangle."
  },
  collisionShapePath: {
    type: "string",
    description: "Godot Shape2D resource output path under res://, usually ending in .tres."
  },
  collisionName: {
    type: "string",
    description: "Name for the CollisionShape2D child."
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
  collisionSize: {
    description: "RectangleShape2D size as [x,y] or { x, y }."
  },
  collisionRadius: {
    type: "number",
    description: "CircleShape2D or CapsuleShape2D radius."
  },
  collisionHeight: {
    type: "number",
    description: "CapsuleShape2D height."
  },
  openCollisionShape: {
    type: "boolean",
    description: "Open the shape resource in the editor after creation. Defaults to false."
  },
  overwriteCollisionShape: {
    type: "boolean",
    description: "Overwrite an existing shape resource. Defaults to false."
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
  },
  createVisual: {
    type: "boolean",
    description: "Create a visible Sprite2D child after the collision child. Defaults to false."
  },
  visualName: {
    type: "string",
    description: "Name for the optional visible Sprite2D child."
  },
  visualPosition: {
    description: "Optional Sprite2D local position as [x,y] or { x, y }."
  },
  visualRotationDegrees: {
    type: "number",
    description: "Optional Sprite2D local rotation_degrees value."
  },
  visualScale: {
    description: "Optional Sprite2D local scale as [x,y] or { x, y }."
  },
  visualSize: {
    description: "PlaceholderTexture2D size as [x,y] or { x, y }."
  },
  visualTexturePath: {
    type: "string",
    description: "Existing texture resource path assigned to the optional Sprite2D child."
  },
  visualPlaceholderTexturePath: {
    type: "string",
    description: "Generated PlaceholderTexture2D output path for the optional Sprite2D child."
  },
  overwriteVisualTexture: {
    type: "boolean",
    description: "Overwrite the optional visual placeholder texture resource. Defaults to false."
  },
  visualProperties: {
    type: "object",
    description: "Advanced Godot Sprite2D properties merged after curated fields.",
    additionalProperties: true
  }
};
