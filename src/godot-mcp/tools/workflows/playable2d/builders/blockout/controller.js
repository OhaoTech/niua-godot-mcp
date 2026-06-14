import { create2DCharacterController } from "../controller.js";

export async function attachBlockout2DController({
  connectionArgs,
  payload,
  playerPath,
  resourceContext
}) {
  return create2DCharacterController({
    ...connectionArgs,
    nodePath: playerPath,
    scriptPath: payload.scriptPath,
    className: payload.className,
    moveSpeed: payload.moveSpeed,
    jumpVelocity: payload.jumpVelocity,
    gravity: payload.gravity,
    overwriteScript: payload.overwriteScript ?? resourceContext.overwriteResources,
    validateAfterCreate: payload.validateAfterCreate,
    saveScene: payload.saveScene,
    configureInputMap: payload.configureInputMap,
    actionNames: payload.actionNames
  });
}
