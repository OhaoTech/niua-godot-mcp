import { splitBridgeArgs } from "../../../../server/context.js";
import { normalizeNonNegativeInteger } from "../../../../shared/numbers.js";
import { vector2iToGodotVector } from "../../../../shared/vectors.js";

import { trimOptionalString } from "../builders.js";

function normalizeTerrainPaintMode(value) {
  const mode = String(value ?? "connect").trim().toLowerCase();
  if (mode !== "connect" && mode !== "path") {
    throw new Error("mode must be connect or path");
  }
  return mode;
}

function normalizeTerrainCoords(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("coords must be a non-empty array");
  }

  return value.map((coords, index) => vector2iToGodotVector(coords, `coords[${index}]`));
}

export function buildTileMapLayerTerrainPaintRequest(payload = {}) {
  const nodePath = trimOptionalString(payload.nodePath);
  if (!nodePath) {
    throw new Error("nodePath is required");
  }

  return {
    nodePath,
    mode: normalizeTerrainPaintMode(payload.mode),
    terrainSet: normalizeNonNegativeInteger(payload.terrainSet, "terrainSet"),
    terrain: normalizeNonNegativeInteger(payload.terrain, "terrain"),
    coords: normalizeTerrainCoords(payload.coords),
    ignoreEmptyTerrains: Boolean(payload.ignoreEmptyTerrains ?? true)
  };
}

export async function paintTileMapLayerTerrain(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  return client.paintTileMapLayerTerrain(buildTileMapLayerTerrainPaintRequest(payload));
}
