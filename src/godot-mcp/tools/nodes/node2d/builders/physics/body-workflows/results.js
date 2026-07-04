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
      properties
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
  const collisionData = collisionChild.data.collisionResult?.data ?? {};
  return {
    ok: false,
    error: collisionChild.error,
    data: {
      type,
      properties,
      [bodyKey]: createdBody.data,
      collisionShapeKind: collisionData.shapeKind ?? null,
      collisionShapeClassName: collisionData.shapeClassName ?? null,
      collisionShapePath: collisionData.shapePath ?? null,
      collisionShapeProperties: collisionData.shapeProperties ?? null,
      collisionNodeProperties: collisionData.nodeProperties ?? null,
      shape: collisionData.shape ?? null
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
      visual: null
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
      collisionShapeKind: collisionResult.data.shapeKind,
      collisionShapeClassName: collisionResult.data.shapeClassName,
      collisionShapePath: collisionResult.data.shapePath,
      collisionShapeProperties: collisionResult.data.shapeProperties,
      collisionNodeProperties: collisionResult.data.nodeProperties,
      shape: collisionResult.data.shape,
      collision: collisionResult.data.node,
      visual: visualResult.data ?? null
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
      visual: visualResult?.data?.node ?? null
    }
  };
}
