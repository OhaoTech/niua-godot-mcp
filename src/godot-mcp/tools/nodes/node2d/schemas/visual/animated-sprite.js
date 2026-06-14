import { CREATE_SPRITE_FRAMES_ANIMATIONS_SCHEMA } from "../../../../resources/schemas.js";
import {
  ADVANCED_NODE_PROPERTIES,
  BASE_NODE2D_PROPERTIES,
  nodeNameProperty
} from "../shared.js";

export const CREATE_ANIMATED_SPRITE_2D_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE2D_PROPERTIES,
    ...nodeNameProperty("Optional AnimatedSprite2D node name."),
    spriteFramesPath: {
      type: "string",
      description: "Existing SpriteFrames resource path under res://."
    },
    spriteFramesResourcePath: {
      type: "string",
      description: "Generated SpriteFrames output path when spriteFramesPath is omitted."
    },
    resourceName: {
      type: "string",
      description: "Optional resource_name for generated SpriteFrames."
    },
    animations: CREATE_SPRITE_FRAMES_ANIMATIONS_SCHEMA,
    openSpriteFrames: {
      type: "boolean",
      description: "Open generated SpriteFrames in the visible editor. Defaults to false."
    },
    overwriteSpriteFrames: {
      type: "boolean",
      description: "Overwrite generated SpriteFrames. Defaults to false."
    },
    animation: {
      type: "string",
      description: "Initial AnimatedSprite2D animation name."
    },
    autoplay: {
      type: "string",
      description: "Animation name to autoplay."
    },
    frame: {
      type: "number",
      description: "Initial frame index."
    },
    speedScale: {
      type: "number",
      description: "AnimatedSprite2D speed_scale."
    },
    playing: {
      type: "boolean",
      description: "Whether the animation starts playing."
    },
    centered: {
      type: "boolean",
      description: "Whether the sprite is centered."
    },
    offset: {
      description: "AnimatedSprite2D offset as [x,y] or { x, y }."
    },
    flipH: {
      type: "boolean",
      description: "Whether the sprite is horizontally flipped."
    },
    flipV: {
      type: "boolean",
      description: "Whether the sprite is vertically flipped."
    },
    ...ADVANCED_NODE_PROPERTIES
  },
  additionalProperties: false
};
