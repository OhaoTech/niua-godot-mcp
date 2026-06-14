import { normalizeFiniteNumber } from "../../../../../shared/numbers.js";

export function gdNumber(value) {
  return String(normalizeFiniteNumber(value, "GDScript numeric literal"));
}

export function gdString(value) {
  return JSON.stringify(String(value));
}
