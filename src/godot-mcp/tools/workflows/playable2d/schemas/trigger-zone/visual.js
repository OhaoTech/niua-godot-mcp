export const TRIGGER_ZONE_VISUAL_PROPERTIES = {
  createVisual: {
    type: "boolean",
    description: "Create a visible Sprite2D helper child. Defaults to false."
  },
  visualName: {
    type: "string",
    description: "Name for the optional visible Sprite2D child. Defaults to <name>Visual."
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
    description: "PlaceholderTexture2D size as [x,y] or { x, y }. Defaults to size."
  },
  visualTexturePath: {
    type: "string",
    description: "Existing texture resource path assigned to the optional Sprite2D child."
  },
  visualPlaceholderTexturePath: {
    type: "string",
    description: "Optional generated PlaceholderTexture2D output path. Defaults under resourceDirectory."
  },
  overwriteVisualTexture: {
    type: "boolean",
    description: "Overwrite the optional visual placeholder texture resource. Defaults to overwriteResources."
  },
  visualProperties: {
    type: "object",
    description: "Advanced Godot Sprite2D properties merged after curated fields.",
    additionalProperties: true
  }
};
