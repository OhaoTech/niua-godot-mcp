import { normalizeFiniteNumber } from "./numbers.js";
import { isPlainObject } from "./normalize.js";

export function colorToGodotColor(value, fieldName) {
  if (typeof value === "string") {
    return parseHexColor(value, fieldName);
  }

  if (Array.isArray(value)) {
    if (value.length < 3 || value.length > 4) {
      throw new Error(`${fieldName} array must have 3 or 4 entries`);
    }
    return {
      type: "Color",
      r: normalizeColorComponent(value[0], `${fieldName}.r`),
      g: normalizeColorComponent(value[1], `${fieldName}.g`),
      b: normalizeColorComponent(value[2], `${fieldName}.b`),
      a: normalizeColorComponent(value[3] ?? 1, `${fieldName}.a`)
    };
  }

  if (isPlainObject(value)) {
    return {
      type: "Color",
      r: normalizeColorComponent(value.r, `${fieldName}.r`),
      g: normalizeColorComponent(value.g, `${fieldName}.g`),
      b: normalizeColorComponent(value.b, `${fieldName}.b`),
      a: normalizeColorComponent(value.a ?? 1, `${fieldName}.a`)
    };
  }

  throw new Error(`${fieldName} must be a hex color string, array, or object`);
}

export function parseHexColor(value, fieldName) {
  let hex = value.trim();
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }
  if (hex.length === 3 || hex.length === 4) {
    hex = hex.split("").map((character) => `${character}${character}`).join("");
  }
  if (hex.length !== 6 && hex.length !== 8) {
    throw new Error(`${fieldName} must be #RRGGBB or #RRGGBBAA`);
  }
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error(`${fieldName} contains non-hex characters`);
  }

  return {
    type: "Color",
    r: Number.parseInt(hex.slice(0, 2), 16) / 255,
    g: Number.parseInt(hex.slice(2, 4), 16) / 255,
    b: Number.parseInt(hex.slice(4, 6), 16) / 255,
    a: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1
  };
}

export function normalizeColorComponent(value, fieldName) {
  const number = normalizeFiniteNumber(value, fieldName);
  if (number < 0 || number > 1) {
    throw new Error(`${fieldName} must be between 0 and 1`);
  }
  return number;
}

