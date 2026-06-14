import { normalizeFiniteNumber } from "../../../../shared/numbers.js";
import { isPlainObject } from "../../../../shared/normalize.js";
import { vector3ToGodotVector } from "../../../../shared/vectors.js";

export function applyNode3DTransformProperties(properties, payload) {
  if (payload.position !== undefined) {
    properties.position = vector3ToGodotVector(payload.position, "position");
  }
  if (payload.rotationDegrees !== undefined) {
    properties.rotation_degrees = vector3ToGodotVector(payload.rotationDegrees, "rotationDegrees");
  }
  if (payload.scale !== undefined) {
    properties.scale = vector3ToGodotVector(payload.scale, "scale");
  }
}

export function applyOptionalNumberProperty(properties, propertyName, value, fieldName = propertyName) {
  if (value !== undefined) {
    properties[propertyName] = normalizeFiniteNumber(value, fieldName);
  }
}

export function mergeCustomProperties(properties, value, fieldName) {
  if (value === undefined) {
    return;
  }
  if (!isPlainObject(value)) {
    throw new Error(`${fieldName} must be an object`);
  }
  Object.assign(properties, value);
}
