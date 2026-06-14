import { vector2ToGodotVector } from "../../../../shared/vectors.js";
import {
  normalizeNonNegativeFiniteNumber,
  normalizeNonNegativeInteger,
  normalizeObject
} from "../shared.js";

export function normalizeCollisionPolygon(value, fieldName) {
  const polygon = normalizeObject(value, fieldName);
  if (!Array.isArray(polygon.points) || polygon.points.length < 3) {
    throw new Error(`${fieldName}.points must contain at least 3 points`);
  }

  return {
    layer: normalizeNonNegativeInteger(polygon.layer ?? 0, `${fieldName}.layer`),
    points: polygon.points.map((point, pointIndex) => vector2ToGodotVector(
      point,
      `${fieldName}.points[${pointIndex}]`
    )),
    oneWay: Boolean(polygon.oneWay ?? false),
    oneWayMargin: normalizeNonNegativeFiniteNumber(
      polygon.oneWayMargin ?? 1,
      `${fieldName}.oneWayMargin`
    )
  };
}

export function normalizeCollisionPolygons(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${fieldName} must be a non-empty array`);
  }
  return value.map((polygon, polygonIndex) => normalizeCollisionPolygon(
    polygon,
    `${fieldName}[${polygonIndex}]`
  ));
}

export function tileHasCollisionPolygons(tile) {
  return Array.isArray(tile.collisionPolygons) && tile.collisionPolygons.length > 0;
}
