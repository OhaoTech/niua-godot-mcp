import { normalizeNonNegativeInteger } from "../../../../../shared/numbers.js";
import { vector3ToGodotVector } from "../../../../../shared/vectors.js";
import {
  applyNode3DTransformProperties,
  mergeCustomProperties
} from "../shared.js";

export function buildStaticBody3DProperties(payload) {
  const properties = {};

  applyNode3DTransformProperties(properties, payload);
  if (payload.constantLinearVelocity !== undefined) {
    properties.constant_linear_velocity = vector3ToGodotVector(
      payload.constantLinearVelocity,
      "constantLinearVelocity"
    );
  }
  if (payload.constantAngularVelocity !== undefined) {
    properties.constant_angular_velocity = vector3ToGodotVector(
      payload.constantAngularVelocity,
      "constantAngularVelocity"
    );
  }
  if (payload.collisionLayer !== undefined) {
    properties.collision_layer = normalizeNonNegativeInteger(payload.collisionLayer, "collisionLayer");
  }
  if (payload.collisionMask !== undefined) {
    properties.collision_mask = normalizeNonNegativeInteger(payload.collisionMask, "collisionMask");
  }
  mergeCustomProperties(properties, payload.properties, "properties");

  return properties;
}
