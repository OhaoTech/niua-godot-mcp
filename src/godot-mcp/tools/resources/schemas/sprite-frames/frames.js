import { VECTOR2_SCHEMA } from "../shared.js";

export const CREATE_SPRITE_FRAME_REGION_SCHEMA = {
  type: "object",
  properties: {
    position: {
      ...VECTOR2_SCHEMA,
      description: "Top-left atlas region position in pixels. Defaults to [0,0]."
    },
    size: {
      ...VECTOR2_SCHEMA,
      description: "Atlas region size in pixels."
    }
  },
  required: ["size"],
  additionalProperties: false
};
