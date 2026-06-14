import { normalizeFiniteNumber, normalizeNonNegativeInteger } from "../../../../shared/numbers.js";
import { vector2ToGodotVector, vector3ToGodotVector } from "../../../../shared/vectors.js";
import {
  applyNode3DTransformProperties,
  mergeCustomProperties
} from "./shared.js";

export function buildMesh3DResourceProperties(payload, meshKind) {
  const properties = {};

  if (meshKind.sizeProperty && payload.size !== undefined) {
    properties[meshKind.sizeProperty] = meshKind.sizeDimensions === 2
      ? vector2ToGodotVector(payload.size, "size")
      : vector3ToGodotVector(payload.size, "size");
  }
  if (meshKind.radiusProperty && payload.radius !== undefined) {
    properties[meshKind.radiusProperty] = normalizeFiniteNumber(payload.radius, "radius");
  }
  if (meshKind.heightProperty && payload.height !== undefined) {
    properties[meshKind.heightProperty] = normalizeFiniteNumber(payload.height, "height");
  }
  if (meshKind.topRadiusProperty && payload.radius !== undefined && payload.topRadius === undefined) {
    properties[meshKind.topRadiusProperty] = normalizeFiniteNumber(payload.radius, "radius");
  }
  if (meshKind.bottomRadiusProperty && payload.radius !== undefined && payload.bottomRadius === undefined) {
    properties[meshKind.bottomRadiusProperty] = normalizeFiniteNumber(payload.radius, "radius");
  }
  if (meshKind.topRadiusProperty && payload.topRadius !== undefined) {
    properties[meshKind.topRadiusProperty] = normalizeFiniteNumber(payload.topRadius, "topRadius");
  }
  if (meshKind.bottomRadiusProperty && payload.bottomRadius !== undefined) {
    properties[meshKind.bottomRadiusProperty] = normalizeFiniteNumber(payload.bottomRadius, "bottomRadius");
  }
  if (meshKind.innerRadiusProperty && payload.innerRadius !== undefined) {
    properties[meshKind.innerRadiusProperty] = normalizeFiniteNumber(payload.innerRadius, "innerRadius");
  }
  if (meshKind.outerRadiusProperty && payload.outerRadius !== undefined) {
    properties[meshKind.outerRadiusProperty] = normalizeFiniteNumber(payload.outerRadius, "outerRadius");
  }
  if (meshKind.radialSegmentsProperty && payload.radialSegments !== undefined) {
    properties[meshKind.radialSegmentsProperty] = normalizeNonNegativeInteger(
      payload.radialSegments,
      "radialSegments"
    );
  }
  if (meshKind.ringsProperty && payload.rings !== undefined) {
    properties[meshKind.ringsProperty] = normalizeNonNegativeInteger(payload.rings, "rings");
  }
  if (meshKind.ringSegmentsProperty && payload.ringSegments !== undefined) {
    properties[meshKind.ringSegmentsProperty] = normalizeNonNegativeInteger(
      payload.ringSegments,
      "ringSegments"
    );
  }
  mergeCustomProperties(properties, payload.meshProperties, "meshProperties");

  return properties;
}

export function buildMeshInstance3DNodeProperties(payload, meshPath) {
  const properties = {
    mesh: {
      type: "Resource",
      path: meshPath
    }
  };

  applyNode3DTransformProperties(properties, payload);

  const materialPath = String(payload.materialPath ?? "").trim();
  if (materialPath) {
    properties.material_override = {
      type: "Resource",
      path: materialPath
    };
  }
  mergeCustomProperties(properties, payload.nodeProperties, "nodeProperties");

  return properties;
}
