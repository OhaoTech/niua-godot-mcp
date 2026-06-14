import { vector2iToGodotVector } from "../../../../shared/vectors.js";
import {
  normalizeObject,
  normalizePositiveVector2i
} from "../shared.js";
import { normalizeTileTerrain } from "../terrain.js";
import { normalizeCollisionPolygons } from "./collision.js";
import { normalizeGridTiles } from "./grid.js";

export function normalizeTileEntry(value, fieldName) {
  const tile = normalizeObject(value, fieldName);
  const request = {
    atlasCoords: vector2iToGodotVector(tile.atlasCoords, `${fieldName}.atlasCoords`),
    size: normalizePositiveVector2i(tile.size ?? [1, 1], `${fieldName}.size`)
  };
  const collisionPolygons = normalizeCollisionPolygons(
    tile.collisionPolygons,
    `${fieldName}.collisionPolygons`
  );
  if (collisionPolygons !== undefined) {
    request.collisionPolygons = collisionPolygons;
  }
  const terrain = normalizeTileTerrain(tile.terrain, `${fieldName}.terrain`);
  if (terrain !== undefined) {
    request.terrain = terrain;
  }
  return request;
}

function appendTile(tiles, seen, tile) {
  const key = `${tile.atlasCoords.x},${tile.atlasCoords.y}`;
  if (seen.has(key)) {
    return;
  }
  seen.add(key);
  tiles.push(tile);
}

export function normalizeTiles(source, sourceIndex) {
  const tiles = [];
  const seen = new Set();
  const rawTiles = source.tiles ?? [];

  if (!Array.isArray(rawTiles)) {
    throw new Error(`sources[${sourceIndex}].tiles must be an array`);
  }

  rawTiles.forEach((rawTile, tileIndex) => {
    appendTile(
      tiles,
      seen,
      normalizeTileEntry(rawTile, `sources[${sourceIndex}].tiles[${tileIndex}]`)
    );
  });
  for (const gridTile of normalizeGridTiles(source.grid, `sources[${sourceIndex}].grid`)) {
    appendTile(tiles, seen, gridTile);
  }

  if (tiles.length === 0) {
    throw new Error(`sources[${sourceIndex}] must define tiles or grid`);
  }
  return tiles;
}
