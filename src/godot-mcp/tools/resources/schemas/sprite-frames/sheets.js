import { VECTOR2_SCHEMA } from "../shared.js";

export const CREATE_SPRITE_SHEET_SCHEMA = {
  type: "object",
  properties: {
    texturePath: {
      type: "string",
      description: "Existing sprite-sheet Texture2D path under res://."
    },
    frameSize: {
      ...VECTOR2_SCHEMA,
      description: "Frame size in pixels."
    },
    columns: {
      type: "number",
      description: "Number of columns in the generated frame grid. When omitted, Godot infers it from texture width."
    },
    rows: {
      type: "number",
      description: "Number of rows in the generated frame grid. When omitted, Godot infers it from texture height."
    },
    origin: {
      ...VECTOR2_SCHEMA,
      description: "Top-left origin for the generated frame grid. Defaults to [0,0]."
    },
    separation: {
      ...VECTOR2_SCHEMA,
      description: "Pixel gap between generated frames. Defaults to [0,0]."
    },
    frameCount: {
      type: "number",
      description: "Optional generated frame count. Defaults to columns * rows."
    },
    duration: {
      type: "number",
      description: "Duration assigned to each generated frame. Defaults to 1."
    },
    filterClip: {
      type: "boolean",
      description: "Enable AtlasTexture filter clipping for generated frames."
    }
  },
  required: ["texturePath", "frameSize"],
  additionalProperties: false
};
