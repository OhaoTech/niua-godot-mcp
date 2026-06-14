import { splitBridgeArgs } from "../../server/context.js";
import { normalizePhysicsLayers, validateCollisionPolygonLayers } from "./tile-sets/physics.js";
import {
  normalizeTileSetSources,
  sourcesHaveCollisionPolygons
} from "./tile-sets/sources.js";
import { normalizePositiveVector2i, normalizeResPath } from "./tile-sets/shared.js";
import { normalizeTerrainSets, validateTileTerrains } from "./tile-sets/terrain.js";

export {
  normalizeTileSetSources
} from "./tile-sets/sources.js";

export function buildTileSetRequest(payload = {}) {
  const path = normalizeResPath(payload.path, "path");
  const tileSize = normalizePositiveVector2i(payload.tileSize ?? [16, 16], "tileSize");
  const sources = normalizeTileSetSources(payload.sources, tileSize);
  const terrainSets = normalizeTerrainSets(payload.terrainSets);
  const hasCollisionPolygons = sourcesHaveCollisionPolygons(sources);
  const physicsLayers = normalizePhysicsLayers(payload.physicsLayers, {
    required: hasCollisionPolygons
  });
  validateCollisionPolygonLayers(sources, physicsLayers);
  validateTileTerrains(sources, terrainSets);

  const request = {
    path,
    tileSize,
    sources,
    open: Boolean(payload.open ?? true),
    overwrite: Boolean(payload.overwrite ?? false)
  };
  if (physicsLayers.length > 0 || payload.physicsLayers !== undefined) {
    request.physicsLayers = physicsLayers;
  }
  if (terrainSets.length > 0 || payload.terrainSets !== undefined) {
    request.terrainSets = terrainSets;
  }

  const resourceName = String(payload.resourceName ?? "").trim();
  if (resourceName) {
    request.resourceName = resourceName;
  }

  return request;
}

export async function createTileSet(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  return client.createTileSet(buildTileSetRequest(payload));
}
