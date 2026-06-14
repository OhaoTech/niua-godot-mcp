import { vector2ToGodotVector } from "../../../shared/vectors.js";

export function cloneVector2(vector) {
  return {
    type: "Vector2",
    x: vector.x,
    y: vector.y
  };
}

export function normalizePosition(value, fieldName) {
  return vector2ToGodotVector(value, fieldName);
}
