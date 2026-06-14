import { formatAllowedKinds, normalizeKindKey } from "./shared.js";

export function normalizeMesh3DKind(value) {
  const key = normalizeKindKey(value);
  if (!MESH_3D_KINDS.has(key)) {
    throw new Error(`meshKind must be one of: ${formatAllowedKinds(MESH_3D_KINDS)}`);
  }
  return MESH_3D_KINDS.get(key);
}

const MESH_3D_KINDS = new Map([
  ["box", { kind: "box", className: "BoxMesh", sizeProperty: "size", sizeDimensions: 3 }],
  ["cube", { kind: "box", className: "BoxMesh", sizeProperty: "size", sizeDimensions: 3 }],
  ["sphere", {
    kind: "sphere",
    className: "SphereMesh",
    radiusProperty: "radius",
    heightProperty: "height",
    radialSegmentsProperty: "radial_segments",
    ringsProperty: "rings"
  }],
  ["capsule", {
    kind: "capsule",
    className: "CapsuleMesh",
    radiusProperty: "radius",
    heightProperty: "height",
    radialSegmentsProperty: "radial_segments",
    ringsProperty: "rings"
  }],
  ["cylinder", {
    kind: "cylinder",
    className: "CylinderMesh",
    topRadiusProperty: "top_radius",
    bottomRadiusProperty: "bottom_radius",
    heightProperty: "height",
    radialSegmentsProperty: "radial_segments",
    ringsProperty: "rings"
  }],
  ["plane", { kind: "plane", className: "PlaneMesh", sizeProperty: "size", sizeDimensions: 2 }],
  ["quad", { kind: "quad", className: "QuadMesh", sizeProperty: "size", sizeDimensions: 2 }],
  ["torus", {
    kind: "torus",
    className: "TorusMesh",
    innerRadiusProperty: "inner_radius",
    outerRadiusProperty: "outer_radius",
    ringsProperty: "rings",
    ringSegmentsProperty: "ring_segments"
  }]
]);
