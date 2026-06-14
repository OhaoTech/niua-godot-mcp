import { normalizeOptionalName } from "../../../../../shared/normalize.js";
import { createStaticBody2D } from "../../../../nodes/node2d/index.js";

export async function createBlockout2DGround({
  connectionArgs,
  payload,
  rootPath,
  resourceContext,
  layout
}) {
  return createStaticBody2D({
    ...connectionArgs,
    name: normalizeOptionalName(payload.groundBodyName, "GroundBody"),
    parentPath: rootPath,
    position: layout.groundPosition,
    collisionLayer: 1,
    collisionMask: 1,
    collisionShapeKind: "rectangle",
    collisionShapePath: resourceContext.groundShapePath,
    collisionName: normalizeOptionalName(payload.groundCollisionName, "GroundCollision"),
    collisionSize: layout.groundSize,
    openCollisionShape: false,
    overwriteCollisionShape: resourceContext.overwriteResources,
    createVisual: true,
    visualName: normalizeOptionalName(payload.groundVisualName, "GroundVisual"),
    visualSize: layout.groundSize,
    visualPlaceholderTexturePath: resourceContext.groundTexturePath,
    overwriteVisualTexture: resourceContext.overwriteResources
  });
}
