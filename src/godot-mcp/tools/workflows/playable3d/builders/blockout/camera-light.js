import { normalizeOptionalName } from "../../../../../shared/normalize.js";
import {
  createCamera3D,
  createLight3D
} from "../../../../nodes/node3d/index.js";

export async function createBlockout3DCamera({
  connectionArgs,
  payload,
  playerPath,
  layout
}) {
  return createCamera3D({
    ...connectionArgs,
    name: normalizeOptionalName(payload.cameraName, "ChaseCamera"),
    parentPath: playerPath,
    position: layout.cameraPosition,
    rotationDegrees: layout.cameraRotationDegrees,
    current: true,
    fov: payload.cameraFov ?? 70,
    near: 0.05,
    far: 400
  });
}

export async function createBlockout3DLight({
  connectionArgs,
  payload,
  rootPath,
  layout
}) {
  return createLight3D({
    ...connectionArgs,
    kind: "directional",
    name: normalizeOptionalName(payload.lightName, "KeyLight"),
    parentPath: rootPath,
    rotationDegrees: layout.lightRotationDegrees,
    energy: payload.lightEnergy ?? 1.6,
    shadowEnabled: true
  });
}
