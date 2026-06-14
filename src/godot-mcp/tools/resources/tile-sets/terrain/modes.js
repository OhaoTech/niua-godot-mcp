import {
  normalizeInteger
} from "../shared.js";

export const TERRAIN_MODES = new Map([
  ["cornersandsides", 0],
  ["corners_and_sides", 0],
  ["corners-and-sides", 0],
  ["corners", 1],
  ["sides", 2]
]);

export function normalizeTerrainMode(value, fieldName) {
  if (typeof value === "string") {
    const key = value.trim().replace(/\s+/g, "").toLowerCase();
    if (TERRAIN_MODES.has(key)) {
      return TERRAIN_MODES.get(key);
    }
    throw new Error(`${fieldName} must be cornersAndSides, corners, or sides`);
  }

  const mode = normalizeInteger(value, fieldName);
  if (mode < 0 || mode > 2) {
    throw new Error(`${fieldName} must be 0, 1, or 2`);
  }
  return mode;
}
