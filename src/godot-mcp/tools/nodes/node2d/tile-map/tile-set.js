import { buildTileSetRequest } from "../../../resources/tile-sets.js";
import {
  slugifyResourceName,
  trimOptionalString
} from "../builders.js";

export function normalizeResPath(value, fieldName) {
  const path = trimOptionalString(value);
  if (!path.startsWith("res://")) {
    throw new Error(`${fieldName} must start with res://`);
  }
  return path;
}

export function defaultTileSetPath(name) {
  return `res://niua/generated/tile_sets/${slugifyResourceName(name)}_tile_set.tres`;
}

export function buildGeneratedTileSetRequest(payload, path) {
  return buildTileSetRequest({
    ...payload,
    path,
    open: Boolean(payload.openTileSet ?? false),
    overwrite: Boolean(payload.overwriteTileSet ?? false)
  });
}
