import { formatAllowedKinds, normalizeKindKey } from "./shared.js";

export function normalizeCharacterBody3DMotionMode(value) {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error("motionMode must be a non-negative integer or known motion mode name");
    }
    return value;
  }

  const key = normalizeKindKey(value);
  if (!CHARACTER_BODY_3D_MOTION_MODES.has(key)) {
    throw new Error(`motionMode must be one of: ${formatAllowedKinds(CHARACTER_BODY_3D_MOTION_MODES)}`);
  }
  return CHARACTER_BODY_3D_MOTION_MODES.get(key);
}

const CHARACTER_BODY_3D_MOTION_MODES = new Map([
  ["grounded", 0],
  ["ground", 0],
  ["floor", 0],
  ["floating", 1],
  ["float", 1],
  ["free", 1]
]);
