import {
  buildCollisionChild3DContext,
  buildCollisionChild3DNodeProperties
} from "./collision-child/context.js";
import {
  buildCollisionChild3DNodeRequest,
  buildCollisionChild3DResourceRequest
} from "./collision-child/requests.js";
import {
  collisionChild3DNoCollisionResult,
  collisionChild3DNodeFailure,
  collisionChild3DShapeFailure,
  collisionChild3DSuccess
} from "./collision-child/results.js";

export async function createOptionalCollisionShape3DChild({
  client,
  payload,
  ownerResult,
  ownerDataKey,
  createdOwnerKey,
  ownerName,
  ownerParentPath,
  type,
  properties
}) {
  const context = buildCollisionChild3DContext(payload);
  if (!context.collisionShapePath) {
    return collisionChild3DNoCollisionResult({
      type,
      properties,
      ownerDataKey,
      ownerResult,
      createdOwnerKey
    });
  }

  const createdShape = await client.createResource(buildCollisionChild3DResourceRequest(context, payload));
  if (!createdShape.ok) {
    return collisionChild3DShapeFailure({
      type,
      properties,
      ownerDataKey,
      ownerResult,
      createdOwnerKey,
      context,
      createdShape
    });
  }

  const collisionNodeProperties = buildCollisionChild3DNodeProperties(context, payload);
  const createdCollision = await client.createNode(buildCollisionChild3DNodeRequest({
    context,
    payload,
    ownerResult,
    ownerName,
    ownerParentPath,
    collisionNodeProperties
  }));
  if (!createdCollision.ok) {
    return collisionChild3DNodeFailure({
      type,
      properties,
      ownerDataKey,
      ownerResult,
      createdOwnerKey,
      context,
      collisionNodeProperties,
      createdShape,
      createdCollision
    });
  }

  return collisionChild3DSuccess({
    type,
    properties,
    ownerDataKey,
    ownerResult,
    createdOwnerKey,
    context,
    collisionNodeProperties,
    createdShape,
    createdCollision
  });
}
