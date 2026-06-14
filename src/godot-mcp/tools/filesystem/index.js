import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import { FILESYSTEM_TOOL_MANIFEST } from "./manifest.js";

export const FILESYSTEM_TOOL_DEFINITIONS = toolDefinitionsFromManifest(FILESYSTEM_TOOL_MANIFEST);
