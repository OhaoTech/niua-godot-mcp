function collisionChild3DContextData(context) {
  return {
    collisionShapeKind: context.shapeKind.kind,
    collisionShapeClassName: context.shapeKind.className,
    collisionShapePath: context.collisionShapePath,
    collisionShapeProperties: context.collisionShapeProperties
  };
}

export function collisionChild3DNoCollisionResult({
  type,
  properties,
  ownerDataKey,
  ownerResult,
  createdOwnerKey
}) {
  return {
    ok: true,
    data: {
      type,
      properties,
      [ownerDataKey]: ownerResult.data,
      collisionShapeKind: null,
      collisionShapeClassName: null,
      collisionShapePath: null,
      collisionShapeProperties: null,
      collisionNodeProperties: null,
      shape: null,
      collision: null,
      [createdOwnerKey]: ownerResult,
      createdShape: null,
      createdCollision: null
    }
  };
}

export function collisionChild3DShapeFailure({
  type,
  properties,
  ownerDataKey,
  ownerResult,
  createdOwnerKey,
  context,
  createdShape
}) {
  return {
    ok: false,
    error: createdShape.error,
    data: {
      type,
      properties,
      [ownerDataKey]: ownerResult.data,
      ...collisionChild3DContextData(context),
      [createdOwnerKey]: ownerResult,
      createdShape
    }
  };
}

export function collisionChild3DNodeFailure({
  type,
  properties,
  ownerDataKey,
  ownerResult,
  createdOwnerKey,
  context,
  collisionNodeProperties,
  createdShape,
  createdCollision
}) {
  return {
    ok: false,
    error: createdCollision.error,
    data: {
      type,
      properties,
      [ownerDataKey]: ownerResult.data,
      ...collisionChild3DContextData(context),
      collisionNodeProperties,
      [createdOwnerKey]: ownerResult,
      createdShape,
      createdCollision
    }
  };
}

export function collisionChild3DSuccess({
  type,
  properties,
  ownerDataKey,
  ownerResult,
  createdOwnerKey,
  context,
  collisionNodeProperties,
  createdShape,
  createdCollision
}) {
  return {
    ok: true,
    data: {
      type,
      properties,
      [ownerDataKey]: ownerResult.data,
      ...collisionChild3DContextData(context),
      collisionNodeProperties,
      shape: createdShape.data,
      collision: createdCollision.data,
      [createdOwnerKey]: ownerResult,
      createdShape,
      createdCollision
    }
  };
}
