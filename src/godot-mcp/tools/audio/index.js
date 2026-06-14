import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import { AUDIO_TOOL_MANIFEST } from "./manifest.js";

export const AUDIO_TOOL_DEFINITIONS = toolDefinitionsFromManifest(AUDIO_TOOL_MANIFEST);
