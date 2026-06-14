export function blockout2DSuccessData({
  rootName,
  rootPath,
  resourceContext,
  createdRoot,
  ground,
  player,
  camera,
  controller,
  steps
}) {
  return {
    type: "2DPlayableBlockout",
    rootName,
    rootPath,
    resourceDirectory: resourceContext.resourceDirectory,
    resources: {
      groundShapePath: resourceContext.groundShapePath,
      groundTexturePath: resourceContext.groundTexturePath,
      playerShapePath: resourceContext.playerShapePath,
      playerTexturePath: resourceContext.playerTexturePath
    },
    root: createdRoot.data,
    ground: ground.data,
    player: player.player.data,
    camera: camera.data,
    controller: controller.data,
    scriptPath: controller.data.scriptPath,
    steps
  };
}
