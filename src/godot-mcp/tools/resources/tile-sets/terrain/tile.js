import {
  normalizeNonNegativeInteger,
  normalizeObject
} from "../shared.js";
import { normalizeTerrainPeeringBits } from "./peering.js";

export function normalizeTileTerrain(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  const terrain = normalizeObject(value, fieldName);
  return {
    terrainSet: normalizeNonNegativeInteger(terrain.terrainSet ?? 0, `${fieldName}.terrainSet`),
    terrain: normalizeNonNegativeInteger(terrain.terrain ?? 0, `${fieldName}.terrain`),
    peeringBits: normalizeTerrainPeeringBits(terrain.peeringBits, `${fieldName}.peeringBits`)
  };
}
