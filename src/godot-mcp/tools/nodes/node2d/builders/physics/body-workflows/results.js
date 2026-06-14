export function physicsBody2DBodyFailure({
  type,
  properties,
  createdBody
}) {
  return {
    ok: false,
    error: createdBody.error,
    data: {
      type,
      properties,
      createdBody
    }
  };
}

export function physicsBody2DCollisionFailure({
  type,
  properties,
  bodyKey,
  createdBody,
  collisionChild
}) {
  return {
    ok: false,
    error: collisionChild.error,
    data: {
      type,
      properties,
      [bodyKey]: createdBody.data,
      createdBody,
      collisionResult: collisionChild.data.collisionResult
    }
  };
}

export function physicsBody2DNoCollisionSuccess({
  type,
  properties,
  bodyKey,
  createdBody
}) {
  return {
    ok: true,
    data: {
      type,
      properties,
      [bodyKey]: createdBody.data,
      collisionShapeKind: null,
      collisionShapeClassName: null,
      collisionShapePath: null,
      collisionShapeProperties: null,
      collisionNodeProperties: null,
      shape: null,
      collision: null,
      visual: null,
      createdBody,
      createdShape: null,
      createdCollision: null,
      visualResult: null
    }
  };
}

export function physicsBody2DVisualFailure({
  type,
  properties,
  bodyKey,
  createdBody,
  collisionResult,
  visualResult
}) {
  return {
    ok: false,
    error: visualResult.error,
    data: {
      type,
      properties,
      [bodyKey]: createdBody.data,
      createdBody,
      collisionResult,
      visualResult
    }
  };
}

export function physicsBody2DSuccess({
  type,
  properties,
  bodyKey,
  createdBody,
  collisionShapePath,
  collisionResult,
  visualResult
}) {
  return {
    ok: true,
    data: {
      type,
      properties,
      [bodyKey]: createdBody.data,
      collisionShapeKind: collisionResult.data.shapeKind,
      collisionShapeClassName: collisionResult.data.shapeClassName,
      collisionShapePath,
      collisionShapeProperties: collisionResult.data.shapeProperties,
      collisionNodeProperties: collisionResult.data.nodeProperties,
      shape: collisionResult.data.shape,
      collision: collisionResult.data.node,
      visual: visualResult?.data?.node ?? null,
      createdBody,
      createdShape: collisionResult.data.createdShape,
      createdCollision: collisionResult.data.createdNode,
      collisionResult,
      visualResult
    }
  };
}
