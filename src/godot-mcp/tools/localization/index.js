import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import { LOCALIZATION_TOOL_MANIFEST } from "./manifest.js";

export const LOCALIZATION_TOOL_DEFINITIONS = toolDefinitionsFromManifest(LOCALIZATION_TOOL_MANIFEST);
