import {
  normalizeInteger,
  normalizeObject,
  normalizeTerrainValue
} from "../shared.js";

export const CELL_NEIGHBORS = new Map([
  ["rightside", 0],
  ["right_side", 0],
  ["rightcorner", 1],
  ["right_corner", 1],
  ["bottomrightside", 2],
  ["bottom_right_side", 2],
  ["bottomrightcorner", 3],
  ["bottom_right_corner", 3],
  ["bottomside", 4],
  ["bottom_side", 4],
  ["bottomcorner", 5],
  ["bottom_corner", 5],
  ["bottomleftside", 6],
  ["bottom_left_side", 6],
  ["bottomleftcorner", 7],
  ["bottom_left_corner", 7],
  ["leftside", 8],
  ["left_side", 8],
  ["leftcorner", 9],
  ["left_corner", 9],
  ["topleftside", 10],
  ["top_left_side", 10],
  ["topleftcorner", 11],
  ["top_left_corner", 11],
  ["topside", 12],
  ["top_side", 12],
  ["topcorner", 13],
  ["top_corner", 13],
  ["toprightside", 14],
  ["top_right_side", 14],
  ["toprightcorner", 15],
  ["top_right_corner", 15]
]);

export function normalizeCellNeighbor(value, fieldName) {
  if (typeof value === "string") {
    const key = value.trim().replace(/[\s-]+/g, "_").toLowerCase();
    if (CELL_NEIGHBORS.has(key)) {
      return CELL_NEIGHBORS.get(key);
    }
    const compactKey = key.replace(/_/g, "");
    if (CELL_NEIGHBORS.has(compactKey)) {
      return CELL_NEIGHBORS.get(compactKey);
    }
    throw new Error(`${fieldName} must be a supported TileSet.CellNeighbor name`);
  }

  const neighbor = normalizeInteger(value, fieldName);
  if (neighbor < 0 || neighbor > 15) {
    throw new Error(`${fieldName} must be between 0 and 15`);
  }
  return neighbor;
}

export function normalizeTerrainPeeringBits(value, fieldName) {
  if (value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((rawBit, bitIndex) => {
      const bit = normalizeObject(rawBit, `${fieldName}[${bitIndex}]`);
      return {
        neighbor: normalizeCellNeighbor(bit.neighbor, `${fieldName}[${bitIndex}].neighbor`),
        terrain: normalizeTerrainValue(bit.terrain, `${fieldName}[${bitIndex}].terrain`)
      };
    });
  }

  const bits = normalizeObject(value, fieldName);
  return Object.entries(bits).map(([neighborName, terrain]) => ({
    neighbor: normalizeCellNeighbor(neighborName, `${fieldName}.${neighborName}`),
    terrain: normalizeTerrainValue(terrain, `${fieldName}.${neighborName}`)
  }));
}
