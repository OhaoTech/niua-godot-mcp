import {
  ADVANCED_NODE_PROPERTIES,
  BASE_NODE2D_PROPERTIES,
  nodeNameProperty
} from "../shared.js";

export const CREATE_SPRITE_2D_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE2D_PROPERTIES,
    ...nodeNameProperty("Optional Sprite2D node name."),
    texturePath: {
      type: "string",
      description: "Existing texture resource path assigned to Sprite2D.texture."
    },
    createPlaceholderTexture: {
      type: "boolean",
      description: "Create a PlaceholderTexture2D when texturePath is not provided. Defaults to true."
    },
    placeholderTexturePath: {
      type: "string",
      description: "Generated PlaceholderTexture2D output path."
    },
    size: {
      description: "PlaceholderTexture2D size as [x,y] or { x, y }. Defaults to [64,64]."
    },
    openTexture: {
      type: "boolean",
      description: "Open the generated placeholder texture resource. Defaults to false."
    },
    overwriteTexture: {
      type: "boolean",
      description: "Overwrite the generated placeholder texture resource. Defaults to false."
    },
    ...ADVANCED_NODE_PROPERTIES
  },
  additionalProperties: false
};
