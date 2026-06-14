import { toolDefinitionsFromManifest } from "../../../manifest/index.js";
import {
  create2DCharacterController,
  create2DPlayableBlockout,
  create2DTriggerZone
} from "./builders.js";
import { PLAYABLE2D_WORKFLOW_TOOL_MANIFEST } from "./manifest.js";

export { create2DCharacterController, create2DPlayableBlockout, create2DTriggerZone };

export const PLAYABLE2D_WORKFLOW_TOOL_DEFINITIONS = toolDefinitionsFromManifest(PLAYABLE2D_WORKFLOW_TOOL_MANIFEST, {
  localHandlers: {
    create2DPlayableBlockout,
    create2DCharacterController,
    create2DTriggerZone
  }
});
