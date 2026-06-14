import {
  normalizeFiniteNumber,
  normalizeNonNegativeInteger
} from "../../../../shared/numbers.js";
import { vector2ToGodotVector } from "../../../../shared/vectors.js";
import {
  buildNode2DProperties,
  resourceRef
} from "./shared.js";

export function buildCamera2DProperties(payload) {
  const extra = {};
  if (payload.zoom !== undefined) {
    extra.zoom = vector2ToGodotVector(payload.zoom, "zoom");
  }
  if (payload.enabled !== undefined) {
    extra.enabled = Boolean(payload.enabled);
  }
  if (payload.limitLeft !== undefined) {
    extra.limit_left = normalizeFiniteNumber(payload.limitLeft, "limitLeft");
  }
  if (payload.limitTop !== undefined) {
    extra.limit_top = normalizeFiniteNumber(payload.limitTop, "limitTop");
  }
  if (payload.limitRight !== undefined) {
    extra.limit_right = normalizeFiniteNumber(payload.limitRight, "limitRight");
  }
  if (payload.limitBottom !== undefined) {
    extra.limit_bottom = normalizeFiniteNumber(payload.limitBottom, "limitBottom");
  }
  return buildNode2DProperties(payload, { extra });
}

export function buildAnimatedSprite2DProperties(payload, spriteFramesPath) {
  const extra = {
    sprite_frames: resourceRef(spriteFramesPath)
  };
  if (payload.animation !== undefined) {
    extra.animation = String(payload.animation);
  }
  if (payload.autoplay !== undefined) {
    extra.autoplay = String(payload.autoplay);
  }
  if (payload.frame !== undefined) {
    extra.frame = normalizeNonNegativeInteger(payload.frame, "frame");
  }
  if (payload.speedScale !== undefined) {
    extra.speed_scale = normalizeFiniteNumber(payload.speedScale, "speedScale");
  }
  if (payload.playing !== undefined) {
    extra.playing = Boolean(payload.playing);
  }
  if (payload.centered !== undefined) {
    extra.centered = Boolean(payload.centered);
  }
  if (payload.offset !== undefined) {
    extra.offset = vector2ToGodotVector(payload.offset, "offset");
  }
  if (payload.flipH !== undefined) {
    extra.flip_h = Boolean(payload.flipH);
  }
  if (payload.flipV !== undefined) {
    extra.flip_v = Boolean(payload.flipV);
  }
  return buildNode2DProperties(payload, { extra });
}
