import { normalizePositiveFiniteNumber } from "../../../shared/numbers.js";
import { vector2ToGodotVector } from "../../../shared/vectors.js";

import {
  normalizeObject,
  normalizePositiveVector2,
  normalizeTexturePath
} from "./shared.js";

export function normalizeFrameRegion(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  const region = normalizeObject(value, fieldName);
  return {
    position: vector2ToGodotVector(region.position ?? [0, 0], `${fieldName}.position`),
    size: normalizePositiveVector2(region.size, `${fieldName}.size`)
  };
}

export function normalizeFrame(rawFrame, fieldName) {
  const frame = normalizeObject(rawFrame, fieldName);
  const request = {
    texturePath: normalizeTexturePath(frame.texturePath),
    duration: normalizePositiveFiniteNumber(frame.duration ?? 1, `${fieldName}.duration`)
  };

  const region = normalizeFrameRegion(frame.region, `${fieldName}.region`);
  if (region !== undefined) {
    request.region = region;
  }
  if (frame.filterClip !== undefined) {
    request.filterClip = Boolean(frame.filterClip);
  }

  return request;
}
