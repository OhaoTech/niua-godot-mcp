import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import { PARTICLES_TOOL_MANIFEST } from "./manifest.js";

export const PARTICLES_TOOL_DEFINITIONS = toolDefinitionsFromManifest(PARTICLES_TOOL_MANIFEST);
