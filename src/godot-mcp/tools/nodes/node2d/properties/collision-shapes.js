import { normalizePositiveFiniteNumber } from "../../../../shared/numbers.js";
import { vector2ToGodotVector } from "../../../../shared/vectors.js";
import {
  buildNode2DProperties,
  mergeAdvancedProperties,
  resourceRef
} from "./shared.js";

export function buildCollisionShape2DResourceProperties(payload, shapeKind) {
  const properties = {};
  if (shapeKind.kind === "rectangle") {
    properties.size = vector2ToGodotVector(payload.size ?? [64, 64], "size");
  } else if (shapeKind.kind === "circle") {
    properties.radius = normalizePositiveFiniteNumber(payload.radius ?? 32, "radius");
  } else if (shapeKind.kind === "capsule") {
    properties.radius = normalizePositiveFiniteNumber(payload.radius ?? 16, "radius");
    properties.height = normalizePositiveFiniteNumber(payload.height ?? 64, "height");
  }

  return mergeAdvancedProperties(properties, payload, "shapeProperties");
}

export function buildCollisionShape2DNodeProperties(payload, shapePath) {
  const extra = {
    shape: resourceRef(shapePath)
  };
  if (payload.disabled !== undefined) {
    extra.disabled = Boolean(payload.disabled);
  }
  return buildNode2DProperties(payload, {
    extra,
    advancedField: "nodeProperties"
  });
}
