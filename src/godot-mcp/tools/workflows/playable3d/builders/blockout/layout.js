import { normalizePositiveFiniteNumber } from "../../../../../shared/numbers.js";
import { vector3ToComponents } from "../../../../../shared/vectors.js";

export function buildBlockout3DLayout(payload) {
  const groundSize = vector3ToComponents(payload.groundSize ?? [24, 0.4, 24], "groundSize");
  const groundPosition = payload.groundPosition === undefined
    ? [0, -groundSize[1] / 2, 0]
    : vector3ToComponents(payload.groundPosition, "groundPosition");
  const playerRadius = normalizePositiveFiniteNumber(payload.playerRadius ?? 0.45, "playerRadius");
  const playerHeight = normalizePositiveFiniteNumber(payload.playerHeight ?? 1.8, "playerHeight");
  const playerPosition = payload.playerPosition === undefined
    ? [0, playerHeight / 2, 0]
    : vector3ToComponents(payload.playerPosition, "playerPosition");
  const cameraPosition = vector3ToComponents(payload.cameraPosition ?? [0, 2.4, 6], "cameraPosition");
  const cameraRotationDegrees = vector3ToComponents(
    payload.cameraRotationDegrees ?? [-18, 0, 0],
    "cameraRotationDegrees"
  );
  const lightRotationDegrees = vector3ToComponents(
    payload.lightRotationDegrees ?? [-55, -35, 0],
    "lightRotationDegrees"
  );

  return {
    groundSize,
    groundPosition,
    playerRadius,
    playerHeight,
    playerPosition,
    cameraPosition,
    cameraRotationDegrees,
    lightRotationDegrees
  };
}
