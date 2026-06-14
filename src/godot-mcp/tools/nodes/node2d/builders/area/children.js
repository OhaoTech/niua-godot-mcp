import { trimOptionalString } from "../../properties.js";
import { createCollisionShape2DWithClient } from "../collision.js";
import { resolveCreatedNodePath } from "../shared.js";
import { createSprite2DWithClient } from "../visual.js";

export async function createOptionalArea2DCollisionChild({
  client,
  payload,
  createdArea,
  areaName
}) {
  const collisionShapePath = trimOptionalString(payload.collisionShapePath);
  if (!collisionShapePath) {
    return {
      ok: true,
      data: {
        areaPath: null,
        collisionShapePath: null,
        collisionResult: null
      }
    };
  }

  const areaPath = resolveCreatedNodePath(createdArea, areaName || "Area2D", payload.parentPath);
  const collisionResult = await createCollisionShape2DWithClient(client, {
    name: payload.collisionName,
    parentPath: areaPath,
    shapeKind: payload.collisionShapeKind ?? "rectangle",
    shapePath: collisionShapePath,
    position: payload.collisionPosition,
    rotationDegrees: payload.collisionRotationDegrees,
    scale: payload.collisionScale,
    disabled: payload.collisionDisabled,
    size: payload.collisionSize,
    radius: payload.collisionRadius,
    height: payload.collisionHeight,
    open: payload.openCollisionShape,
    overwrite: payload.overwriteCollisionShape,
    shapeProperties: payload.collisionShapeProperties,
    nodeProperties: payload.collisionNodeProperties
  });

  return {
    ok: collisionResult.ok,
    error: collisionResult.error,
    data: {
      areaPath,
      collisionShapePath,
      collisionResult
    }
  };
}

export async function createOptionalArea2DVisualChild({
  client,
  payload,
  areaPath
}) {
  if (payload.createVisual !== true) {
    return null;
  }

  return createSprite2DWithClient(client, {
    name: payload.visualName,
    parentPath: areaPath,
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
