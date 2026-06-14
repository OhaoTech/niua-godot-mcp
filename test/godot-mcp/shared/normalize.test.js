import test from "node:test";
import assert from "node:assert/strict";

import {
  isPlainObject,
  normalizeOptionalName,
  normalizePlainObject
} from "../../../src/godot-mcp/shared/normalize.js";

test("normalize helpers recognize plain objects", () => {
  assert.equal(isPlainObject({ ok: true }), true);
  assert.equal(isPlainObject([1, 2]), false);
  assert.equal(isPlainObject(null), false);
});

test("normalize helpers preserve current name and object validation", () => {
  assert.equal(normalizeOptionalName(" Player ", "Fallback"), "Player");
  assert.equal(normalizeOptionalName(undefined, "Fallback"), "Fallback");
  assert.throws(() => normalizeOptionalName("", ""), /node names must not be empty/);
  assert.deepEqual(normalizePlainObject(undefined, "properties", {}), {});
  assert.deepEqual(normalizePlainObject({ x: 1 }, "properties"), { x: 1 });
  assert.throws(() => normalizePlainObject([], "properties"), /properties must be an object/);
});

