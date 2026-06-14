import { normalizeOptionalName } from "../../../../../shared/normalize.js";
import { createCamera2D } from "../../../../nodes/node2d/index.js";

export async function createBlockout2DCamera({
  connectionArgs,
  payload,
  playerPath,
  layout
}) {
  return createCamera2D({
    ...connectionArgs,
    name: normalizeOptionalName(payload.cameraName, "PlayerCamera"),
    parentPath: playerPath,
    position: layout.cameraPosition,
    zoom: layout.cameraZoom,
    enabled: true
  });
}
