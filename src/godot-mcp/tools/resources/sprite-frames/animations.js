import { normalizePositiveFiniteNumber } from "../../../shared/numbers.js";

import { normalizeFrame } from "./frames.js";
import {
  expandSheetFrames,
  normalizeSheet
} from "./sheets.js";
import { normalizeAnimationName } from "./shared.js";

export function normalizeSpriteFrameAnimations(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("animations must be a non-empty array");
  }

  const seen = new Set();
  return value.map((rawAnimation, animationIndex) => {
    const animation = rawAnimation && typeof rawAnimation === "object" ? rawAnimation : {};
    const name = normalizeAnimationName(animation.name);
    if (seen.has(name)) {
      throw new Error(`duplicate animation name: ${name}`);
    }
    seen.add(name);

    if (animation.sheet !== undefined && animation.frames !== undefined) {
      throw new Error(
        `animations[${animationIndex}] must define either frames or sheet, not both`
      );
    }

    let frames = [];
    let sheet = null;
    if (animation.sheet !== undefined) {
      const normalizedSheet = normalizeSheet(animation.sheet, `animations[${animationIndex}].sheet`);
      if (normalizedSheet.columns !== undefined && normalizedSheet.rows !== undefined) {
        frames = expandSheetFrames(normalizedSheet, `animations[${animationIndex}].sheet`);
      } else {
        sheet = normalizedSheet;
      }
    } else if (Array.isArray(animation.frames) && animation.frames.length > 0) {
      frames = animation.frames.map((rawFrame, frameIndex) => normalizeFrame(
        rawFrame,
        `animations[${animationIndex}].frames[${frameIndex}]`
      ));
    } else {
      throw new Error(`animations[${animationIndex}].frames must be a non-empty array`);
    }

    const request = {
      name,
      speedFps: normalizePositiveFiniteNumber(
        animation.speedFps ?? 5,
        `animations[${animationIndex}].speedFps`
      ),
      loop: Boolean(animation.loop ?? true)
    };

    if (sheet !== null) {
      request.sheet = sheet;
    } else {
      request.frames = frames;
    }

    return request;
  });
}
