import { normalizeNonNegativeInteger } from "../../../../../shared/numbers.js";
import { vector3ToGodotVector } from "../../../../../shared/vectors.js";
import { normalizeCharacterBody3DMotionMode } from "../../kinds.js";
import {
  applyNode3DTransformProperties,
  applyOptionalNumberProperty,
  mergeCustomProperties
} from "../shared.js";

export function buildCharacterBody3DProperties(payload) {
  const properties = {};

  applyNode3DTransformProperties(properties, payload);
  if (payload.velocity !== undefined) {
    properties.velocity = vector3ToGodotVector(payload.velocity, "velocity");
  }
  if (payload.upDirection !== undefined) {
    properties.up_direction = vector3ToGodotVector(payload.upDirection, "upDirection");
  }

  const motionMode = normalizeCharacterBody3DMotionMode(payload.motionMode);
  if (motionMode !== undefined) {
    properties.motion_mode = motionMode;
  }
  applyOptionalNumberProperty(properties, "wall_min_slide_angle", payload.wallMinSlideAngle);
  applyOptionalNumberProperty(properties, "floor_max_angle", payload.floorMaxAngle);
  applyOptionalNumberProperty(properties, "floor_snap_length", payload.floorSnapLength);

  if (payload.floorStopOnSlope !== undefined) {
    properties.floor_stop_on_slope = Boolean(payload.floorStopOnSlope);
  }
  if (payload.floorConstantSpeed !== undefined) {
    properties.floor_constant_speed = Boolean(payload.floorConstantSpeed);
  }
  if (payload.floorBlockOnWall !== undefined) {
    properties.floor_block_on_wall = Boolean(payload.floorBlockOnWall);
  }
  if (payload.slideOnCeiling !== undefined) {
    properties.slide_on_ceiling = Boolean(payload.slideOnCeiling);
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
