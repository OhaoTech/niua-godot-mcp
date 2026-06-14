import { VECTOR2I_SCHEMA } from "../shared.js";

import { CREATE_TILE_SET_COLLISION_POLYGON_SCHEMA } from "./collision.js";
import { CREATE_TILE_SET_TILE_TERRAIN_SCHEMA } from "./terrain.js";

export const CREATE_TILE_SET_SOURCE_SCHEMA = {
  type: "object",
  properties: {
    sourceId: {
      type: "number",
      description: "Optional TileSet source id. When omitted, Godot assigns the next id."
    },
    texturePath: {
      type: "string",
      description: "Existing Texture2D atlas path under res://."
    },
    textureRegionSize: {
      ...VECTOR2I_SCHEMA,
      description: "Atlas region size for each tile. Defaults to tileSize."
    },
    useTexturePadding: {
      type: "boolean",
      description: "TileSetAtlasSource texture padding toggle."
    },
    tiles: {
      type: "array",
      description: "Explicit atlas tiles to create.",
      items: {
        type: "object",
        properties: {
          atlasCoords: VECTOR2I_SCHEMA,
          size: {
            ...VECTOR2I_SCHEMA,
            description: "Tile size in atlas cells. Defaults to [1,1]."
          },
          collisionPolygons: {
            type: "array",
            description: "Optional TileData collision polygons for this atlas tile.",
            items: CREATE_TILE_SET_COLLISION_POLYGON_SCHEMA
          },
          terrain: {
            ...CREATE_TILE_SET_TILE_TERRAIN_SCHEMA,
            description: "Optional TileData terrain assignment and peering bits."
          }
        },
        required: ["atlasCoords"],
        additionalProperties: false
      }
    },
    grid: {
      type: "object",
      description: "Generate rectangular atlas tile coordinates.",
      properties: {
        columns: { type: "number" },
        rows: { type: "number" },
        origin: VECTOR2I_SCHEMA,
        size: {
          ...VECTOR2I_SCHEMA,
          description: "Generated tile size in atlas cells. Defaults to [1,1]."
        }
      },
      required: ["columns", "rows"],
      additionalProperties: false
    }
  },
  required: ["texturePath"],
  additionalProperties: false
};
