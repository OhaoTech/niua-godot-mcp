import { normalizeFiniteNumber } from "./numbers.js";
import { isPlainObject } from "./normalize.js";

function normalizeInteger(value, fieldName) {
  const number = Number(value);
  if (!Number.isInteger(number)) {
    throw new Error(`${fieldName} must be an integer`);
  }
  return number;
}

// A vector arg can arrive as a JSON string ("[0,0,0]" / '{"x":0,...}') when the
// client stringifies a schema-untyped param. Parse it back to array/object so
// plain position:[x,y,z] works end to end; leave anything else for the shape check.
function coerceStructuredValue(value) {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  return value;
}

export function vector2ToGodotVector(value, fieldName) {
  value = coerceStructuredValue(value);
  if (Array.isArray(value)) {
    if (value.length !== 2) {
      throw new Error(`${fieldName} array must have exactly 2 entries`);
    }
    return {
      type: "Vector2",
      x: normalizeFiniteNumber(value[0], `${fieldName}.x`),
      y: normalizeFiniteNumber(value[1], `${fieldName}.y`)
    };
  }

  if (isPlainObject(value)) {
    return {
      type: "Vector2",
      x: normalizeFiniteNumber(value.x, `${fieldName}.x`),
      y: normalizeFiniteNumber(value.y, `${fieldName}.y`)
    };
  }

  throw new Error(`${fieldName} must be a [x,y] array or { x, y } object`);
}

export function vector2iToGodotVector(value, fieldName) {
  value = coerceStructuredValue(value);
  if (Array.isArray(value)) {
    if (value.length !== 2) {
      throw new Error(`${fieldName} array must have exactly 2 entries`);
    }
    return {
      x: normalizeInteger(value[0], `${fieldName}.x`),
      y: normalizeInteger(value[1], `${fieldName}.y`)
    };
  }

  if (isPlainObject(value)) {
    return {
      x: normalizeInteger(value.x, `${fieldName}.x`),
      y: normalizeInteger(value.y, `${fieldName}.y`)
    };
  }

  throw new Error(`${fieldName} must be a [x,y] array or { x, y } object`);
}

export function vector3ToGodotVector(value, fieldName) {
  value = coerceStructuredValue(value);
  if (Array.isArray(value)) {
    if (value.length !== 3) {
      throw new Error(`${fieldName} array must have exactly 3 entries`);
    }
    return {
      type: "Vector3",
      x: normalizeFiniteNumber(value[0], `${fieldName}.x`),
      y: normalizeFiniteNumber(value[1], `${fieldName}.y`),
      z: normalizeFiniteNumber(value[2], `${fieldName}.z`)
    };
  }

  if (isPlainObject(value)) {
    return {
      type: "Vector3",
      x: normalizeFiniteNumber(value.x, `${fieldName}.x`),
      y: normalizeFiniteNumber(value.y, `${fieldName}.y`),
      z: normalizeFiniteNumber(value.z, `${fieldName}.z`)
    };
  }

  throw new Error(`${fieldName} must be a [x,y,z] array or { x, y, z } object`);
}

export function vector3ToComponents(value, fieldName) {
  const vector = vector3ToGodotVector(value, fieldName);
  return [vector.x, vector.y, vector.z];
}
