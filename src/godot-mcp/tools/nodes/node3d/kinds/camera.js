import { formatAllowedKinds, normalizeKindKey } from "./shared.js";

export function normalizeCamera3DProjection(value) {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error("projection must be a non-negative integer or known projection name");
    }
    return value;
  }

  const key = normalizeKindKey(value);
  if (!CAMERA_3D_PROJECTIONS.has(key)) {
    throw new Error(`projection must be one of: ${formatAllowedKinds(CAMERA_3D_PROJECTIONS)}`);
  }
  return CAMERA_3D_PROJECTIONS.get(key);
}

const CAMERA_3D_PROJECTIONS = new Map([
  ["perspective", 0],
  ["orthogonal", 1],
  ["ortho", 1],
  ["frustum", 2]
]);
