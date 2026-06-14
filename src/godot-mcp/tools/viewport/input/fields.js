import {
  normalizeFiniteNumber,
  normalizeNonNegativeInteger
} from "../../../shared/numbers.js";
import { normalizePosition } from "./vectors.js";

const OPTIONAL_BOOLEAN_FIELDS = [
  "shift",
  "alt",
  "ctrl",
  "meta",
  "commandOrControlAutoremap",
  "penInverted"
];

const OPTIONAL_VECTOR2_FIELDS = [
  "globalPosition",
  "relative",
  "screenRelative",
  "velocity",
  "screenVelocity",
  "tilt"
];

const OPTIONAL_NUMBER_FIELDS = [
  "factor",
  "pressure"
];

export function normalizeBoolean(value, fieldName, fallback = undefined) {
  if (value === undefined) {
    if (fallback === undefined) {
      throw new Error(`${fieldName} must be a boolean`);
    }
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(`${fieldName} must be a boolean`);
}

export function normalizePositiveInteger(value, fieldName, fallback = undefined) {
  if (value === undefined) {
    if (fallback === undefined) {
      throw new Error(`${fieldName} must be a positive integer`);
    }
    return fallback;
  }

  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return number;
}

export function normalizeOptionalNonNegativeInteger(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }
  return normalizeNonNegativeInteger(value, fieldName);
}

export function normalizeViewportName(value) {
  const viewport = String(value ?? "3d").trim().toLowerCase();
  if (viewport !== "2d" && viewport !== "3d") {
    throw new Error("viewport must be 2d or 3d");
  }
  return viewport;
}

export function applyCommonMouseFields(output, event, fieldName) {
  for (const key of OPTIONAL_BOOLEAN_FIELDS) {
    if (event[key] !== undefined) {
      output[key] = normalizeBoolean(event[key], `${fieldName}.${key}`);
    }
  }

  for (const key of OPTIONAL_VECTOR2_FIELDS) {
    if (event[key] !== undefined) {
      output[key] = normalizePosition(event[key], `${fieldName}.${key}`);
    }
  }

  for (const key of OPTIONAL_NUMBER_FIELDS) {
    if (event[key] !== undefined) {
      output[key] = normalizeFiniteNumber(event[key], `${fieldName}.${key}`);
    }
  }

  const device = normalizeOptionalNonNegativeInteger(event.device, `${fieldName}.device`);
  if (device !== undefined) {
    output.device = device;
  }

  const windowId = normalizeOptionalNonNegativeInteger(event.windowId, `${fieldName}.windowId`);
  if (windowId !== undefined) {
    output.windowId = windowId;
  }

  const buttonMask = normalizeOptionalNonNegativeInteger(event.buttonMask, `${fieldName}.buttonMask`);
  if (buttonMask !== undefined) {
    output.buttonMask = buttonMask;
  }
}
