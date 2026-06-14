import {
  normalizeNonNegativeInteger,
  normalizeObject,
  normalizePositiveVector2i,
  normalizeResPath
} from "../shared.js";
import { tileHasCollisionPolygons } from "./collision.js";
import { normalizeTiles } from "./tiles.js";

export function normalizeTileSource(rawSource, sourceIndex, tileSize) {
  const source = normalizeObject(rawSource, `sources[${sourceIndex}]`);
  const request = {
    texturePath: normalizeResPath(source.texturePath, `sources[${sourceIndex}].texturePath`),
    textureRegionSize: normalizePositiveVector2i(
      source.textureRegionSize ?? tileSize,
      `sources[${sourceIndex}].textureRegionSize`
    ),
    tiles: normalizeTiles(source, sourceIndex)
  };

  if (source.sourceId !== undefined) {
    request.sourceId = normalizeNonNegativeInteger(
      source.sourceId,
      `sources[${sourceIndex}].sourceId`
    );
  }
  if (source.useTexturePadding !== undefined) {
    request.useTexturePadding = Boolean(source.useTexturePadding);
  }

  return request;
}

export function sourceHasCollisionPolygons(source) {
  return source.tiles.some(tileHasCollisionPolygons);
}
