import { createSprite2DWithClient } from "../visual.js";

export async function createOptionalVisual2DChild({
  client,
  payload,
  bodyPath
}) {
  if (payload.createVisual !== true) {
    return null;
  }

  return createSprite2DWithClient(client, {
    name: payload.visualName,
    parentPath: bodyPath,
    position: payload.visualPosition,
    rotationDegrees: payload.visualRotationDegrees,
    scale: payload.visualScale,
    size: payload.visualSize,
    texturePath: payload.visualTexturePath,
    placeholderTexturePath: payload.visualPlaceholderTexturePath,
    overwriteTexture: payload.overwriteVisualTexture,
    properties: payload.visualProperties
  });
}
