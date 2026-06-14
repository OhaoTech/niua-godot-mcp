import { normalizeCollisionShape3DKind } from "../../kinds.js";
import {
  buildCollisionShape3DNodeProperties,
  buildCollisionShape3DResourceProperties
} from "../../properties.js";

export function buildCollisionChild3DContext(payload) {
  const collisionShapePath = String(payload.collisionShapePath ?? "").trim();
  if (!collisionShapePath) {
    return {
      collisionShapePath
    };
  }

  const shapeKind = normalizeCollisionShape3DKind(payload.collisionShapeKind ?? "box");
  const collisionShapeProperties = buildCollisionShape3DResourceProperties({
    size: payload.collisionSize,
    radius: payload.collisionRadius,
    height: payload.collisionHeight,
    margin: payload.collisionMargin,
    shapeProperties: payload.collisionShapeProperties
  }, shapeKind);

  return {
    collisionShapePath,
    shapeKind,
    collisionShapeProperties
  };
}

export function buildCollisionChild3DNodeProperties(context, payload) {
  return buildCollisionShape3DNodeProperties({
    position: payload.collisionPosition,
    rotationDegrees: payload.collisionRotationDegrees,
    scale: payload.collisionScale,
    disabled: payload.collisionDisabled,
    nodeProperties: payload.collisionNodeProperties
  }, context.collisionShapePath);
}
