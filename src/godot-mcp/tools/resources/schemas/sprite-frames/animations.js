import { CREATE_SPRITE_FRAME_REGION_SCHEMA } from "./frames.js";
import { CREATE_SPRITE_SHEET_SCHEMA } from "./sheets.js";

export const CREATE_SPRITE_FRAMES_ANIMATIONS_SCHEMA = {
  type: "array",
  description: "Named SpriteFrames animations with Texture2D frames or sprite-sheet grids.",
  items: {
    type: "object",
    properties: {
      name: { type: "string" },
      speedFps: { type: "number" },
      loop: { type: "boolean" },
      frames: {
        type: "array",
        items: {
          type: "object",
          properties: {
            texturePath: { type: "string" },
            region: CREATE_SPRITE_FRAME_REGION_SCHEMA,
            filterClip: {
              type: "boolean",
              description: "Enable AtlasTexture filter clipping when region is provided."
            },
            duration: { type: "number" }
          },
          required: ["texturePath"],
          additionalProperties: false
        }
      },
      sheet: CREATE_SPRITE_SHEET_SCHEMA
    },
    required: ["name"],
    additionalProperties: false
  }
};
