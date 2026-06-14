import test from "node:test";
import assert from "node:assert/strict";

import {
  vector2iToGodotVector,
  vector2ToGodotVector,
  vector3ToComponents,
  vector3ToGodotVector
} from "../../../src/godot-mcp/shared/vectors.js";

test("vector helpers convert arrays and objects to typed Godot vectors", () => {
  assert.deepEqual(vector2ToGodotVector([1, "2"], "uv"), {
    type: "Vector2",
    x: 1,
    y: 2
  });
  assert.deepEqual(vector2iToGodotVector([1, "2"], "coords"), {
    x: 1,
    y: 2
  });
  assert.deepEqual(vector2iToGodotVector({ x: "3", y: 4 }, "atlasCoords"), {
    x: 3,
    y: 4
  });
  assert.deepEqual(vector3ToGodotVector({ x: 1, y: "2", z: 3 }, "position"), {
    type: "Vector3",
    x: 1,
    y: 2,
    z: 3
  });
  assert.deepEqual(vector3ToComponents([1, 2, 3], "position"), [1, 2, 3]);
});

test("vector helpers reject invalid shapes", () => {
  assert.throws(() => vector2ToGodotVector([1], "uv"), /uv array must have exactly 2 entries/);
  assert.throws(() => vector2iToGodotVector([1.5, 2], "coords"), /coords.x must be an integer/);
  assert.throws(() => vector2iToGodotVector([1], "coords"), /coords array must have exactly 2 entries/);
  assert.throws(() => vector3ToGodotVector([1, 2], "position"), /position array must have exactly 3 entries/);
  assert.throws(() => vector3ToGodotVector("bad", "position"), /position must be a \[x,y,z\] array or { x, y, z } object/);
});
