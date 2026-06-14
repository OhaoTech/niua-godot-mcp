import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeBoundedInteger,
  normalizeFiniteNumber,
  normalizeNonNegativeInteger,
  normalizePositiveFiniteNumber,
  normalizePositiveInteger
} from "../../../src/godot-mcp/shared/numbers.js";

test("number helpers normalize finite and positive values", () => {
  assert.equal(normalizeFiniteNumber("2.5", "speed"), 2.5);
  assert.equal(normalizePositiveFiniteNumber("3", "radius"), 3);
  assert.throws(() => normalizeFiniteNumber("nope", "speed"), /speed must be a finite number/);
  assert.throws(() => normalizePositiveFiniteNumber(0, "radius"), /radius must be greater than 0/);
});

test("number helpers normalize integer bounds", () => {
  assert.equal(normalizeNonNegativeInteger("4", "rings"), 4);
  assert.throws(() => normalizeNonNegativeInteger(-1, "rings"), /rings must be a non-negative integer/);
  assert.equal(normalizePositiveInteger("25.9", 10), 25);
  assert.equal(normalizePositiveInteger(-5, 10), 10);
  assert.equal(normalizeBoundedInteger(99, { fallback: 5, min: 1, max: 10 }), 10);
  assert.equal(normalizeBoundedInteger("bad", { fallback: 5, min: 1, max: 10 }), 5);
});

