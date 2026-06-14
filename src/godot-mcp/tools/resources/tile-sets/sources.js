import {
  normalizeTileSource,
  sourceHasCollisionPolygons
} from "./sources/source.js";

export function normalizeTileSetSources(value, tileSize) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("sources must be a non-empty array");
  }

  return value.map((rawSource, sourceIndex) => normalizeTileSource(
    rawSource,
    sourceIndex,
    tileSize
  ));
}

export function sourcesHaveCollisionPolygons(sources) {
  return sources.some(sourceHasCollisionPolygons);
}
