import { CONNECTION_PROPERTIES } from "../../../shared/bridge-schema.js";
import { CREATE_TILE_SET_SCHEMA } from "../../../resources/schemas.js";
import {
  ADVANCED_NODE_PROPERTIES,
  BASE_NODE2D_PROPERTIES,
  TILE_MAP_CELLS_SCHEMA
} from "./shared.js";

const TILE_SET_CREATION_PROPERTIES = {
  tileSetPath: {
    type: "string",
    description: "Existing TileSet resource path under res://."
  },
  tileSetResourcePath: {
    type: "string",
    description: "Generated TileSet output path when tileSetPath is omitted."
  },
  resourceName: CREATE_TILE_SET_SCHEMA.properties.resourceName,
  tileSize: CREATE_TILE_SET_SCHEMA.properties.tileSize,
  sources: CREATE_TILE_SET_SCHEMA.properties.sources,
  openTileSet: {
    type: "boolean",
    description: "Open generated TileSet in the visible editor. Defaults to false."
  },
  overwriteTileSet: {
    type: "boolean",
    description: "Overwrite generated TileSet. Defaults to false."
  }
};

export const CREATE_TILE_MAP_LAYER_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE2D_PROPERTIES,
    name: {
      type: "string",
      description: "Optional TileMapLayer node name."
    },
    ...TILE_SET_CREATION_PROPERTIES,
    enabled: {
      type: "boolean",
      description: "TileMapLayer enabled state."
    },
    renderingQuadrantSize: {
      type: "number",
      description: "TileMapLayer rendering_quadrant_size."
    },
    collisionEnabled: {
      type: "boolean",
      description: "TileMapLayer collision_enabled state."
    },
    navigationEnabled: {
      type: "boolean",
      description: "TileMapLayer navigation_enabled state."
    },
    cells: TILE_MAP_CELLS_SCHEMA,
    clearCells: {
      type: "boolean",
      description: "Clear existing used cells before applying cells. Defaults to false."
    },
    ...ADVANCED_NODE_PROPERTIES
  },
  additionalProperties: false
};

export const SET_TILE_MAP_LAYER_CELLS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Existing TileMapLayer node path under the edited scene root."
    },
    clear: {
      type: "boolean",
      description: "Clear existing used cells before applying cells. Defaults to false."
    },
    cells: TILE_MAP_CELLS_SCHEMA
  },
  required: ["nodePath"],
  additionalProperties: false
};

export const PAINT_TILE_MAP_LAYER_TERRAIN_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Existing TileMapLayer node path under the edited scene root."
    },
    mode: {
      type: "string",
      enum: ["connect", "path"],
      description: "Terrain painting mode. connect updates connected terrain regions; path connects successive coordinates. Defaults to connect."
    },
    terrainSet: {
      type: "number",
      description: "TileSet terrain set index."
    },
    terrain: {
      type: "number",
      description: "Terrain index within the terrain set."
    },
    coords: {
      type: "array",
      minItems: 1,
      description: "TileMapLayer map coordinates as [x,y] or { x, y } integers.",
      items: {
        description: "A map coordinate as [x,y] or { x, y }."
      }
    },
    ignoreEmptyTerrains: {
      type: "boolean",
      description: "Forwarded to Godot's terrain solver. Defaults to true."
    }
  },
  required: ["nodePath", "terrainSet", "terrain", "coords"],
  additionalProperties: false
};
