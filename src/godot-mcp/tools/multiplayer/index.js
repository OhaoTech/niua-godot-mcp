import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import { MULTIPLAYER_TOOL_MANIFEST } from "./manifest.js";

export const MULTIPLAYER_TOOL_DEFINITIONS = toolDefinitionsFromManifest(MULTIPLAYER_TOOL_MANIFEST);
