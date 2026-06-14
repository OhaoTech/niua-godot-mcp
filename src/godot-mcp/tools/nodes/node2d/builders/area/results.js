const AREA2D_TYPE = "Area2D";

export function buildArea2DCreateFailure({
  properties,
  createdArea
}) {
  return {
    ok: false,
    error: createdArea.error,
    data: {
      type: AREA2D_TYPE,
      properties,
      createdArea
    }
  };
}

export function buildArea2DWithoutCollisionResult({
  properties,
  createdArea
}) {
  return {
    ok: true,
    data: {
      type: AREA2D_TYPE,
      properties,
      area: createdArea.data,
      collisionShapeKind: null,
      collisionShapeClassName: null,
      collisionShapePath: null,
      collisionShapeProperties: null,
      collisionNodeProperties: null,
      shape: null,
      collision: null,
      visual: null,
      createdArea,
      createdShape: null,
      createdCollision: null,
      collisionResult: null,
      visualResult: null
    }
  };
}

export function buildArea2DCollisionFailure({
  properties,
  createdArea,
  collisionResult
}) {
  return {
    ok: false,
    error: collisionResult.error,
    data: {
      type: AREA2D_TYPE,
      properties,
      area: createdArea.data,
      createdArea,
      collisionResult
    }
  };
}

export function buildArea2DVisualFailure({
  properties,
  createdArea,
  collisionResult,
  visualResult
}) {
  return {
    ok: false,
    error: visualResult.error,
    data: {
      type: AREA2D_TYPE,
      properties,
      area: createdArea.data,
      createdArea,
      collisionResult,
      visualResult
    }
  };
}

export function buildArea2DSuccess({
  properties,
  createdArea,
  collisionShapePath,
  collisionResult,
  visualResult
}) {
  return {
    ok: true,
    data: {
      type: AREA2D_TYPE,
      properties,
      area: createdArea.data,
      collisionShapeKind: collisionResult.data.shapeKind,
      collisionShapeClassName: collisionResult.data.shapeClassName,
      collisionShapePath,
      collisionShapeProperties: collisionResult.data.shapeProperties,
      collisionNodeProperties: collisionResult.data.nodeProperties,
      shape: collisionResult.data.shape,
      collision: collisionResult.data.node,
      visual: visualResult?.data?.node ?? null,
      createdArea,
      createdShape: collisionResult.data.createdShape,
      createdCollision: collisionResult.data.createdNode,
      collisionResult,
      visualResult
    }
  };
}
