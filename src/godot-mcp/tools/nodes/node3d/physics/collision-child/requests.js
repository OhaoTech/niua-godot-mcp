import { resolveCreatedNodePath } from "../../paths.js";

export function buildCollisionChild3DResourceRequest(context, payload) {
  return {
    path: context.collisionShapePath,
    className: context.shapeKind.className,
    properties: context.collisionShapeProperties,
    open: Boolean(payload.openCollisionShape ?? false),
    overwrite: Boolean(payload.overwriteCollisionShape ?? false)
  };
}

export function buildCollisionChild3DNodeRequest({
  payload,
  ownerResult,
  ownerName,
  ownerParentPath,
  collisionNodeProperties
}) {
  const collisionRequest = {
    type: "CollisionShape3D",
    parentPath: resolveCreatedNodePath(ownerResult, ownerName, ownerParentPath),
    properties: collisionNodeProperties
  };
  const collisionName = String(payload.collisionName ?? "").trim();
  if (collisionName) {
    collisionRequest.name = collisionName;
  }
  return collisionRequest;
}
