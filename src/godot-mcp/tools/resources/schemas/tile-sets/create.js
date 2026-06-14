import {
  CONNECTION_PROPERTIES,
  VECTOR2I_SCHEMA
} from "../shared.js";

import { CREATE_TILE_SET_PHYSICS_LAYER_SCHEMA } from "./physics.js";
import { CREATE_TILE_SET_SOURCE_SCHEMA } from "./sources.js";
import { CREATE_TILE_SET_TERRAIN_SET_SCHEMA } from "./terrain.js";

export const CREATE_TILE_SET_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "TileSet resource output path under res://, usually ending in .tres."
    },
    resourceName: {
      type: "string",
      description: "Optional Godot resource_name for the TileSet asset."
    },
    tileSize: {
      ...VECTOR2I_SCHEMA,
      description: "TileSet tile size. Defaults to [16,16]."
    },
    sources: {
      type: "array",
      description: "TileSetAtlasSource entries backed by existing Texture2D atlases.",
      items: CREATE_TILE_SET_SOURCE_SCHEMA
    },
    physicsLayers: {
      type: "array",
      description: "Optional TileSet physics layers. A default layer is created when collision polygons are provided without this field.",
      items: CREATE_TILE_SET_PHYSICS_LAYER_SCHEMA
    },
    terrainSets: {
      type: "array",
      description: "Optional TileSet terrain sets used by per-tile terrain metadata.",
      items: CREATE_TILE_SET_TERRAIN_SET_SCHEMA
    },
    open: {
      type: "boolean",
      description: "Open the TileSet resource in the visible editor after creation. Defaults to true."
    },
    overwrite: {
      type: "boolean",
      description: "Overwrite an existing TileSet resource. Defaults to false."
    }
  },
  required: ["path", "sources"],
  additionalProperties: false
};
