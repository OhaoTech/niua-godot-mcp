export function blockout3DSuccessData({
  rootName,
  rootPath,
  resourceContext,
  createdRoot,
  ground,
  player,
  camera,
  light,
  steps
}) {
  return {
    type: "3DPlayableBlockout",
    rootName,
    rootPath,
    resourceDirectory: resourceContext.resourceDirectory,
    resources: {
      groundMeshPath: resourceContext.groundMeshPath,
      groundShapePath: resourceContext.groundShapePath,
      playerShapePath: resourceContext.playerShapePath,
      playerMeshPath: resourceContext.playerMeshPath
    },
    root: createdRoot.data,
    groundVisual: ground.groundVisual.data,
    ground: ground.groundBody.data,
    player: player.playerBody.data,
    playerVisual: player.playerVisual.data,
    camera: camera.data,
    light: light.data,
    steps
  };
}
