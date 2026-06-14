import { VECTOR2_SCHEMA } from "../shared.js";

export const CREATE_TILE_SET_COLLISION_POLYGON_SCHEMA = {
  type: "object",
  properties: {
    layer: {
      type: "number",
      description: "TileSet physics layer index. Defaults to 0."
    },
    points: {
      type: "array",
      description: "Polygon points in tile-local pixel coordinates. Requires at least 3 points.",
      items: VECTOR2_SCHEMA
    },
    oneWay: {
      type: "boolean",
      description: "Enable one-way collision for this polygon. Defaults to false."
    },
    oneWayMargin: {
      type: "number",
      description: "One-way collision margin. Defaults to 1."
    }
  },
  required: ["points"],
  additionalProperties: false
};
