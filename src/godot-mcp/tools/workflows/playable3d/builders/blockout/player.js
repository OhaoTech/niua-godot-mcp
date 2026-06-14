import { normalizeOptionalName } from "../../../../../shared/normalize.js";
import {
  createCharacterBody3D,
  createMeshInstance3D,
  resolveCreatedNodePath
} from "../../../../nodes/node3d/index.js";

export async function createBlockout3DPlayer({
  connectionArgs,
  payload,
  rootPath,
  resourceContext,
  layout
}) {
  const playerName = normalizeOptionalName(payload.playerName, "PlayerBody");
  const playerBody = await createCharacterBody3D({
    ...connectionArgs,
    name: playerName,
    parentPath: rootPath,
    position: layout.playerPosition,
    upDirection: [0, 1, 0],
    motionMode: "grounded",
    floorSnapLength: 0.4,
    collisionLayer: 1,
    collisionMask: 1,
    collisionShapeKind: "capsule",
    collisionShapePath: resourceContext.playerShapePath,
    collisionName: normalizeOptionalName(payload.playerCollisionName, "PlayerCollision"),
    collisionRadius: layout.playerRadius,
    collisionHeight: layout.playerHeight,
    openCollisionShape: false,
    overwriteCollisionShape: resourceContext.overwriteResources
  });
  if (!playerBody.ok) {
    return {
      playerName,
      playerBody,
      playerVisual: null
    };
  }

  const playerPath = resolveBlockout3DPlayerPath(playerBody, playerName, rootPath);
  const playerVisual = await createMeshInstance3D({
    ...connectionArgs,
    name: normalizeOptionalName(payload.playerVisualName, "PlayerVisual"),
    parentPath: playerPath,
    meshPath: resourceContext.playerMeshPath,
    meshKind: "capsule",
    radius: layout.playerRadius,
    height: layout.playerHeight,
    open: false,
    overwrite: resourceContext.overwriteResources
  });

  return {
    playerName,
    playerBody,
    playerVisual
  };
}

export function resolveBlockout3DPlayerPath(playerBody, playerName, rootPath) {
  return String(playerBody.data?.character?.nodePath ?? "").trim()
    || resolveCreatedNodePath({ data: playerBody.data?.character ?? {} }, playerName, rootPath);
}
