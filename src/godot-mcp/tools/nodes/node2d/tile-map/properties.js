import { normalizePositiveFiniteNumber } from "../../../../shared/numbers.js";

import {
  buildNode2DProperties,
  resourceRef
} from "../builders.js";

function normalizePositiveInteger(value, fieldName) {
  const number = normalizePositiveFiniteNumber(value, fieldName);
  if (!Number.isInteger(number)) {
    throw new Error(`${fieldName} must be an integer`);
  }
  return number;
}

export function buildTileMapLayerProperties(payload, tileSetPath) {
  const extra = {
    tile_set: resourceRef(tileSetPath)
  };
  if (payload.enabled !== undefined) {
    extra.enabled = Boolean(payload.enabled);
  }
  if (payload.renderingQuadrantSize !== undefined) {
    extra.rendering_quadrant_size = normalizePositiveInteger(
      payload.renderingQuadrantSize,
      "renderingQuadrantSize"
    );
  }
  if (payload.collisionEnabled !== undefined) {
    extra.collision_enabled = Boolean(payload.collisionEnabled);
  }
  if (payload.navigationEnabled !== undefined) {
    extra.navigation_enabled = Boolean(payload.navigationEnabled);
  }
  return buildNode2DProperties(payload, { extra });
}
