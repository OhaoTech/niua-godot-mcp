import { colorToGodotColor } from "../../../../shared/colors.js";
import {
  normalizeObject
} from "../shared.js";
import { normalizeTerrainMode } from "./modes.js";

export function normalizeTerrainDefinition(value, fieldName) {
  const terrain = normalizeObject(value, fieldName);
  const name = String(terrain.name ?? "").trim();
  if (!name) {
    throw new Error(`${fieldName}.name must not be empty`);
  }

  const request = { name };
  if (terrain.color !== undefined) {
    request.color = colorToGodotColor(terrain.color, `${fieldName}.color`);
  }
  return request;
}

export function normalizeTerrainSet(value, fieldName) {
  const terrainSet = normalizeObject(value, fieldName);
  const rawTerrains = terrainSet.terrains ?? [];
  if (!Array.isArray(rawTerrains) || rawTerrains.length === 0) {
    throw new Error(`${fieldName}.terrains must be a non-empty array`);
  }

  return {
    mode: normalizeTerrainMode(terrainSet.mode ?? "cornersAndSides", `${fieldName}.mode`),
    terrains: rawTerrains.map((terrain, terrainIndex) => normalizeTerrainDefinition(
      terrain,
      `${fieldName}.terrains[${terrainIndex}]`
    ))
  };
}

export function normalizeTerrainSets(value) {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error("terrainSets must be an array");
  }
  return value.map((terrainSet, terrainSetIndex) => normalizeTerrainSet(
    terrainSet,
    `terrainSets[${terrainSetIndex}]`
  ));
}
