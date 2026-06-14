import { vector2iToGodotVector } from "../../../../shared/vectors.js";
import {
  normalizeObject,
  normalizePositiveInteger,
  normalizePositiveVector2i
} from "../shared.js";

export function normalizeGridTiles(gridValue, fieldName) {
  if (gridValue === undefined) {
    return [];
  }

  const grid = normalizeObject(gridValue, fieldName);
  const columns = normalizePositiveInteger(grid.columns, `${fieldName}.columns`);
  const rows = normalizePositiveInteger(grid.rows, `${fieldName}.rows`);
  const origin = vector2iToGodotVector(grid.origin ?? [0, 0], `${fieldName}.origin`);
  const size = normalizePositiveVector2i(grid.size ?? [1, 1], `${fieldName}.size`);
  const tiles = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      tiles.push({
        atlasCoords: {
          x: origin.x + x,
          y: origin.y + y
        },
        size
      });
    }
  }

  return tiles;
}
