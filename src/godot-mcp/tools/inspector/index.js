import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import { INSPECTOR_TOOL_MANIFEST } from "./manifest.js";

export const INSPECTOR_TOOL_DEFINITIONS = toolDefinitionsFromManifest(INSPECTOR_TOOL_MANIFEST);
