import { normalizeOptionalName } from "../../../../../shared/normalize.js";
import {
  createArea2D,
  resolveCreatedNodePath
} from "../../../../nodes/node2d/index.js";

export function buildTriggerZoneAreaRequest({
  connectionArgs,
  payload,
  name,
  resourceContext
}) {
  return {
    ...connectionArgs,
    name,
    parentPath: payload.parentPath,
    position: payload.position,
    rotationDegrees: payload.rotationDegrees,
    scale: payload.scale,
    monitoring: payload.monitoring ?? true,
    monitorable: payload.monitorable ?? true,
    priority: payload.priority,
    collisionLayer: payload.collisionLayer,
    collisionMask: payload.collisionMask,
    collisionShapeKind: payload.shapeKind ?? "rectangle",
    collisionShapePath: payload.collisionShapePath ?? resourceContext.shapePath,
    collisionName: normalizeOptionalName(payload.collisionName, `${name}Collision`),
    collisionPosition: payload.collisionPosition,
    collisionRotationDegrees: payload.collisionRotationDegrees,
    collisionScale: payload.collisionScale,
    collisionDisabled: payload.collisionDisabled,
    collisionSize: payload.size,
    collisionRadius: payload.radius,
    collisionHeight: payload.height,
    openCollisionShape: false,
    overwriteCollisionShape: payload.overwriteCollisionShape ?? resourceContext.overwriteResources,
    collisionShapeProperties: payload.collisionShapeProperties,
    collisionNodeProperties: payload.collisionNodeProperties,
    createVisual: Boolean(payload.createVisual ?? false),
    visualName: normalizeOptionalName(payload.visualName, `${name}Visual`),
    visualPosition: payload.visualPosition,
    visualRotationDegrees: payload.visualRotationDegrees,
    visualScale: payload.visualScale,
    visualSize: payload.visualSize ?? payload.size,
    visualTexturePath: payload.visualTexturePath,
    visualPlaceholderTexturePath: payload.visualPlaceholderTexturePath ?? resourceContext.visualTexturePath,
    overwriteVisualTexture: payload.overwriteVisualTexture ?? resourceContext.overwriteResources,
    visualProperties: payload.visualProperties,
    properties: payload.properties
  };
}

export async function createTriggerZoneArea(args) {
  return createArea2D(buildTriggerZoneAreaRequest(args));
}

export function resolveTriggerZoneAreaPath(area, name, parentPath) {
  return String(area.data?.area?.nodePath ?? "").trim()
    || resolveCreatedNodePath({ data: area.data?.area ?? {} }, name, parentPath);
}
