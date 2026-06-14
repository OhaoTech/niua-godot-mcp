export const TILE_MAP_CELLS_SCHEMA = {
  type: "array",
  description: "TileMapLayer cell set/erase operations.",
  items: {
    type: "object",
    properties: {
      coords: {
        description: "TileMapLayer map coordinates as [x,y] or { x, y } integers."
      },
      sourceId: {
        type: "number",
        description: "TileSet source id. Defaults to 0."
      },
      atlasCoords: {
        description: "Atlas coordinates as [x,y] or { x, y } integers. Defaults to [0,0]."
      },
      alternativeTile: {
        type: "number",
        description: "Alternative tile id. Defaults to 0."
      },
      erase: {
        type: "boolean",
        description: "Erase this map coordinate instead of setting a tile."
      }
    },
    required: ["coords"],
    additionalProperties: false
  }
};
