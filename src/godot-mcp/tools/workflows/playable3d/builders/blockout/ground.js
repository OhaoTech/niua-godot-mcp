import { normalizeOptionalName } from "../../../../../shared/normalize.js";
import {
  createMeshInstance3D,
  createStaticBody3D
} from "../../../../nodes/node3d/index.js";

export async function createBlockout3DGround({
  connectionArgs,
  payload,
  rootPath,
  resourceContext,
  layout
}) {
  const groundVisual = await createMeshInstance3D({
    ...connectionArgs,
    name: normalizeOptionalName(payload.groundVisualName, "GroundVisual"),
    parentPath: rootPath,
    meshPath: resourceContext.groundMeshPath,
    meshKind: "box",
    size: layout.groundSize,
    position: layout.groundPosition,
    open: false,
    overwrite: resourceContext.overwriteResources
  });
  if (!groundVisual.ok) {
    return {
      groundVisual,
      groundBody: null
    };
  }

  const groundBody = await createStaticBody3D({
    ...connectionArgs,
    name: normalizeOptionalName(payload.groundBodyName, "GroundBody"),
    parentPath: rootPath,
    position: layout.groundPosition,
    collisionLayer: 1,
    collisionMask: 1,
    collisionShapeKind: "box",
    collisionShapePath: resourceContext.groundShapePath,
    collisionName: normalizeOptionalName(payload.groundCollisionName, "GroundCollision"),
    collisionSize: layout.groundSize,
    openCollisionShape: false,
    overwriteCollisionShape: resourceContext.overwriteResources
  });

  return {
    groundVisual,
    groundBody
  };
}
