import { normalizeFiniteNumber } from "../../../../shared/numbers.js";
import { vector3ToGodotVector } from "../../../../shared/vectors.js";
import {
  applyNode3DTransformProperties,
  applyOptionalNumberProperty,
  mergeCustomProperties
} from "./shared.js";

export function buildCollisionShape3DResourceProperties(payload, shapeKind) {
  const properties = {};

  if (shapeKind.sizeProperty && payload.size !== undefined) {
    properties[shapeKind.sizeProperty] = vector3ToGodotVector(payload.size, "size");
  }
  if (shapeKind.radiusProperty && payload.radius !== undefined) {
    properties[shapeKind.radiusProperty] = normalizeFiniteNumber(payload.radius, "radius");
  }
  if (shapeKind.heightProperty && payload.height !== undefined) {
    properties[shapeKind.heightProperty] = normalizeFiniteNumber(payload.height, "height");
  }
  applyOptionalNumberProperty(properties, "margin", payload.margin);
  mergeCustomProperties(properties, payload.shapeProperties, "shapeProperties");

  return properties;
}

export function buildCollisionShape3DNodeProperties(payload, shapePath) {
  const properties = {
    shape: {
      type: "Resource",
      path: shapePath
    }
  };

  applyNode3DTransformProperties(properties, payload);
  if (payload.disabled !== undefined) {
    properties.disabled = Boolean(payload.disabled);
  }
  mergeCustomProperties(properties, payload.nodeProperties, "nodeProperties");

  return properties;
}
