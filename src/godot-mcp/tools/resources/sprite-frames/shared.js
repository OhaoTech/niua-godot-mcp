import { isPlainObject } from "../../../shared/normalize.js";
import { vector2ToGodotVector } from "../../../shared/vectors.js";

export function normalizeAnimationName(value) {
  const name = String(value ?? "").trim();
  if (!name) {
    throw new Error("animation name must not be empty");
  }
  return name;
}

export function normalizeTexturePath(value) {
  const texturePath = String(value ?? "").trim();
  if (!texturePath.startsWith("res://")) {
    throw new Error("frame texturePath must start with res://");
  }
  return texturePath;
}

export function normalizeInteger(value, fieldName) {
  const number = Number(value);
  if (!Number.isInteger(number)) {
    throw new Error(`${fieldName} must be an integer`);
  }
  return number;
}

export function normalizePositiveInteger(value, fieldName) {
  const number = normalizeInteger(value, fieldName);
  if (number <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
  return number;
}

export function normalizeOptionalPositiveInteger(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }
  return normalizePositiveInteger(value, fieldName);
}

export function normalizeObject(value, fieldName) {
  if (!isPlainObject(value)) {
    throw new Error(`${fieldName} must be an object`);
  }
  return value;
}

export function normalizePositiveVector2(value, fieldName) {
  const vector = vector2ToGodotVector(value, fieldName);
  if (vector.x <= 0 || vector.y <= 0) {
    throw new Error(`${fieldName} entries must be greater than 0`);
  }
  return vector;
}
