import { toolDefinitionsFromManifest } from "../../../manifest/index.js";
import { create3DCharacterController, create3DPlayableBlockout } from "./builders.js";
import { PLAYABLE3D_WORKFLOW_TOOL_MANIFEST } from "./manifest.js";

export { create3DCharacterController, create3DPlayableBlockout };

export const PLAYABLE3D_WORKFLOW_TOOL_DEFINITIONS = toolDefinitionsFromManifest(PLAYABLE3D_WORKFLOW_TOOL_MANIFEST, {
  localHandlers: {
    create3DPlayableBlockout,
    create3DCharacterController
  }
});
