import { normalizeNonNegativeInteger } from "../../../../../shared/numbers.js";
import {
  applyNode3DTransformProperties,
  applyOptionalNumberProperty,
  mergeCustomProperties
} from "../shared.js";

export function buildArea3DProperties(payload) {
  const properties = {};

  applyNode3DTransformProperties(properties, payload);
  if (payload.monitoring !== undefined) {
    properties.monitoring = Boolean(payload.monitoring);
  }
  if (payload.monitorable !== undefined) {
    properties.monitorable = Boolean(payload.monitorable);
  }
  applyOptionalNumberProperty(properties, "priority", payload.priority);
  if (payload.collisionLayer !== undefined) {
    properties.collision_layer = normalizeNonNegativeInteger(payload.collisionLayer, "collisionLayer");
  }
  if (payload.collisionMask !== undefined) {
    properties.collision_mask = normalizeNonNegativeInteger(payload.collisionMask, "collisionMask");
  }
  mergeCustomProperties(properties, payload.properties, "properties");

  return properties;
}
