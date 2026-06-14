import { isPlainObject } from "../../../shared/normalize.js";
import { vector2iToGodotVector } from "../../../shared/vectors.js";

export function normalizeResPath(value, fieldName) {
  const path = String(value ?? "").trim();
  if (!path.startsWith("res://")) {
    throw new Error(`${fieldName} must start with res://`);
  }
  return path;
}

export function normalizeInteger(value, fieldName) {
  const number = Number(value);
  if (!Number.isInteger(number)) {
    throw new Error(`${fieldName} must be an integer`);
  }
  return number;
}

export function normalizeNonNegativeInteger(value, fieldName) {
  const number = normalizeInteger(value, fieldName);
  if (number < 0) {
    throw new Error(`${fieldName} must be a non-negative integer`);
  }
  return number;
}

export function normalizeTerrainValue(value, fieldName) {
  const number = normalizeInteger(value, fieldName);
  if (number < -1) {
    throw new Error(`${fieldName} must be -1 or greater`);
  }
  return number;
}

export function normalizeNonNegativeFiniteNumber(value, fieldName) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${fieldName} must be a non-negative finite number`);
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

export function normalizePositiveVector2i(value, fieldName) {
  const vector = vector2iToGodotVector(value, fieldName);
  if (vector.x <= 0 || vector.y <= 0) {
    throw new Error(`${fieldName} entries must be greater than 0`);
  }
  return vector;
}

export function normalizePositiveBitMask(value, fieldName) {
  const number = normalizeInteger(value, fieldName);
  if (number <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
  return number;
}

export function normalizeObject(value, fieldName) {
  if (!isPlainObject(value)) {
    throw new Error(`${fieldName} must be an object`);
  }
  return value;
}
