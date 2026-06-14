import { pickBridgeConnectionArgs, splitBridgeArgs } from "../../../../server/context.js";
import { appendBlockoutStep, blockoutFailure } from "./shared.js";
import {
  createBlockout2DRoot,
  resolveBlockout2DRootPath
} from "./blockout/root.js";
import { buildBlockout2DResourceContext } from "./blockout/resources.js";
import { buildBlockout2DLayout } from "./blockout/layout.js";
import { createBlockout2DGround } from "./blockout/ground.js";
import {
  createBlockout2DPlayer,
  resolveBlockout2DPlayerPath
} from "./blockout/player.js";
import { createBlockout2DCamera } from "./blockout/camera.js";
import { attachBlockout2DController } from "./blockout/controller.js";
import { blockout2DSuccessData } from "./blockout/result.js";

export async function create2DPlayableBlockout(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const connectionArgs = pickBridgeConnectionArgs(args);
  const steps = [];

  const root = await createBlockout2DRoot(client, payload);
  appendBlockoutStep(steps, "root", root.createdRoot);
  if (!root.createdRoot.ok) {
    return blockoutFailure("root", root.createdRoot, { steps, rootName: root.rootName });
  }

  const rootPath = resolveBlockout2DRootPath(root.createdRoot, root.rootName, payload.parentPath);
  const resourceContext = buildBlockout2DResourceContext(payload, root.rootName);
  const layout = buildBlockout2DLayout(payload);

  const ground = await createBlockout2DGround({
    connectionArgs,
    payload,
    rootPath,
    resourceContext,
    layout
  });
  appendBlockoutStep(steps, "ground", ground);
  if (!ground.ok) {
    return blockoutFailure("ground", ground, {
      steps,
      rootName: root.rootName,
      rootPath,
      resourceDirectory: resourceContext.resourceDirectory
    });
  }

  const player = await createBlockout2DPlayer({
    connectionArgs,
    payload,
    rootPath,
    resourceContext,
    layout
  });
  appendBlockoutStep(steps, "player", player.player);
  if (!player.player.ok) {
    return blockoutFailure("player", player.player, {
      steps,
      rootName: root.rootName,
      rootPath,
      resourceDirectory: resourceContext.resourceDirectory
    });
  }

  const playerPath = resolveBlockout2DPlayerPath(player.player, player.playerName, rootPath);
  const camera = await createBlockout2DCamera({
    connectionArgs,
    payload,
    playerPath,
    layout
  });
  appendBlockoutStep(steps, "camera", camera);
  if (!camera.ok) {
    return blockoutFailure("camera", camera, {
      steps,
      rootName: root.rootName,
      rootPath,
      resourceDirectory: resourceContext.resourceDirectory,
      playerPath
    });
  }

  const controller = await attachBlockout2DController({
    connectionArgs,
    payload,
    playerPath,
    resourceContext
  });
  appendBlockoutStep(steps, "controller", controller);
  if (!controller.ok) {
    return blockoutFailure("controller", controller, {
      steps,
      rootName: root.rootName,
      rootPath,
      resourceDirectory: resourceContext.resourceDirectory,
      playerPath
    });
  }

  return {
    ok: true,
    data: blockout2DSuccessData({
      rootName: root.rootName,
      rootPath,
      resourceContext,
      createdRoot: root.createdRoot,
      ground,
      player,
      camera,
      controller,
      steps
    })
  };
}
