import { normalizePositiveFiniteNumber } from "../../../shared/numbers.js";
import { vector2ToGodotVector } from "../../../shared/vectors.js";

import {
  normalizeObject,
  normalizeOptionalPositiveInteger,
  normalizePositiveInteger,
  normalizePositiveVector2,
  normalizeTexturePath
} from "./shared.js";

export function normalizeSheet(sheetValue, fieldName) {
  const sheet = normalizeObject(sheetValue, fieldName);
  const texturePath = normalizeTexturePath(sheet.texturePath);
  const frameSize = normalizePositiveVector2(sheet.frameSize, `${fieldName}.frameSize`);
  const columns = normalizeOptionalPositiveInteger(sheet.columns, `${fieldName}.columns`);
  const rows = normalizeOptionalPositiveInteger(sheet.rows, `${fieldName}.rows`);
  const totalFrames = columns !== undefined && rows !== undefined ? columns * rows : undefined;
  const frameCount = sheet.frameCount === undefined
    ? undefined
    : normalizePositiveInteger(sheet.frameCount, `${fieldName}.frameCount`);
  if (totalFrames !== undefined && frameCount !== undefined && frameCount > totalFrames) {
    throw new Error(`${fieldName}.frameCount cannot exceed columns * rows`);
  }

  const request = {
    texturePath,
    frameSize,
    origin: vector2ToGodotVector(sheet.origin ?? [0, 0], `${fieldName}.origin`),
    separation: vector2ToGodotVector(sheet.separation ?? [0, 0], `${fieldName}.separation`),
    duration: normalizePositiveFiniteNumber(sheet.duration ?? 1, `${fieldName}.duration`)
  };
  if (columns !== undefined) {
    request.columns = columns;
  }
  if (rows !== undefined) {
    request.rows = rows;
  }
  if (frameCount !== undefined) {
    request.frameCount = frameCount;
  }
  if (sheet.filterClip !== undefined) {
    request.filterClip = Boolean(sheet.filterClip);
  }

  return request;
}

export function expandSheetFrames(sheetValue, fieldName) {
  const sheet = normalizeSheet(sheetValue, fieldName);
  if (sheet.columns === undefined || sheet.rows === undefined) {
    throw new Error(`${fieldName}.columns and ${fieldName}.rows are required for Node-side expansion`);
  }

  const totalFrames = sheet.columns * sheet.rows;
  const frameCount = sheet.frameCount ?? totalFrames;
  const frames = [];

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const column = frameIndex % sheet.columns;
    const row = Math.floor(frameIndex / sheet.columns);
    const frame = {
      texturePath: sheet.texturePath,
      region: {
        position: {
          type: "Vector2",
          x: sheet.origin.x + column * (sheet.frameSize.x + sheet.separation.x),
          y: sheet.origin.y + row * (sheet.frameSize.y + sheet.separation.y)
        },
        size: sheet.frameSize
      },
      duration: sheet.duration
    };
    if (sheet.filterClip !== undefined) {
      frame.filterClip = Boolean(sheet.filterClip);
    }
    frames.push(frame);
  }

  return frames;
}
