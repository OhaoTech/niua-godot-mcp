import { formatAllowedKinds, normalizeKindKey } from "./shared.js";

export function normalizeCollisionShape3DKind(value) {
  const key = normalizeKindKey(value);
  if (!COLLISION_SHAPE_3D_KINDS.has(key)) {
    throw new Error(`shapeKind must be one of: ${formatAllowedKinds(COLLISION_SHAPE_3D_KINDS)}`);
  }
  return COLLISION_SHAPE_3D_KINDS.get(key);
}

const COLLISION_SHAPE_3D_KINDS = new Map([
  ["box", { kind: "box", className: "BoxShape3D", sizeProperty: "size" }],
  ["sphere", { kind: "sphere", className: "SphereShape3D", radiusProperty: "radius" }],
  ["capsule", {
    kind: "capsule",
    className: "CapsuleShape3D",
    radiusProperty: "radius",
    heightProperty: "height"
  }],
  ["cylinder", {
    kind: "cylinder",
    className: "CylinderShape3D",
    radiusProperty: "radius",
    heightProperty: "height"
  }]
]);
