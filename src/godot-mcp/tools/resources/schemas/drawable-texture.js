import { CONNECTION_PROPERTIES } from "./shared.js";

const RECT_SCHEMA = {
  type: "object",
  properties: {
    x: { type: "integer" },
    y: { type: "integer" },
    width: { type: "integer" },
    height: { type: "integer" }
  },
  additionalProperties: false
};

const BLIT_PROPERTIES = {
  sourcePath: {
    type: "string",
    description: "res:// Texture2D path to blit from."
  },
  rect: RECT_SCHEMA,
  modulate: {
    description: "Optional Color modulate as #RRGGBB, #RRGGBBAA, or { type: 'Color', r, g, b, a }."
  },
  mipmap: {
    type: "integer",
    description: "Mipmap level to blit into. Defaults to 0."
  }
};

export const CREATE_DRAWABLE_TEXTURE_2D_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "DrawableTexture2D output path under res://."
    },
    width: {
      type: "integer",
      description: "Texture width in pixels. Defaults to 256."
    },
    height: {
      type: "integer",
      description: "Texture height in pixels. Defaults to 256."
    },
    format: {
      type: "string",
      enum: ["rgba8", "rgba8_srgb", "rgbah", "rgbaf"],
      description: "DrawableTexture2D format. Defaults to rgba8."
    },
    color: {
      description: "Initial fill color as #RRGGBB, #RRGGBBAA, or { type: 'Color', r, g, b, a }."
    },
    useMipmaps: {
      type: "boolean",
      description: "Whether to allocate mipmaps. Defaults to false."
    },
    blit: {
      type: "object",
      properties: BLIT_PROPERTIES,
      additionalProperties: false,
      description: "Optional first blit after setup()."
    },
    open: {
      type: "boolean",
      description: "Open the resource in the visible editor after creation. Defaults to true."
    },
    overwrite: {
      type: "boolean",
      description: "Overwrite an existing resource file. Defaults to false."
    }
  },
  required: ["path"],
  additionalProperties: false
};

export const BLIT_DRAWABLE_TEXTURE_2D_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Existing DrawableTexture2D path under res://."
    },
    ...BLIT_PROPERTIES,
    open: {
      type: "boolean",
      description: "Open the resource in the visible editor after blit. Defaults to false."
    }
  },
  required: ["path", "sourcePath"],
  additionalProperties: false
};
