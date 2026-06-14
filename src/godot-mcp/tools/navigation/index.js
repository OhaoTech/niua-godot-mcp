import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import { NAVIGATION_TOOL_MANIFEST } from "./manifest.js";

export const NAVIGATION_TOOL_DEFINITIONS = toolDefinitionsFromManifest(NAVIGATION_TOOL_MANIFEST);
