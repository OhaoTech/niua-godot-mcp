import { normalizeOptionalName } from "../../../../../shared/normalize.js";
import {
  createCharacterBody2D,
  resolveCreatedNodePath
} from "../../../../nodes/node2d/index.js";

export async function createBlockout2DPlayer({
  connectionArgs,
  payload,
  rootPath,
  resourceContext,
  layout
}) {
  const playerName = normalizeOptionalName(payload.playerName, "PlayerBody");
  const player = await createCharacterBody2D({
    ...connectionArgs,
    name: playerName,
    parentPath: rootPath,
    position: layout.playerPosition,
    collisionLayer: 1,
    collisionMask: 1,
    collisionShapeKind: "capsule",
    collisionShapePath: resourceContext.playerShapePath,
    collisionName: normalizeOptionalName(payload.playerCollisionName, "PlayerCollision"),
    collisionRadius: layout.playerRadius,
    collisionHeight: layout.playerHeight,
    openCollisionShape: false,
    overwriteCollisionShape: resourceContext.overwriteResources,
    createVisual: true,
    visualName: normalizeOptionalName(payload.playerVisualName, "PlayerVisual"),
    visualSize: layout.playerSize,
    visualPlaceholderTexturePath: resourceContext.playerTexturePath,
    overwriteVisualTexture: resourceContext.overwriteResources
  });

  return {
    playerName,
    player
  };
}

export function resolveBlockout2DPlayerPath(player, playerName, rootPath) {
  return String(player.data?.character?.nodePath ?? "").trim()
    || resolveCreatedNodePath({ data: player.data?.character ?? {} }, playerName, rootPath);
}
