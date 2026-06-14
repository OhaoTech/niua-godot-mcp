import {
  createBlockout3DRoot,
  resolveBlockout3DRootPath
} from "./root.js";
import { buildBlockout3DResourceContext } from "./resources.js";
import { buildBlockout3DLayout } from "./layout.js";
import { createBlockout3DGround } from "./ground.js";
import {
  createBlockout3DPlayer,
  resolveBlockout3DPlayerPath
} from "./player.js";
import {
  createBlockout3DCamera,
  createBlockout3DLight
} from "./camera-light.js";
import { blockout3DSuccessData } from "./result.js";
import {
  assignBlockout3DWorkflowContext,
  blockout3DWorkflowSteps,
  captureBlockout3DStep,
  createBlockout3DWorkflowState
} from "./workflow-state.js";

export async function runCreate3DPlayableBlockoutWorkflow({
  client,
  payload,
  connectionArgs
}) {
  const state = createBlockout3DWorkflowState();

  const root = await createBlockout3DRoot(client, payload);
  assignBlockout3DWorkflowContext(state, { rootName: root.rootName });
  const rootFailure = captureBlockout3DStep(state, "root", root.createdRoot);
  if (rootFailure) {
    return rootFailure;
  }

  const rootPath = resolveBlockout3DRootPath(root.createdRoot, root.rootName, payload.parentPath);
  const resourceContext = buildBlockout3DResourceContext(payload, root.rootName);
  const resourceDirectory = resourceContext.resourceDirectory;
  const layout = buildBlockout3DLayout(payload);
  assignBlockout3DWorkflowContext(state, {
    rootPath,
    resourceDirectory
  });

  const ground = await createBlockout3DGround({
    connectionArgs,
    payload,
    rootPath,
    resourceContext,
    layout
  });
  const groundVisualFailure = captureBlockout3DStep(state, "groundVisual", ground.groundVisual);
  if (groundVisualFailure) {
    return groundVisualFailure;
  }
  const groundBodyFailure = captureBlockout3DStep(state, "groundBody", ground.groundBody);
  if (groundBodyFailure) {
    return groundBodyFailure;
  }

  const player = await createBlockout3DPlayer({
    connectionArgs,
    payload,
    rootPath,
    resourceContext,
    layout
  });
  const playerBodyFailure = captureBlockout3DStep(state, "playerBody", player.playerBody);
  if (playerBodyFailure) {
    return playerBodyFailure;
  }

  const playerPath = resolveBlockout3DPlayerPath(player.playerBody, player.playerName, rootPath);
  assignBlockout3DWorkflowContext(state, { playerPath });
  const playerVisualFailure = captureBlockout3DStep(state, "playerVisual", player.playerVisual);
  if (playerVisualFailure) {
    return playerVisualFailure;
  }

  const camera = await createBlockout3DCamera({
    connectionArgs,
    payload,
    playerPath,
    layout
  });
  const cameraFailure = captureBlockout3DStep(state, "camera", camera);
  if (cameraFailure) {
    return cameraFailure;
  }

  const light = await createBlockout3DLight({
    connectionArgs,
    payload,
    rootPath,
    layout
  });
  const lightFailure = captureBlockout3DStep(state, "light", light);
  if (lightFailure) {
    return lightFailure;
  }

  return {
    ok: true,
    data: blockout3DSuccessData({
      rootName: root.rootName,
      rootPath,
      resourceContext,
      createdRoot: root.createdRoot,
      ground,
      player,
      camera,
      light,
      steps: blockout3DWorkflowSteps(state)
    })
  };
}
