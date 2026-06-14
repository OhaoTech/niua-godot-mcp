import { normalizePositiveFiniteNumber } from "../../../../../shared/numbers.js";
import { vector2ToComponents } from "../shared.js";

export function buildBlockout2DLayout(payload) {
  const groundSize = vector2ToComponents(payload.groundSize ?? [640, 48], "groundSize");
  const groundPosition = vector2ToComponents(payload.groundPosition ?? [0, 0], "groundPosition");
  const playerSize = vector2ToComponents(payload.playerSize ?? [32, 64], "playerSize");
  const playerPosition = vector2ToComponents(payload.playerPosition ?? [0, -80], "playerPosition");
  const cameraPosition = vector2ToComponents(payload.cameraPosition ?? [0, -80], "cameraPosition");
  const cameraZoom = vector2ToComponents(payload.cameraZoom ?? [1, 1], "cameraZoom");
  const playerRadius = normalizePositiveFiniteNumber(playerSize[0] / 2, "playerRadius");
  const playerHeight = normalizePositiveFiniteNumber(playerSize[1], "playerHeight");

  return {
    groundSize,
    groundPosition,
    playerSize,
    playerPosition,
    cameraPosition,
    cameraZoom,
    playerRadius,
    playerHeight
  };
}
