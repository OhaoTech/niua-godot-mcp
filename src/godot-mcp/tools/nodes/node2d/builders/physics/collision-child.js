import { trimOptionalString } from "../../properties.js";
import { createCollisionShape2DWithClient } from "../collision.js";
import { resolveCreatedNodePath } from "../shared.js";

export async function createOptionalCollisionShape2DChild({
  client,
  payload,
  createdBody,
  bodyName
}) {
  const collisionShapePath = trimOptionalString(payload.collisionShapePath);
  if (!collisionShapePath) {
    return {
      ok: true,
      data: {
        bodyPath: null,
        collisionShapePath: null,
        collisionResult: null
      }
    };
  }

  const bodyPath = resolveCreatedNodePath(createdBody, bodyName, payload.parentPath);
  const collisionResult = await createCollisionShape2DWithClient(client, {
    name: payload.collisionName,
    parentPath: bodyPath,
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
      bodyPath,
      collisionShapePath,
      collisionResult
    }
  };
}
