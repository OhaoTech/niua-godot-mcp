export const CREATE_TILE_SET_TILE_TERRAIN_SCHEMA = {
  type: "object",
  properties: {
    terrainSet: {
      type: "number",
      description: "Terrain set index. Defaults to 0."
    },
    terrain: {
      type: "number",
      description: "Terrain index inside the terrain set. Defaults to 0."
    },
    peeringBits: {
      type: "object",
      description: "Map of TileSet.CellNeighbor names to terrain indexes. Use -1 for no terrain.",
      additionalProperties: {
        type: "number"
      }
    }
  },
  additionalProperties: false
};

export const CREATE_TILE_SET_TERRAIN_SCHEMA = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Terrain name as displayed in the TileSet editor."
    },
    color: {
      description: "Terrain color as hex, [r,g,b,a], or { r, g, b, a }."
    }
  },
  required: ["name"],
  additionalProperties: false
};

export const CREATE_TILE_SET_TERRAIN_SET_SCHEMA = {
  type: "object",
  properties: {
    mode: {
      description: "Terrain matching mode: cornersAndSides, corners, sides, or Godot enum 0-2."
    },
    terrains: {
      type: "array",
      description: "Terrain definitions for this terrain set.",
      items: CREATE_TILE_SET_TERRAIN_SCHEMA
    }
  },
  required: ["terrains"],
  additionalProperties: false
};
