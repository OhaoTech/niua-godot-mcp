import {
  normalizeFiniteNumber,
  normalizeNonNegativeInteger
} from "../../../../shared/numbers.js";
import { buildNode2DProperties } from "./shared.js";

export function buildPhysicsBody2DProperties(payload) {
  const extra = {};
  if (payload.collisionLayer !== undefined) {
    extra.collision_layer = normalizeNonNegativeInteger(payload.collisionLayer, "collisionLayer");
  }
  if (payload.collisionMask !== undefined) {
    extra.collision_mask = normalizeNonNegativeInteger(payload.collisionMask, "collisionMask");
  }
  return buildNode2DProperties(payload, { extra });
}

export function buildArea2DProperties(payload) {
  const extra = {};
  if (payload.monitoring !== undefined) {
    extra.monitoring = Boolean(payload.monitoring);
  }
  if (payload.monitorable !== undefined) {
    extra.monitorable = Boolean(payload.monitorable);
  }
  if (payload.priority !== undefined) {
    extra.priority = normalizeFiniteNumber(payload.priority, "priority");
  }
  if (payload.collisionLayer !== undefined) {
    extra.collision_layer = normalizeNonNegativeInteger(payload.collisionLayer, "collisionLayer");
  }
  if (payload.collisionMask !== undefined) {
    extra.collision_mask = normalizeNonNegativeInteger(payload.collisionMask, "collisionMask");
  }
  return buildNode2DProperties(payload, { extra });
}
