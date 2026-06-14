import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import { UI_TOOL_MANIFEST } from "./manifest.js";

export const UI_TOOL_DEFINITIONS = toolDefinitionsFromManifest(UI_TOOL_MANIFEST);
