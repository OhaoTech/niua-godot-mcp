import { CONNECTION_PROPERTIES } from "../shared.js";
import { CREATE_SPRITE_FRAMES_ANIMATIONS_SCHEMA } from "./animations.js";

export const CREATE_SPRITE_FRAMES_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "SpriteFrames resource output path under res://, usually ending in .tres."
    },
    resourceName: {
      type: "string",
      description: "Optional Godot resource_name for the SpriteFrames asset."
    },
    animations: CREATE_SPRITE_FRAMES_ANIMATIONS_SCHEMA,
    open: {
      type: "boolean",
      description: "Open the SpriteFrames resource in the visible editor after creation. Defaults to true."
    },
    overwrite: {
      type: "boolean",
      description: "Overwrite an existing SpriteFrames resource. Defaults to false."
    }
  },
  required: ["path", "animations"],
  additionalProperties: false
};
